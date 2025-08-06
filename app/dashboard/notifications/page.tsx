"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Bell, Send, Trash2, Check, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useNotifications } from "@/contexts/notification-context";
import { customerService } from "@/services/customerService";

interface Customer {
  _id: string;
  name: string;
  email: string;
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    totalCount,
    stats,
    loading,
    error,
    sendNotification,
    markAsRead,
    markAllAsRead,
    deleteNotificationById,
    fetchNotifications,
    clearError
  } = useNotifications();

  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [notificationType, setNotificationType] = useState("custom");
  const [sending, setSending] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Fetch customers for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      setCustomersLoading(true);
      try {
        const response = await customerService.getAllCustomers();
        setCustomers(response.data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setCustomersLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Send custom notification
  const handleSendNotification = async () => {
    if (!userId || !message.trim()) return;
    
    setSending(true);
    try {
      await sendNotification({
        message: message.trim(),
        type: notificationType,
        userId,
        sentBy: "Admin",
      });
      setMessage("");
      setUserId("");
      setNotificationType("custom");
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setSending(false);
    }
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteNotificationById(notificationId);
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (notifications.length > 0) {
      try {
        await markAllAsRead("all"); // This will mark all admin notifications as read
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    }
  };

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Manage and send notifications to customers</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              {unreadCount} unread
            </Badge>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>     
              <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Read</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.read}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications.filter(n => {
                  const today = new Date();
                  const notificationDate = new Date(n.createdAt);
                  return today.toDateString() === notificationDate.toDateString();
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Send Notification Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Send Custom Notification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customersLoading ? (
                    <SelectItem value="" disabled>Loading customers...</SelectItem>
                  ) : (
                    customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name} ({customer.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Notification Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="md:col-span-1"
              />
              
              <Button 
                onClick={handleSendNotification} 
                disabled={sending || !userId || !message.trim()}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Notifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Notifications ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No notifications found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Sent By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => {
                    const customer = customers.find(c => c._id === notification.userId);
                    return (
                      <TableRow key={notification._id}>
                        <TableCell>
                          <Badge variant={notification.type === 'booking' ? 'default' : 'secondary'}>
                            {notification.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {notification.message}
                        </TableCell>
                        <TableCell>
                          {customer ? `${customer.name} (${customer.email})` : notification.userId}
                        </TableCell>
                        <TableCell>{notification.sentBy}</TableCell>
                        <TableCell>{format(new Date(notification.createdAt), "MMM dd, yyyy HH:mm")}</TableCell>
                        <TableCell>
                          <Badge variant={notification.read ? "secondary" : "destructive"}>
                            {notification.read ? "Read" : "Unread"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification._id)}
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification._id)}
                              title="Delete notification"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 