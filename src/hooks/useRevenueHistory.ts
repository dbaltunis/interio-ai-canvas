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

// Status names that count as revenue (order confirmed, approved, completed, in production)
const REVENUE_STATUS_NAMES = [
  'order confirmed',
  'approved', 
  'completed',
  'in production',
  'installed',
  'closed',
  'delivered',
  'paid',
  // Universal status names that count as revenue
  'order',           // Matches "ORDER"
  'invoice',         // Matches "INVOICE"  
  'online store sale' // Matches "Online Store Sale"
];

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

      // FIX: Query projects with status name joined, then filter in-memory
      // This works across user accounts for team members
      const { data: currentProjectsRaw } = await supabase
        .from("projects")
        .select(`
          id,
          created_at,
          status_id,
          job_statuses!status_id(name),
          quotes!inner(total_amount)
        `)
        .eq("user_id", effectiveOwnerId)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      // Filter by status name matching revenue criteria (case-insensitive)
      const currentProjects = currentProjectsRaw?.filter(p => {
        const statusName = (p.job_statuses as any)?.name?.toLowerCase() || '';
        return REVENUE_STATUS_NAMES.includes(statusName);
      }) || [];

      // Fetch previous period projects with status name joined
      const { data: previousProjectsRaw } = await supabase
        .from("projects")
        .select(`
          id,
          created_at,
          status_id,
          job_statuses!status_id(name),
          quotes!inner(total_amount)
        `)
        .eq("user_id", effectiveOwnerId)
        .gte("created_at", previousStart.toISOString())
        .lte("created_at", previousEnd.toISOString());

      // Filter by status name matching revenue criteria
      const previousProjects = previousProjectsRaw?.filter(p => {
        const statusName = (p.job_statuses as any)?.name?.toLowerCase() || '';
        return REVENUE_STATUS_NAMES.includes(statusName);
      }) || [];

      // Determine grouping based on period length
      let intervals: Date[];
      let formatStr: string;
      
      if (periodLength <= 7) {
        intervals = eachDayOfInterval({ start, end });
        formatStr = "EEE";
      } else if (periodLength <= 31) {
        intervals = eachDayOfInterval({ start, end });
        formatStr = "MMM d";
      } else if (periodLength <= 90) {
        intervals = eachWeekOfInterval({ start, end });
        formatStr = "MMM d";
      } else {
        intervals = eachMonthOfInterval({ start, end });
        formatStr = "MMM";
      }

      // Group current revenue by interval
      const currentByInterval = new Map<string, number>();
      intervals.forEach(date => {
        currentByInterval.set(format(date, "yyyy-MM-dd"), 0);
      });

      currentProjects?.forEach(project => {
        const projectDate = startOfDay(new Date(project.created_at));
        const projectRevenue = project.quotes?.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0) || 0;
        
        for (let i = intervals.length - 1; i >= 0; i--) {
          if (projectDate >= intervals[i]) {
            const key = format(intervals[i], "yyyy-MM-dd");
            currentByInterval.set(key, (currentByInterval.get(key) || 0) + projectRevenue);
            break;
          }
        }
      });

      // Group previous revenue
      const previousByInterval = new Map<string, number>();
      intervals.forEach(date => {
        previousByInterval.set(format(date, "yyyy-MM-dd"), 0);
      });

      previousProjects?.forEach(project => {
        const projectDate = startOfDay(new Date(project.created_at));
        const projectRevenue = project.quotes?.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0) || 0;
        const dayOffset = differenceInDays(projectDate, previousStart);
        const intervalIndex = Math.min(Math.floor(dayOffset * intervals.length / periodLength), intervals.length - 1);
        
        if (intervalIndex >= 0 && intervalIndex < intervals.length) {
          const key = format(intervals[intervalIndex], "yyyy-MM-dd");
          previousByInterval.set(key, (previousByInterval.get(key) || 0) + projectRevenue);
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
      const currentTotal = currentProjects?.reduce((sum, p) => {
        return sum + (p.quotes?.reduce((qSum: number, q: any) => qSum + (q.total_amount || 0), 0) || 0);
      }, 0) || 0;
      
      const previousTotal = previousProjects?.reduce((sum, p) => {
        return sum + (p.quotes?.reduce((qSum: number, q: any) => qSum + (q.total_amount || 0), 0) || 0);
      }, 0) || 0;
      
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
