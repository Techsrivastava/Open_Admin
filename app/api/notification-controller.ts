import axios from "axios";
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = 'https://openbacken-production.up.railway.app/api';

export interface Notification {
  _id: string;
  type: string;
  message: string;
  userId: string;
  sentBy: string;
  createdAt: string;
  read: boolean;
}

export interface CreateNotificationData {
  message: string;
  type: string;
  userId: string;
  sentBy: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification | Notification[];
  message?: string;
}

// Send custom notification (Admin)
export const sendCustomNotification = async (data: CreateNotificationData): Promise<Notification> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/notifications/send`, data);
    toast({
      title: "Success",
      description: "Notification sent successfully",
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Error sending notification:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to send notification",
      variant: "destructive",
    });
    throw error;
  }
};

// Get all notifications (Admin view)
export const getAllNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications`);
    return response.data.data || [];
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to fetch notifications",
      variant: "destructive",
    });
    throw error;
  }
};

// Get user-specific notifications
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications/user?userId=${userId}`);
    return response.data.data || [];
  } catch (error: any) {
    console.error("Error fetching user notifications:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to fetch user notifications",
      variant: "destructive",
    });
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/read`);
    toast({
      title: "Success",
      description: "Notification marked as read",
    });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to mark notification as read",
      variant: "destructive",
    });
    throw error;
  }
};

// Mark all user notifications as read
export const markAllUserNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    await axios.patch(`${API_BASE_URL}/notifications/user/${userId}/read-all`);
    toast({
      title: "Success",
      description: "All notifications marked as read",
    });
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to mark notifications as read",
      variant: "destructive",
    });
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`);
    toast({
      title: "Success",
      description: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to delete notification",
      variant: "destructive",
    });
    throw error;
  }
};

// Get notification statistics
export const getNotificationStats = async (): Promise<{
  total: number;
  unread: number;
  read: number;
  byType: Record<string, number>;
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications/stats`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching notification stats:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to fetch notification statistics",
      variant: "destructive",
    });
    throw error;
  }
}; 