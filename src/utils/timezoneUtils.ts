import { format, parseISO, isValid } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

export class TimezoneUtils {
  /**
   * Format a date in a specific timezone
   */
  static formatInTimezone(
    date: Date | string,
    timezone: string,
    formatString: string = 'PPp'
  ): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) {
        return 'Invalid Date';
      }
      
      return formatInTimeZone(dateObj, timezone, formatString);
    } catch (error) {
      console.error('Error formatting date in timezone:', error);
      return 'Invalid Date';
    }
  }

  /**
   * Convert a date to a specific timezone
   */
  static toTimezone(date: Date | string, timezone: string): Date {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) {
        throw new Error('Invalid date');
      }
      
      return toZonedTime(dateObj, timezone);
    } catch (error) {
      console.error('Error converting to timezone:', error);
      return new Date();
    }
  }

  /**
   * Convert a zoned time back to UTC
   */
  static fromTimezone(date: Date, timezone: string): Date {
    try {
      return fromZonedTime(date, timezone);
    } catch (error) {
      console.error('Error converting from timezone:', error);
      return date;
    }
  }

  /**
   * Get the timezone offset for a specific timezone at a given date
   */
  static getTimezoneOffset(date: Date, timezone: string): number {
    try {
      const utcDate = new Date(date.getTime());
      const zonedDate = this.toTimezone(utcDate, timezone);
      return (zonedDate.getTime() - utcDate.getTime()) / (1000 * 60); // Return offset in minutes
    } catch (error) {
      console.error('Error getting timezone offset:', error);
      return 0;
    }
  }

  /**
   * Check if a timezone observes daylight saving time
   */
  static observesDST(timezone: string): boolean {
    try {
      const jan = new Date(new Date().getFullYear(), 0, 1);
      const jul = new Date(new Date().getFullYear(), 6, 1);
      
      const janOffset = this.getTimezoneOffset(jan, timezone);
      const julOffset = this.getTimezoneOffset(jul, timezone);
      
      return janOffset !== julOffset;
    } catch {
      return false;
    }
  }

  /**
   * Convert appointment times between timezones
   */
  static convertAppointmentTimezone(
    appointment: {
      start_time: string;
      end_time: string;
    },
    fromTimezone: string,
    toTimezone: string
  ) {
    try {
      const startInFromTz = this.toTimezone(appointment.start_time, fromTimezone);
      const endInFromTz = this.toTimezone(appointment.end_time, fromTimezone);
      
      const startInToTz = this.fromTimezone(startInFromTz, toTimezone);
      const endInToTz = this.fromTimezone(endInFromTz, toTimezone);
      
      return {
        start_time: startInToTz.toISOString(),
        end_time: endInToTz.toISOString(),
      };
    } catch (error) {
      console.error('Error converting appointment timezone:', error);
      return appointment;
    }
  }

  /**
   * Get a user-friendly timezone display name
   */
  static getTimezoneDisplayName(timezone: string, includeOffset: boolean = true): string {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'long',
      });
      
      const parts = formatter.formatToParts(now);
      const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || timezone;
      
      if (!includeOffset) {
        return timeZoneName;
      }
      
      const offsetFormatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'shortOffset',
      });
      
      const offsetParts = offsetFormatter.formatToParts(now);
      const offset = offsetParts.find(part => part.type === 'timeZoneName')?.value || '';
      
      return `${timeZoneName} (${offset})`;
    } catch {
      return timezone;
    }
  }

  /**
   * Parse a datetime string that might include timezone information
   */
  static parseWithTimezone(dateTimeString: string, fallbackTimezone: string = 'UTC'): Date {
    try {
      // If the string already includes timezone info, parse it directly
      const parsed = parseISO(dateTimeString);
      if (isValid(parsed)) {
        return parsed;
      }
      
      // If no timezone info, assume it's in the fallback timezone
      const zonedDate = this.toTimezone(dateTimeString, fallbackTimezone);
      return this.fromTimezone(zonedDate, fallbackTimezone);
    } catch (error) {
      console.error('Error parsing date with timezone:', error);
      return new Date();
    }
  }

  /**
   * Get the user's current timezone
   */
  static getUserTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  }

  /**
   * Check if two dates are on the same day in a specific timezone
   */
  static isSameDayInTimezone(date1: Date | string, date2: Date | string, timezone: string): boolean {
    try {
      const d1 = this.toTimezone(date1, timezone);
      const d2 = this.toTimezone(date2, timezone);
      
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
    } catch {
      return false;
    }
  }

  /**
   * Get the start and end of a day in a specific timezone
   */
  static getDayBoundariesInTimezone(date: Date | string, timezone: string): {
    startOfDay: Date;
    endOfDay: Date;
  } {
    try {
      const zonedDate = this.toTimezone(date, timezone);
      
      const startOfDay = new Date(zonedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(zonedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      return {
        startOfDay: this.fromTimezone(startOfDay, timezone),
        endOfDay: this.fromTimezone(endOfDay, timezone),
      };
    } catch (error) {
      console.error('Error getting day boundaries:', error);
      const fallback = new Date();
      return {
        startOfDay: fallback,
        endOfDay: fallback,
      };
    }
  }
}