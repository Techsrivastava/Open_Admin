import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Socket event listeners
  private notificationListeners: ((data: any) => void)[] = [];
  private adminNotificationListeners: ((data: any) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    try {
      // Connect to your backend Socket.IO server
      this.socket = io("https://openbacken-production.up.railway.app/", {
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize socket:", error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.isConnected = false;
      this.notifyConnectionListeners(false);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
      }
    });

    // Notification events
    this.socket.on("notification", (data) => {
      console.log("Received notification:", data);
      this.notifyNotificationListeners(data);
    });

    this.socket.on("adminNotification", (data) => {
      console.log("Received admin notification:", data);
      this.notifyAdminNotificationListeners(data);
    });

    // Reconnection events
    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
    });
  }

  // Join customer room
  public joinCustomerRoom(userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit("join", userId);
      console.log("Joined customer room:", userId);
    } else {
      console.warn("Socket not connected, cannot join room");
    }
  }

  // Join admin room
  public joinAdminRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit("joinAdmin");
      console.log("Joined admin room");
    } else {
      console.warn("Socket not connected, cannot join admin room");
    }
  }

  // Leave room
  public leaveRoom(roomId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit("leave", roomId);
      console.log("Left room:", roomId);
    }
  }

  // Add notification listener
  public onNotification(callback: (data: any) => void) {
    this.notificationListeners.push(callback);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(cb => cb !== callback);
    };
  }

  // Add admin notification listener
  public onAdminNotification(callback: (data: any) => void) {
    this.adminNotificationListeners.push(callback);
    return () => {
      this.adminNotificationListeners = this.adminNotificationListeners.filter(cb => cb !== callback);
    };
  }

  // Add connection status listener
  public onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  // Notify listeners
  private notifyNotificationListeners(data: any) {
    this.notificationListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in notification listener:", error);
      }
    });
  }

  private notifyAdminNotificationListeners(data: any) {
    this.adminNotificationListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in admin notification listener:", error);
      }
    });
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error("Error in connection listener:", error);
      }
    });
  }

  // Get connection status
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Get socket instance
  public getSocket(): Socket | null {
    return this.socket;
  }

  // Disconnect socket
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Reconnect socket
  public reconnect() {
    this.disconnect();
    setTimeout(() => {
      this.initializeSocket();
    }, 1000);
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 