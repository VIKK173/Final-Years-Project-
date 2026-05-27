'use client';

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Clock, MapPin, Phone, User, Briefcase, IndianRupee } from 'lucide-react';
import { useBrowserNotifications } from '@/app/hooks/useBrowserNotifications';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  bookingCode: string;
  amount: number;
  service: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  address: {
    houseNo: string;
    flat?: string;
    street: string;
    city: string;
    pincode: string;
    pin?: string;
  };
  createdAt: string;
  urgency: string;
  actionRequired: boolean;
}

export function WorkerNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  
  const { requestPermission, showBookingNotification, isSupported } = useBrowserNotifications();

  // Request notification permission on mount
  useEffect(() => {
    if (isSupported) {
      requestPermission();
    }
  }, [isSupported, requestPermission]);

  // Fetch notifications every 10 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/worker/notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        
        // Show browser notifications for new bookings
        if (data.unreadCount > lastNotificationCount && data.notifications.length > 0) {
          const newNotifications = data.notifications.slice(0, data.unreadCount - lastNotificationCount);
          newNotifications.forEach((notification: Notification) => {
            if (notification.type === 'new_booking') {
              showBookingNotification(notification);
            }
          });
        }
        
        setLastNotificationCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/worker/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const acceptBooking = (notificationId: string) => {
    // Redirect to bookings page with accept action
    window.location.href = `/worker/bookings?accept=${notificationId}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate2-600 hover:text-brand-600 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-slate2-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-white/90 mt-1">
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-80">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-slate2-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-slate2-300" />
                <p className="font-medium">No new notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border-b border-slate2-100 p-4 hover:bg-slate2-50 transition-colors"
                >
                  {/* Notification Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        notification.urgency === 'high' ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                      }`} />
                      <span className="font-semibold text-sm text-slate2-900">
                        {notification.title}
                      </span>
                    </div>
                    <span className="text-xs text-slate2-500">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-slate2-600 mb-3">
                    {notification.message}
                  </p>

                  {/* Booking Details */}
                  <div className="bg-slate2-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{notification.service}</span>
                      <span className="flex items-center gap-1 text-green-600 font-bold text-sm">
                        <IndianRupee className="h-3 w-3" />
                        {notification.amount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate2-600 mb-1">
                      <Briefcase className="h-3 w-3" />
                      <span>{notification.bookingCode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate2-600 mb-1">
                      <User className="h-3 w-3" />
                      <span>{notification.customer.name}</span>
                      <Phone className="h-3 w-3 ml-2" />
                      <span>{notification.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate2-600">
                      <MapPin className="h-3 w-3" />
                      <span>{notification.address?.houseNo || notification.address?.flat || ''} {notification.address?.street || ''}, {notification.address?.city || ''} - {notification.address?.pincode || notification.address?.pin || ''}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {notification.actionRequired && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptBooking(notification.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex-1 bg-slate2-200 hover:bg-slate2-300 text-slate2-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
