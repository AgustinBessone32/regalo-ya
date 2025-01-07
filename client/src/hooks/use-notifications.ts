import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const { toast } = useToast();

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  // Send notification
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      try {
        new Notification(title, options);
      } catch (error) {
        console.error('Error sending notification:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send notification",
        });
      }
    }
  }, [permission, toast]);

  // Schedule notification
  const scheduleNotification = useCallback((
    date: Date,
    intervals: number[] = [1, 7, 30], // Default intervals in days
    eventTitle: string
  ) => {
    if (permission !== 'granted') return;

    const now = new Date();
    intervals.forEach(days => {
      const notificationDate = new Date(date);
      notificationDate.setDate(notificationDate.getDate() - days);
      
      if (notificationDate > now) {
        const timeout = notificationDate.getTime() - now.getTime();
        setTimeout(() => {
          sendNotification(
            `${eventTitle} - ${days} day${days === 1 ? '' : 's'} remaining!`,
            {
              body: `The event will take place on ${date.toLocaleDateString()}`,
              icon: '/favicon.ico',
            }
          );
        }, timeout);
      }
    });
  }, [permission, sendNotification]);

  return {
    permission,
    requestPermission,
    sendNotification,
    scheduleNotification,
  };
}
