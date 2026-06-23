# Multi-stage build to keep production image size minimal
# --- Stage 1: Build ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package descriptors
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy full application source
COPY . .

# Build Vite client files & bundle Express server CJS output
RUN npm run build

# Remove development dependencies to keep final container lightweight
RUN npm prune --production


# --- Stage 2: Production Runtime ---
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Set production environment variable
ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary production files from build stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Create a non-root group and user for security hardening
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /usr/src/app

# Switch to the non-root user
USER nodejs

# Expose port 3000
EXPOSE 3000

# Health check setup for container health tracking
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/v1/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Boot up precompiled CJS distribution server
CMD ["npm", "run", "start"]
