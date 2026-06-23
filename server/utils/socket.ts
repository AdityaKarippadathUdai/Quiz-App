import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;
const activeUsers = new Map<string, { username: string; activeQuizId?: string }>();

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.APP_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    // Join specialized lobby room
    socket.join("lobby");

    // Handle user registration/presence awareness
    socket.on("user_joined", (data: { userId: string; username: string }) => {
      activeUsers.set(socket.id, { username: data.username });
      socket.data.userId = data.userId;
      socket.data.username = data.username;
      
      console.log(`[SOCKET] User ${data.username} logged into real-time session.`);
      io?.to("lobby").emit("presence_update", Array.from(activeUsers.values()));
    });

    // Handle quiz session active monitoring
    socket.on("quiz_started", (data: { quizId: string; title: string }) => {
      const user = activeUsers.get(socket.id);
      if (user) {
        user.activeQuizId = data.quizId;
        console.log(`[SOCKET] ${user.username} started taking quiz: "${data.title}"`);
        io?.to("lobby").emit("presence_update", Array.from(activeUsers.values()));
      }
    });

    // Handle disconnecting client
    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        console.log(`[SOCKET] User ${user.username} disconnected.`);
        activeUsers.delete(socket.id);
        io?.to("lobby").emit("presence_update", Array.from(activeUsers.values()));
      } else {
        console.log(`[SOCKET] Connection terminated: ${socket.id}`);
      }
    });
  });

  return io;
}

export function getSocketIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO has not been initialized. Call initSocketServer first.");
  }
  return io;
}

/**
 * Broadcasts a system notification to all logged in sessions
 */
export function broadcastNotification(title: string, message: string, type = "info") {
  try {
    const ioInstance = getSocketIO();
    ioInstance.to("lobby").emit("notification", {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
    });
    console.log(`[SOCKET] Broadcasted notification: "${title}"`);
  } catch (err: any) {
    console.warn("[SOCKET] Socket.IO server not fully bound yet. Skipping notification broadcast.");
  }
}

/**
 * Broadcasts leaderboard updates in real-time
 */
export function broadcastLeaderboardUpdate(quizId: string, scores: any[]) {
  try {
    const ioInstance = getSocketIO();
    ioInstance.to("lobby").emit("leaderboard_update", {
      quizId,
      scores,
      updatedAt: new Date().toISOString(),
    });
    console.log(`[SOCKET] Broadcasted leaderboard updates for quiz ${quizId}`);
  } catch (err: any) {
    console.warn("[SOCKET] Socket.IO server not bound. Skipping leaderboard sync.");
  }
}
