# 📢 Trippy Notification System — Complete Implementation

This document provides a comprehensive guide to the notification system implemented for the Trippy Admin Panel.

## 🏗️ System Architecture

### Backend Components
- **Notification API Endpoints** - RESTful API for notification management
- **Socket.IO Integration** - Real-time notification delivery
- **MongoDB Storage** - Persistent notification storage

### Frontend Components
- **Notification Context** - Global state management
- **Socket Service** - Real-time connection management
- **Notification Bell** - UI component for notification display
- **Notifications Page** - Admin interface for notification management

## 📁 File Structure

```
trippy_Admin/
├── app/
│   ├── api/
│   │   └── notification-controller.ts     # API functions for notifications
│   └── dashboard/
│       └── notifications/
│           └── page.tsx                   # Admin notifications page
├── components/
│   ├── notification-bell.tsx              # Notification bell component
│   └── dashboard-layout.tsx               # Updated with notification bell
├── contexts/
│   └── notification-context.tsx           # Global notification state
├── lib/
│   └── services/
│       └── socket-service.ts              # Socket.IO connection service
└── app/
    └── layout.tsx                         # Root layout with notification provider
```

## 🔧 Backend API Endpoints

### Base URL
```
https://openbacken-production.up.railway.app/api
```

### Notification Endpoints

#### 1. Send Custom Notification
```http
POST /api/notifications/send
Content-Type: application/json

{
  "message": "Special offer! Book now and get 10% off.",
  "type": "marketing",
  "userId": "CUSTOMER_OBJECT_ID",
  "sentBy": "Admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "notificationId",
    "message": "Special offer! Book now and get 10% off.",
    "type": "marketing",
    "userId": "CUSTOMER_OBJECT_ID",
    "sentBy": "Admin",
    "createdAt": "2024-07-01T12:00:00.000Z",
    "read": false
  }
}
```

#### 2. Get All Notifications (Admin)
```http
GET /api/notifications
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "notificationId",
      "message": "Your booking has been confirmed!",
      "type": "booking",
      "userId": "CUSTOMER_OBJECT_ID",
      "sentBy": "System",
      "createdAt": "2024-07-01T12:00:00.000Z",
      "read": false
    }
  ]
}
```

#### 3. Get User Notifications
```http
GET /api/notifications/user?userId=CUSTOMER_OBJECT_ID
```

#### 4. Mark Notification as Read
```http
PATCH /api/notifications/{notificationId}/read
```

#### 5. Mark All User Notifications as Read
```http
PATCH /api/notifications/user/{userId}/read-all
```

#### 6. Delete Notification
```http
DELETE /api/notifications/{notificationId}
```

#### 7. Get Notification Statistics
```http
GET /api/notifications/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "unread": 25,
    "read": 125,
    "byType": {
      "booking": 80,
      "marketing": 40,
      "payment": 20,
      "custom": 10
    }
  }
}
```

### Booking Endpoints (with notifications)

#### Create Booking (triggers notifications)
```http
POST /api/bookings/create
Content-Type: application/json

{
  "customer": "CUSTOMER_OBJECT_ID",
  "package": "PACKAGE_OBJECT_ID",
  "travelDate": "2024-08-15",
  "amount": 15000,
  "participants": 2,
  "bookedBy": "Self",
  "advance": 5000
}
```

**Automatically sends notifications to:**
- Customer (via Socket.IO room)
- Admin (via Socket.IO broadcast)

## 🔌 Socket.IO Events

### Backend Events (Emitted)
- `notification` - Sent to specific customer
- `adminNotification` - Sent to all connected admin clients

### Frontend Events (Listen)
- `notification` - Customer receives their notifications
- `adminNotification` - Admin receives booking notifications

### Connection Management
```javascript
// Join customer room
socket.emit("join", userId);

// Join admin room
socket.emit("joinAdmin");

// Leave room
socket.emit("leave", roomId);
```

## 🎨 Frontend Components

### 1. Notification Context (`contexts/notification-context.tsx`)

Global state management for notifications with real-time updates.

**Features:**
- Real-time notification updates
- Automatic toast notifications
- Connection status monitoring
- Error handling

**Usage:**
```jsx
import { useNotifications } from '@/contexts/notification-context';

const MyComponent = () => {
  const {
    notifications,
    unreadCount,
    sendNotification,
    markAsRead,
    deleteNotificationById
  } = useNotifications();

  // Use notification functions
};
```

### 2. Socket Service (`lib/services/socket-service.ts`)

Manages Socket.IO connections with automatic reconnection and event handling.

**Features:**
- Automatic reconnection
- Event listener management
- Connection status tracking
- Error handling

