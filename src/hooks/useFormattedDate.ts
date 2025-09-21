import { useState, useEffect } from 'react';
import { formatUserDate, formatUserTime } from '@/utils/dateFormatUtils';

/**
 * Hook to format a single date using user preferences
 */
export function useFormattedDate(date: Date | string | null | undefined, includeTime: boolean = false) {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const formatDate = async () => {
      if (!date) {
        setFormattedDate('');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const formatted = await formatUserDate(date, includeTime);
        setFormattedDate(formatted);
      } catch (error) {
        console.error('Error formatting date:', error);
        setFormattedDate(typeof date === 'string' ? date : date.toLocaleDateString());
      } finally {
        setIsLoading(false);
      }
    };

    formatDate();
  }, [date, includeTime]);

  return { formattedDate, isLoading };
}

/**
 * Hook to format multiple dates using user preferences
 */
export function useFormattedDates<T extends Record<string, any>>(
  items: T[] | null | undefined,
  getDate: (item: T) => Date | string | null | undefined,
  includeTime: boolean = false
) {
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const formatDates = async () => {
      if (!items) {
        setFormattedDates({});
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const dateMap: Record<string, string> = {};

        for (const item of items) {
          if ('id' in item && item.id) {
            const date = getDate(item);
            if (date) {
              dateMap[item.id as string] = await formatUserDate(date, includeTime);
            }
          }
        }

        setFormattedDates(dateMap);
      } catch (error) {
        console.error('Error formatting dates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    formatDates();
  }, [items, getDate, includeTime]);

  return { formattedDates, isLoading };
}

/**
 * Hook to format time only using user preferences
 */
export function useFormattedTime(date: Date | string | null | undefined) {
  const [formattedTime, setFormattedTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const formatTime = async () => {
      if (!date) {
        setFormattedTime('');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const formatted = await formatUserTime(date);
        setFormattedTime(formatted);
      } catch (error) {
        console.error('Error formatting time:', error);
        setFormattedTime(typeof date === 'string' ? date : date.toLocaleTimeString());
      } finally {
        setIsLoading(false);
      }
    };

    formatTime();
  }, [date]);

  return { formattedTime, isLoading };
}