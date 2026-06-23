import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../features/auth/components/AuthProvider.js";
import { motion, AnimatePresence } from "motion/react";
import { X, Bell, Trophy, Info, AlertTriangle } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeUsers: any[];
  notifications: NotificationItem[];
  addManualNotification: (title: string, message: string, type?: string) => void;
  removeNotification: (id: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addManualNotification = (title: string, message: string, type = "info") => {
    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 5)); // Limit to 5 alerts
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeNotification(newNotif.id);
    }, 5000);
  };

  useEffect(() => {
    // Only connect when user is authenticated
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsConnected(false);
      return;
    }

    // Connect to same host as backend (window.location.origin)
    const backendUrl = window.location.origin;
    console.log(`[SOCKET_CLIENT] Initiating connection to: ${backendUrl}`);

    const socketInstance = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log(`[SOCKET_CLIENT] Successfully connected! SocketID: ${socketInstance.id}`);
      setIsConnected(true);

      // Register identity
      socketInstance.emit("user_joined", {
        userId: user.id || (user as any)._id,
        username: user.name || user.email,
      });
    });

    socketInstance.on("disconnect", (reason) => {
      console.log(`[SOCKET_CLIENT] Disconnected: ${reason}`);
      setIsConnected(false);
    });

    // Real-time system notifications
    socketInstance.on("notification", (data: NotificationItem) => {
      console.log(`[SOCKET_CLIENT] Notification received:`, data);
      setNotifications((prev) => [data, ...prev].slice(0, 5));
      
      // Auto dismiss
      setTimeout(() => {
        removeNotification(data.id);
      }, 5000);
    });

    // Presence updates
    socketInstance.on("presence_update", (users: any[]) => {
      setActiveUsers(users);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Trophy className="h-5 w-5 text-emerald-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeUsers,
        notifications,
        addManualNotification,
        removeNotification,
      }}
    >
      {children}

      {/* Real-time floating Notification stack */}
      <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="pointer-events-auto flex items-start space-x-3.5 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95"
            >
              <div className="rounded-xl bg-gray-50 p-2 dark:bg-zinc-800">
                {getNotificationIcon(notif.type)}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                  {notif.title}
                </p>
                <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-zinc-400">
                  {notif.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notif.id)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:text-zinc-500 dark:hover:bg-zinc-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
