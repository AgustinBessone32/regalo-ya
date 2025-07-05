import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("denied");
  const { toast } = useToast();

  // Check if notifications are supported
  const isSupported = typeof window !== "undefined" && "Notification" in window;

  // Initialize permission state
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn("Notifications are not supported in this browser");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  // Send notification
  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== "granted") {
        return;
      }

      try {
        new Notification(title, options);
      } catch (error) {
        console.error("Error sending notification:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send notification",
        });
      }
    },
    [isSupported, permission, toast]
  );

  // Schedule notification
  const scheduleNotification = useCallback(
    (
      date: Date,
      intervals: number[] = [1, 7, 30], // Default intervals in days
      eventTitle: string
    ) => {
      if (!isSupported || permission !== "granted") return;

      const now = new Date();
      intervals.forEach((days) => {
        const notificationDate = new Date(date);
        notificationDate.setDate(notificationDate.getDate() - days);

        if (notificationDate > now) {
          const timeout = notificationDate.getTime() - now.getTime();
          setTimeout(() => {
            sendNotification(
              `${eventTitle} - ${days} day${days === 1 ? "" : "s"} remaining!`,
              {
                body: `The event will take place on ${date.toLocaleDateString()}`,
                icon: "/favicon.ico",
              }
            );
          }, timeout);
        }
      });
    },
    [permission, sendNotification]
  );

  return {
    permission: isSupported ? permission : "denied",
    requestPermission,
    sendNotification,
    scheduleNotification,
    isSupported,
  };
}
