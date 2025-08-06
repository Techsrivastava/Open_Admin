"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import socketService from '@/lib/services/socket-service';
import { 
  getAllNotifications, 
  getUserNotifications, 
  markNotificationAsRead,
  markAllUserNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  Notification,
  CreateNotificationData,
  sendCustomNotification
} from '@/app/api/notification-controller';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  stats: {
    total: number;
    unread: number;
    read: number;
    byType: Record<string, number>;
  };
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  fetchUserNotifications: (userId: string) => Promise<void>;
  sendNotification: (data: CreateNotificationData) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotificationById: (notificationId: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  userId?: string; // For customer notifications
  isAdmin?: boolean; // For admin notifications
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  userId, 
  isAdmin = false 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    byType: {} as Record<string, number>
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection and listeners
  useEffect(() => {
    // Join appropriate room based on user type
    if (isAdmin) {
      socketService.joinAdminRoom();
    } else if (userId) {
      socketService.joinCustomerRoom(userId);
    }

    // Listen for real-time notifications
    const unsubscribeNotification = socketService.onNotification((data) => {
      console.log('Received real-time notification:', data);
      
      // Add new notification to the list
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
      setTotalCount(prev => prev + 1);
      
      // Show toast notification
      toast({
        title: data.type.toUpperCase(),
        description: data.message,
        duration: 5000,
      });
    });

    // Listen for admin notifications
    const unsubscribeAdminNotification = socketService.onAdminNotification((data) => {
      console.log('Received admin notification:', data);
      
      if (isAdmin) {
        // Add new notification to the list
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
        setTotalCount(prev => prev + 1);
        
        // Show toast notification
        toast({
          title: "New Booking",
          description: data.message,
          duration: 5000,
        });
      }
    });

    // Listen for connection changes
    const unsubscribeConnection = socketService.onConnectionChange((connected) => {
      console.log('Socket connection status:', connected);
      if (!connected) {
        toast({
          title: "Connection Lost",
          description: "Real-time notifications are temporarily unavailable",
          variant: "destructive",
        });
      }
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeNotification();
      unsubscribeAdminNotification();
      unsubscribeConnection();
      
      if (userId) {
        socketService.leaveRoom(userId);
      }
    };
  }, [userId, isAdmin]);

  // Fetch notifications based on user type
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedNotifications: Notification[];
      
      if (isAdmin) {
        fetchedNotifications = await getAllNotifications();
      } else if (userId) {
        fetchedNotifications = await getUserNotifications(userId);
      } else {
        fetchedNotifications = [];
      }
      
      setNotifications(fetchedNotifications);
      setTotalCount(fetchedNotifications.length);
      setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user-specific notifications
  const fetchUserNotifications = async (targetUserId: string) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedNotifications = await getUserNotifications(targetUserId);
      setNotifications(fetchedNotifications);
      setTotalCount(fetchedNotifications.length);
      setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user notifications');
      console.error('Error fetching user notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send custom notification
  const sendNotification = async (data: CreateNotificationData) => {
    try {
      const newNotification = await sendCustomNotification(data);
      
      // Add to local state if it's for the current user
      if (data.userId === userId || isAdmin) {
        setNotifications(prev => [newNotification, ...prev]);
        setTotalCount(prev => prev + 1);
        if (!newNotification.read) {
          setUnreadCount(prev => prev + 1);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send notification');
      throw err;
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
      throw err;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (targetUserId: string) => {
    try {
      await markAllUserNotificationsAsRead(targetUserId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
      throw err;
    }
  };

  // Delete notification
  const deleteNotificationById = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      
      // Remove from local state
      setNotifications(prev => {
        const notification = prev.find(n => n._id === notificationId);
        const newNotifications = prev.filter(n => n._id !== notificationId);
        setTotalCount(newNotifications.length);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return newNotifications;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification');
      throw err;
    }
  };

  // Fetch notification statistics
  const fetchStats = async () => {
    try {
      const fetchedStats = await getNotificationStats();
      setStats(fetchedStats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notification statistics');
      console.error('Error fetching notification stats:', err);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Initial fetch
  useEffect(() => {
    if (isAdmin || userId) {
      fetchNotifications();
      if (isAdmin) {
        fetchStats();
      }
    }
  }, [isAdmin, userId]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    totalCount,
    stats,
    loading,
    error,
    fetchNotifications,
    fetchUserNotifications,
    sendNotification,
    markAsRead,
    markAllAsRead,
    deleteNotificationById,
    fetchStats,
    clearError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 