**Usage:**
```jsx
import socketService from '@/lib/services/socket-service';

// Join admin room
socketService.joinAdminRoom();

// Listen for notifications
const unsubscribe = socketService.onNotification((data) => {
  console.log('New notification:', data);
});

// Cleanup
unsubscribe();
```

### 3. Notification Bell (`components/notification-bell.tsx`)

UI component showing unread count and recent notifications.

**Features:**
- Unread count badge
- Recent notifications dropdown
- Mark as read functionality
- Delete notifications
- Navigation to full notifications page

### 4. Notifications Page (`app/dashboard/notifications/page.tsx`)

Complete admin interface for notification management.

**Features:**
- Statistics dashboard
- Send custom notifications
- View all notifications
- Filter by type
- Bulk actions (mark all read)
- Customer selection dropdown

## 🚀 Implementation Guide

### 1. Setup Notification Provider

Wrap your app with the NotificationProvider in `app/layout.tsx`:

```jsx
import { NotificationProvider } from '@/contexts/notification-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NotificationProvider isAdmin={true}>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

### 2. Add Notification Bell to Layout

Update your dashboard layout to include the notification bell:

```jsx
import { NotificationBell } from '@/components/notification-bell';

// In your header
<div className="ml-auto flex items-center gap-4">
  <NotificationBell isAdmin={true} />
  {/* Other header items */}
</div>
```

### 3. Use Notification Context

In any component that needs notification functionality:

```jsx
import { useNotifications } from '@/contexts/notification-context';

const MyComponent = () => {
  const { sendNotification, unreadCount } = useNotifications();

  const handleSendNotification = async () => {
    await sendNotification({
      message: "Hello from admin!",
      type: "custom",
      userId: "customerId",
      sentBy: "Admin"
    });
  };

  return (
    <div>
      <p>Unread notifications: {unreadCount}</p>
      <button onClick={handleSendNotification}>Send Notification</button>
    </div>
  );
};
```

## 📊 Notification Types

The system supports various notification types:

- **booking** - Booking-related notifications
- **marketing** - Promotional notifications
- **payment** - Payment-related notifications
- **custom** - Custom admin notifications
- **reminder** - Reminder notifications

## 🔒 Security Considerations

1. **Authentication** - All API endpoints require proper authentication
2. **Authorization** - Admin-only endpoints are protected
3. **Input Validation** - All inputs are validated on both frontend and backend
4. **Rate Limiting** - Implement rate limiting for notification sending
5. **Data Sanitization** - All user inputs are sanitized

## 🧪 Testing

### API Testing
```bash
# Test notification sending
curl -X POST https://openbacken-production.up.railway.app/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test notification",
    "type": "custom",
    "userId": "testUserId",
    "sentBy": "Admin"
  }'

# Test getting notifications
curl https://openbacken-production.up.railway.app/api/notifications
```

### Frontend Testing
1. Open browser developer tools
2. Check Socket.IO connection in Network tab
3. Test notification bell functionality
4. Verify real-time updates

## 🐛 Troubleshooting

### Common Issues

1. **Socket.IO Connection Failed**
   - Check backend URL in socket-service.ts
   - Verify CORS configuration
   - Check network connectivity

2. **Notifications Not Showing**
   - Verify NotificationProvider is wrapping the app
   - Check browser console for errors
   - Verify API endpoints are working

3. **Real-time Updates Not Working**
   - Check Socket.IO connection status
   - Verify event listeners are properly set up
   - Check backend Socket.IO implementation

### Debug Mode

Enable debug logging in socket-service.ts:

```javascript
// Add this to see detailed connection logs
this.socket = io("https://openbacken-production.up.railway.app/", {
  debug: true,
  // ... other options
});
```

## 📈 Performance Optimization

1. **Pagination** - Implement pagination for large notification lists
2. **Caching** - Cache frequently accessed notifications
3. **Debouncing** - Debounce notification sending to prevent spam
4. **Lazy Loading** - Load notifications on demand
5. **WebSocket Optimization** - Use WebSocket compression

## 🔄 Future Enhancements

1. **Push Notifications** - Browser push notifications
2. **Email Integration** - Send notifications via email
3. **SMS Integration** - Send notifications via SMS
4. **Notification Templates** - Predefined notification templates
5. **Scheduled Notifications** - Send notifications at specific times
6. **Notification Analytics** - Track notification engagement
7. **Multi-language Support** - Internationalization for notifications

## 📝 API Documentation

For complete API documentation, refer to the backend repository or API documentation endpoint.

## 🤝 Contributing

When contributing to the notification system:

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Add tests for new functionality
5. Update this documentation

## 📞 Support

For questions or issues with the notification system:

1. Check the troubleshooting section
2. Review the browser console for errors
3. Verify API endpoints are accessible
4. Contact the development team

---

**Last Updated:** July 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅ 