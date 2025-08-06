"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bell, Users } from 'lucide-react';
import { useNotifications } from '@/contexts/notification-context';
import { customerService } from '@/services/customerService';

interface Customer {
  _id: string;
  name: string;
  email: string;
}

export const NotificationExample: React.FC = () => {
  const { sendNotification, unreadCount, notifications } = useNotifications();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('custom');
  const [loading, setLoading] = useState(false);

  // Load customers on component mount
  React.useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await customerService.getAllCustomers();
        setCustomers(response.data || []);
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    };
    loadCustomers();
  }, []);

  const handleSendNotification = async () => {
    if (!selectedCustomer || !message.trim()) return;

    setLoading(true);
    try {
      await sendNotification({
        message: message.trim(),
        type,
        userId: selectedCustomer,
        sentBy: 'Admin',
      });
      
      // Clear form
      setMessage('');
      setSelectedCustomer('');
      setType('custom');
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendBulkNotification = async () => {
    if (!message.trim() || customers.length === 0) return;

    setLoading(true);
    try {
      // Send to all customers
      const promises = customers.map(customer =>
        sendNotification({
          message: message.trim(),
          type: 'marketing',
          userId: customer._id,
          sentBy: 'Admin',
        })
      );

      await Promise.all(promises);
      setMessage('');
      setType('custom');
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification System Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
              <div className="text-sm text-blue-600">Unread Notifications</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{notifications.length}</div>
              <div className="text-sm text-green-600">Total Notifications</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{customers.length}</div>
              <div className="text-sm text-purple-600">Total Customers</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Send Individual Notification</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.name} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
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
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="md:col-span-1"
              />

              <Button
                onClick={handleSendNotification}
                disabled={loading || !selectedCustomer || !message.trim()}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {loading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Send Bulk Notification</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Bulk message to all customers"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="md:col-span-2"
              />
              <Button
                onClick={sendBulkNotification}
                disabled={loading || !message.trim() || customers.length === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                {loading ? 'Sending...' : `Send to ${customers.length} customers`}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-4">Recent Notifications</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-center text-gray-500 py-4">No notifications yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 