
import { useState, useEffect } from "react";

export interface TimezoneInfo {
  value: string;
  label: string;
  offset: string;
  abbreviation: string;
}

// Common timezones - expanded with AU/NZ support
const COMMON_TIMEZONES: TimezoneInfo[] = [
  { value: "UTC", label: "UTC", offset: "+00:00", abbreviation: "UTC" },
  // Americas
  { value: "America/New_York", label: "Eastern Time (US)", offset: "-05:00", abbreviation: "ET" },
  { value: "America/Chicago", label: "Central Time (US)", offset: "-06:00", abbreviation: "CT" },
  { value: "America/Denver", label: "Mountain Time (US)", offset: "-07:00", abbreviation: "MT" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)", offset: "-08:00", abbreviation: "PT" },
  // Europe
  { value: "Europe/London", label: "London", offset: "+00:00", abbreviation: "GMT" },
  { value: "Europe/Paris", label: "Paris", offset: "+01:00", abbreviation: "CET" },
  { value: "Europe/Berlin", label: "Berlin", offset: "+01:00", abbreviation: "CET" },
  // Asia
  { value: "Asia/Tokyo", label: "Tokyo", offset: "+09:00", abbreviation: "JST" },
  { value: "Asia/Shanghai", label: "Shanghai", offset: "+08:00", abbreviation: "CST" },
  // Australia & New Zealand
  { value: "Pacific/Auckland", label: "Auckland (NZ)", offset: "+13:00", abbreviation: "NZDT" },
  { value: "Pacific/Chatham", label: "Chatham Islands (NZ)", offset: "+13:45", abbreviation: "CHADT" },
  { value: "Australia/Sydney", label: "Sydney (AU)", offset: "+11:00", abbreviation: "AEDT" },
  { value: "Australia/Melbourne", label: "Melbourne (AU)", offset: "+11:00", abbreviation: "AEDT" },
  { value: "Australia/Brisbane", label: "Brisbane (AU)", offset: "+10:00", abbreviation: "AEST" },
  { value: "Australia/Perth", label: "Perth (AU)", offset: "+08:00", abbreviation: "AWST" },
  { value: "Australia/Adelaide", label: "Adelaide (AU)", offset: "+10:30", abbreviation: "ACDT" },
  { value: "Australia/Darwin", label: "Darwin (AU)", offset: "+09:30", abbreviation: "ACST" },
];

const STORAGE_KEY = 'user-timezone-preference';

export const useTimezone = () => {
  const [userTimezone, setUserTimezone] = useState<string>(() => {
    // Try to get from localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }
    
    // Fallback to browser's detected timezone
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  });

  const [detectedTimezone, setDetectedTimezone] = useState<string>('UTC');

  useEffect(() => {
    // Detect user's timezone
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setDetectedTimezone(detected);
    } catch (error) {
      console.warn('Could not detect timezone:', error);
    }
  }, []);

  useEffect(() => {
    // Save timezone preference to localStorage
    localStorage.setItem(STORAGE_KEY, userTimezone);
  }, [userTimezone]);

  const getTimezoneInfo = (timezone: string): TimezoneInfo | null => {
    // First check common timezones
    const common = COMMON_TIMEZONES.find(tz => tz.value === timezone);
    if (common) return common;

    // Generate info for custom timezone
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'shortOffset',
      });
      
      const parts = formatter.formatToParts(now);
      const offsetPart = parts.find(part => part.type === 'timeZoneName');
      
      return {
        value: timezone,
        label: timezone.replace(/_/g, ' '),
        offset: offsetPart?.value || '+00:00',
        abbreviation: timezone.split('/').pop()?.slice(0, 3).toUpperCase() || 'TZ',
      };
    } catch {
      return null;
    }
  };

  const getCurrentOffset = (timezone: string = userTimezone): string => {
    try {
      const now = new Date();
      const utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 
                          now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
      const local = new Date(utc.toLocaleString("en-US", { timeZone: timezone }));
      const offset = (local.getTime() - utc.getTime()) / (1000 * 60);
      
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      const sign = offset >= 0 ? '+' : '-';
      
      return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch {
      return '+00:00';
    }
  };

  const isTimezoneDifferent = (): boolean => {
    return userTimezone !== detectedTimezone;
  };

  const getAllTimezones = (): TimezoneInfo[] => {
    // Return common timezones plus detected timezone if not in list
    const timezones = [...COMMON_TIMEZONES];
    
    if (!timezones.some(tz => tz.value === detectedTimezone)) {
      const detectedInfo = getTimezoneInfo(detectedTimezone);
      if (detectedInfo) {
        timezones.unshift({
          ...detectedInfo,
          label: `${detectedInfo.label} (Detected)`,
        });
      }
    }
    
    return timezones;
  };

  const formatTimeInTimezone = (time: string, timezone: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    });
  };

  return {
    userTimezone,
    setUserTimezone,
    detectedTimezone,
    getTimezoneInfo,
    getCurrentOffset,
    isTimezoneDifferent,
    getAllTimezones,
    formatTimeInTimezone,
    commonTimezones: COMMON_TIMEZONES,
  };
};
