import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import { useDashboardDate } from "@/contexts/DashboardDateContext";
import { startOfDay, subDays, format, differenceInDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

interface RevenueDataPoint {
  name: string;
  current: number;
  previous: number;
  date: Date;
}

export const useRevenueHistory = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  const { dateRange } = useDashboardDate();

  return useQuery({
    queryKey: ["revenue-history", effectiveOwnerId, dateRange.startDate, dateRange.endDate],
    queryFn: async (): Promise<{ data: RevenueDataPoint[]; currentTotal: number; previousTotal: number; changePercent: number }> => {
      if (!effectiveOwnerId) throw new Error("No authenticated user");

      const start = dateRange.startDate;
      const end = dateRange.endDate;
      const periodLength = differenceInDays(end, start) + 1;
      
      // Calculate previous period (same length, immediately before)
      const previousEnd = subDays(start, 1);
      const previousStart = subDays(previousEnd, periodLength - 1);

      // Fetch current period quotes (accepted = revenue)
      const { data: currentQuotes } = await supabase
        .from("quotes")
        .select("total_amount, created_at")
        .eq("user_id", effectiveOwnerId)
        .eq("status", "accepted")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      // Fetch previous period quotes
      const { data: previousQuotes } = await supabase
        .from("quotes")
        .select("total_amount, created_at")
        .eq("user_id", effectiveOwnerId)
        .eq("status", "accepted")
        .gte("created_at", previousStart.toISOString())
        .lte("created_at", previousEnd.toISOString());

      // Determine grouping based on period length
      let intervals: Date[];
      let formatStr: string;
      
      if (periodLength <= 7) {
        // Daily for up to 7 days
        intervals = eachDayOfInterval({ start, end });
        formatStr = "EEE"; // Mon, Tue, etc.
      } else if (periodLength <= 31) {
        // Daily for up to a month
        intervals = eachDayOfInterval({ start, end });
        formatStr = "MMM d"; // Jan 1, Jan 2, etc.
      } else if (periodLength <= 90) {
        // Weekly for up to 3 months
        intervals = eachWeekOfInterval({ start, end });
        formatStr = "MMM d"; // Week starting
      } else {
        // Monthly for longer periods
        intervals = eachMonthOfInterval({ start, end });
        formatStr = "MMM"; // Jan, Feb, etc.
      }

      // Group current revenue by interval
      const currentByInterval = new Map<string, number>();
      intervals.forEach(date => {
        currentByInterval.set(format(date, "yyyy-MM-dd"), 0);
      });

      currentQuotes?.forEach(quote => {
        const quoteDate = startOfDay(new Date(quote.created_at));
        // Find the matching interval
        for (let i = intervals.length - 1; i >= 0; i--) {
          if (quoteDate >= intervals[i]) {
            const key = format(intervals[i], "yyyy-MM-dd");
            currentByInterval.set(key, (currentByInterval.get(key) || 0) + (quote.total_amount || 0));
            break;
          }
        }
      });

      // Group previous revenue (aligned to current intervals)
      const previousByInterval = new Map<string, number>();
      intervals.forEach((date, index) => {
        previousByInterval.set(format(date, "yyyy-MM-dd"), 0);
      });

      previousQuotes?.forEach(quote => {
        const quoteDate = startOfDay(new Date(quote.created_at));
        const dayOffset = differenceInDays(quoteDate, previousStart);
        // Map to corresponding current interval index
        const intervalIndex = Math.min(Math.floor(dayOffset * intervals.length / periodLength), intervals.length - 1);
        if (intervalIndex >= 0 && intervalIndex < intervals.length) {
          const key = format(intervals[intervalIndex], "yyyy-MM-dd");
          previousByInterval.set(key, (previousByInterval.get(key) || 0) + (quote.total_amount || 0));
        }
      });

      // Build data points
      const data: RevenueDataPoint[] = intervals.map(date => {
        const key = format(date, "yyyy-MM-dd");
        return {
          name: format(date, formatStr),
          current: currentByInterval.get(key) || 0,
          previous: previousByInterval.get(key) || 0,
          date,
        };
      });

      // Calculate totals
      const currentTotal = currentQuotes?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0;
      const previousTotal = previousQuotes?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0;
      const changePercent = previousTotal > 0 
        ? ((currentTotal - previousTotal) / previousTotal * 100) 
        : currentTotal > 0 ? 100 : 0;

      return { data, currentTotal, previousTotal, changePercent };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!effectiveOwnerId,
  });
};
