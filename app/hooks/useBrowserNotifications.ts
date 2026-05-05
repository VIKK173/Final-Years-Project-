'use client';

import { useEffect, useState } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);
      return newPermission === 'granted';
    }

    return false;
  };

  const showNotification = (options: NotificationOptions) => {
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
    });

    // Auto-close after 5 seconds unless requireInteraction is true
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Handle click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  };

  const showBookingNotification = (booking: any) => {
    return showNotification({
      title: '🔔 New Service Request!',
      body: `${booking.customer?.name || 'Customer'} needs ${booking.service || 'service'} - ₹${booking.amount}`,
      icon: '/favicon.ico',
      tag: `booking-${booking.id}`,
      requireInteraction: true,
    });
  };

  return {
    permission,
    requestPermission,
    showNotification,
    showBookingNotification,
    isSupported: 'Notification' in window,
  };
}
