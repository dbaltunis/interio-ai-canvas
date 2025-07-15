
import { useState, useEffect } from 'react';

export const useTimezone = () => {
  const [userTimezone, setUserTimezone] = useState<string>('UTC');

  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(timezone);
    } catch (error) {
      console.error('Failed to detect timezone:', error);
      setUserTimezone('UTC');
    }
  }, []);

  const formatTimeInTimezone = (time: string, timezone: string = userTimezone) => {
    try {
      // Parse time string (HH:mm format)
      const [hours, minutes] = time.split(':').map(Number);
      const today = new Date();
      today.setHours(hours, minutes, 0, 0);
      
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
        hour12: true
      }).format(today);
    } catch (error) {
      console.error('Failed to format time:', error);
      return time;
    }
  };

  const getTimezoneOffset = (timezone: string = userTimezone) => {
    try {
      const now = new Date();
      const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
      return (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
    } catch (error) {
      console.error('Failed to get timezone offset:', error);
      return 0;
    }
  };

  return {
    userTimezone,
    formatTimeInTimezone,
    getTimezoneOffset
  };
};
