import Redis from "ioredis";

// In-Memory cache fallback when Redis is offline or not configured
class LocalCacheFallback {
  private cache = new Map<string, { value: string; expiry: number | null }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string): Promise<string> {
    this.cache.set(key, { value, expiry: null });
    return "OK";
  }

  async setex(key: string, seconds: number, value: string): Promise<string> {
    const expiry = Date.now() + seconds * 1000;
    this.cache.set(key, { value, expiry });
    return "OK";
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key];
    let deletedCount = 0;
    for (const k of keys) {
      if (this.cache.delete(k)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async keys(pattern: string): Promise<string[]> {
    const allKeys = Array.from(this.cache.keys());
    const regexPattern = pattern.replace(/\*/g, ".*");
    const regex = new RegExp(`^${regexPattern}$`);
    return allKeys.filter((k) => regex.test(k));
  }
}

let redisClient: Redis | LocalCacheFallback | null = null;
let isRedisAvailable = false;

export function getRedisClient() {
  if (redisClient) return { client: redisClient, isRedisAvailable };

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.log("[REDIS] No REDIS_URL configured. Falling back to clean in-memory cache engine.");
    redisClient = new LocalCacheFallback();
    isRedisAvailable = false;
    return { client: redisClient, isRedisAvailable };
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) {
          console.log("[REDIS] Connection attempts exceeded limit. Switching to in-memory fallback.");
          return null; // stop retrying
        }
        return Math.min(times * 100, 2000);
      },
    });

    client.on("connect", () => {
      console.log("[REDIS] Connection successfully established.");
      isRedisAvailable = true;
    });

    client.on("error", (err) => {
      console.error("[REDIS] Client error encountered:", err.message);
      // If we fail to connect, degrade gracefully to LocalCacheFallback
      if (!isRedisAvailable && !(redisClient instanceof LocalCacheFallback)) {
        console.log("[REDIS] Degrading to in-memory fallback cache engine.");
        redisClient = new LocalCacheFallback();
      }
    });

    redisClient = client;
  } catch (error) {
    console.error("[REDIS] Initialization failed. Utilizing local fallback:", error);
    redisClient = new LocalCacheFallback();
    isRedisAvailable = false;
  }

  return { client: redisClient, isRedisAvailable };
}

/**
 * Higher-order helper to wrap database fetches with automatic Redis/In-Memory caching
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const { client } = getRedisClient();

  try {
    const cachedData = await client.get(key);
    if (cachedData) {
      console.log(`[CACHE HIT] Key: "${key}"`);
      return JSON.parse(cachedData) as T;
    }
  } catch (err) {
    console.error(`[CACHE ERROR] Failed to fetch key "${key}":`, err);
  }

  console.log(`[CACHE MISS] Key: "${key}". Fetching fresh data...`);
  const freshData = await fetchFn();

  try {
    const serialized = JSON.stringify(freshData);
    await client.setex(key, ttlSeconds, serialized);
  } catch (err) {
    console.error(`[CACHE ERROR] Failed to set key "${key}":`, err);
  }

  return freshData;
}

/**
 * Clear cached keys matching a specific pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const { client } = getRedisClient();
  try {
    if (client instanceof Redis) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        console.log(`[CACHE INVALIDATE] Removed keys matching pattern: "${pattern}" (${keys.length} keys)`);
      }
    } else {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        console.log(`[CACHE INVALIDATE] Removed local keys matching: "${pattern}" (${keys.length} keys)`);
      }
    }
  } catch (err) {
    console.error(`[CACHE ERROR] Failed to invalidate pattern "${pattern}":`, err);
  }
}
