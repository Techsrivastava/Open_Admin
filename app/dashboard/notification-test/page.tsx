"use client";

import React from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { NotificationExample } from '@/components/notification-example';

export default function NotificationTestPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Notification System Test</h1>
          <p className="text-muted-foreground">
            Test and demonstrate the notification system functionality
          </p>
        </div>
        
        <NotificationExample />
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">How to Test:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Send individual notifications to specific customers</li>
            <li>• Send bulk notifications to all customers</li>
            <li>• Check the notification bell in the header for real-time updates</li>
            <li>• Visit the main notifications page for full management</li>
            <li>• Monitor browser console for Socket.IO connection status</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
} 