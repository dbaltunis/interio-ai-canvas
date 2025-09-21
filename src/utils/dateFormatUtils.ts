import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { supabase } from '@/integrations/supabase/client';

export interface UserDatePreferences {
  timezone: string;
  date_format: string;
  time_format: string;
}

// Cache for user preferences to avoid repeated DB calls
let cachedPreferences: UserDatePreferences | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get user's date/time preferences from cache or database
 */
async function getUserPreferences(): Promise<UserDatePreferences> {
  const now = Date.now();
  
  // Return cached preferences if still valid
  if (cachedPreferences && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedPreferences;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { timezone: 'UTC', date_format: 'MM/dd/yyyy', time_format: '12h' };
    }

    const { data } = await supabase
      .from('user_preferences')
      .select('timezone, date_format, time_format')
      .eq('user_id', user.id)
      .maybeSingle();

    const preferences: UserDatePreferences = {
      timezone: data?.timezone || 'UTC',
      date_format: data?.date_format || 'MM/dd/yyyy',
      time_format: data?.time_format || '12h',
    };

    // Cache the preferences
    cachedPreferences = preferences;
    cacheTimestamp = now;

    return preferences;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return { timezone: 'UTC', date_format: 'MM/dd/yyyy', time_format: '12h' };
  }
}

/**
 * Convert user's date format preference to date-fns format string
 */
function convertToDateFnsFormat(userFormat: string): string {
  const formatMap: Record<string, string> = {
    'MM/dd/yyyy': 'MM/dd/yyyy',
    'dd/MM/yyyy': 'dd/MM/yyyy', 
    'yyyy-MM-dd': 'yyyy-MM-dd',
    'dd-MMM-yyyy': 'dd-MMM-yyyy',
  };
  
  return formatMap[userFormat] || 'MM/dd/yyyy';
}

/**
 * Convert user's time format preference to date-fns format string
 */
function convertToTimeFnsFormat(userFormat: string): string {
  return userFormat === '24h' ? 'HH:mm' : 'h:mm a';
}

/**
 * Format a date according to user's preferences
 */
export async function formatUserDate(date: Date | string, includeTime: boolean = false): Promise<string> {
  const preferences = await getUserPreferences();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Convert to user's timezone
  const zonedDate = toZonedTime(dateObj, preferences.timezone);
  
  // Get format strings
  const dateFormat = convertToDateFnsFormat(preferences.date_format);
  const timeFormat = convertToTimeFnsFormat(preferences.time_format);
  
  if (includeTime) {
    return format(zonedDate, `${dateFormat} ${timeFormat}`);
  } else {
    return format(zonedDate, dateFormat);
  }
}

/**
 * Format just the time according to user's preferences
 */
export async function formatUserTime(date: Date | string): Promise<string> {
  const preferences = await getUserPreferences();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Convert to user's timezone
  const zonedDate = toZonedTime(dateObj, preferences.timezone);
  
  // Get time format
  const timeFormat = convertToTimeFnsFormat(preferences.time_format);
  
  return format(zonedDate, timeFormat);
}

/**
 * Format a date in the user's timezone but with a custom format
 */
export async function formatUserDateCustom(date: Date | string, customFormat: string): Promise<string> {
  const preferences = await getUserPreferences();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Convert to user's timezone
  const zonedDate = toZonedTime(dateObj, preferences.timezone);
  
  return format(zonedDate, customFormat);
}

/**
 * Invalidate the preferences cache (call when preferences are updated)
 */
export function invalidatePreferencesCache(): void {
  cachedPreferences = null;
  cacheTimestamp = 0;
}

/**
 * Sync version that uses default formatting if async isn't available
 * Use this for components that can't handle async formatting
 */
export function formatDateSync(date: Date | string, includeTime: boolean = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (includeTime) {
    return format(dateObj, 'MM/dd/yyyy h:mm a');
  } else {
    return format(dateObj, 'MM/dd/yyyy');
  }
}