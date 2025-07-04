import { useEffect, useState } from "react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isPast,
} from "date-fns";

interface CountdownTimerProps {
  eventDate: string | Date;
}

export function CountdownTimer({ eventDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    function updateCountdown() {
      const targetDate = new Date(eventDate);
      if (isPast(targetDate)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const now = new Date();
      const days = differenceInDays(targetDate, now);
      const hours = differenceInHours(targetDate, now) % 24;
      const minutes = differenceInMinutes(targetDate, now) % 60;

      setTimeLeft({ days, hours, minutes });
    }

    // Update immediately
    updateCountdown();

    // Update every minute
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [eventDate]);

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        El evento ha concluido
      </div>
    );
  }

  return (
    <div className="flex gap-2 text-sm">
      {timeLeft.days > 0 && (
        <span className="font-medium">{timeLeft.days}d</span>
      )}
      {timeLeft.hours > 0 && (
        <span className="font-medium">{timeLeft.hours}h</span>
      )}
      {timeLeft.minutes > 0 && (
        <span className="font-medium">{timeLeft.minutes}m</span>
      )}
      <span className="text-muted-foreground">remaining</span>
    </div>
  );
}
