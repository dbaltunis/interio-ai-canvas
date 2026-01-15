import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useProjects } from "@/hooks/useProjects";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { useDashboardDate } from "@/contexts/DashboardDateContext";
import { useMemo } from "react";
import { isWithinInterval, parseISO } from "date-fns";

// Fallback colors only used if status color not found in database
const FALLBACK_COLORS: Record<string, string> = {
  'in_progress': 'hsl(var(--primary))',
  'active': 'hsl(var(--primary))',
  'pending': 'hsl(38, 92%, 50%)',
  'completed': 'hsl(142, 71%, 45%)',
  'on_hold': 'hsl(var(--muted-foreground))',
  'cancelled': 'hsl(0, 84%, 60%)',
};

export const JobsStatusChart = () => {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: jobStatuses, isLoading: statusesLoading } = useJobStatuses();
  const { dateRange } = useDashboardDate();

  const isLoading = projectsLoading || statusesLoading;

  // Filter projects by date range
  const filteredProjects = useMemo(() => {
    if (!projects?.length || !dateRange.startDate) return projects || [];
    
    return projects.filter(project => {
      const createdAt = parseISO(project.created_at);
      return isWithinInterval(createdAt, { 
        start: dateRange.startDate, 
        end: dateRange.endDate || dateRange.startDate 
      });
    });
  }, [projects, dateRange]);

  // Build a map of status_id -> { name, color } from job_statuses
  const statusMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    jobStatuses?.forEach(status => {
      map.set(status.id, { 
        name: status.name, 
        color: status.color || FALLBACK_COLORS[status.name.toLowerCase().replace(/\s+/g, '_')] || 'hsl(var(--muted-foreground))'
      });
    });
    return map;
  }, [jobStatuses]);

  const chartData = useMemo(() => {
    if (!filteredProjects?.length) return [];
    
    const statusCounts: Record<string, { count: number; name: string; color: string }> = {};
    
    filteredProjects.forEach(project => {
      const statusId = project.status_id || project.status || 'pending';
      
      // Try to get from job_statuses first (by ID - UUIDs)
      const statusInfo = statusMap.get(statusId);
      
      if (statusInfo) {
        // Found in job_statuses lookup - use proper name
        if (!statusCounts[statusId]) {
          statusCounts[statusId] = { count: 0, name: statusInfo.name, color: statusInfo.color };
        }
        statusCounts[statusId].count++;
      } else {
        // Not found in job_statuses - check if it's a UUID (36 chars with dashes)
        const isUUID = typeof statusId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(statusId);
        
        if (isUUID) {
          // UUID not found in statusMap - group as "Unknown" to avoid showing raw UUIDs
          const unknownKey = 'unknown';
          if (!statusCounts[unknownKey]) {
            statusCounts[unknownKey] = { 
              count: 0, 
              name: 'Unknown',
              color: 'hsl(var(--muted-foreground))'
            };
          }
          statusCounts[unknownKey].count++;
        } else {
          // Legacy string status - format nicely
          const statusKey = String(statusId);
          if (!statusCounts[statusKey]) {
            const displayName = statusKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            statusCounts[statusKey] = { 
              count: 0, 
              name: displayName,
              color: FALLBACK_COLORS[statusKey] || 'hsl(var(--muted-foreground))'
            };
          }
          statusCounts[statusKey].count++;
        }
      }
    });

    return Object.entries(statusCounts)
      .map(([status, data]) => ({
        name: data.name,
        value: data.count,
        status,
        color: data.color,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredProjects, statusMap]);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg text-xs">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-muted-foreground">
            {data.value} jobs ({((data.value / total) * 100).toFixed(0)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card variant="analytics">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jobs by Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[180px]">
          <div className="animate-pulse h-24 w-24 rounded-full bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card variant="analytics">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jobs by Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[180px] text-center">
          {/* Nokia 3310-inspired pixel art target/clipboard icon */}
          <svg width="48" height="48" viewBox="0 0 24 24" className="mb-3 opacity-70">
            {/* Clipboard base */}
            <rect x="4" y="4" width="16" height="18" rx="1" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
            <rect x="8" y="2" width="8" height="4" rx="1" fill="currentColor" className="text-muted-foreground" />
            {/* Pixel checkmarks - retro style */}
            <rect x="7" y="9" width="2" height="2" fill="currentColor" className="text-primary" />
            <rect x="9" y="11" width="2" height="2" fill="currentColor" className="text-primary" />
            <rect x="11" y="9" width="2" height="2" fill="currentColor" className="text-primary" />
            <rect x="14" y="9" width="4" height="2" fill="currentColor" className="text-muted-foreground/60" />
            {/* Second row */}
            <rect x="7" y="14" width="2" height="2" fill="currentColor" className="text-primary/60" />
            <rect x="9" y="16" width="2" height="2" fill="currentColor" className="text-primary/60" />
            <rect x="11" y="14" width="2" height="2" fill="currentColor" className="text-primary/60" />
            <rect x="14" y="14" width="4" height="2" fill="currentColor" className="text-muted-foreground/40" />
          </svg>
          <p className="text-sm font-medium text-foreground mb-1">Ready for your first project!</p>
          <p className="text-xs text-muted-foreground">Great things start here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="analytics">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jobs by Status</CardTitle>
          <span className="text-lg font-semibold text-foreground">{total}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          {/* Donut Chart */}
          <div className="h-[140px] w-[140px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-1.5">
            {chartData.slice(0, 4).map((item) => (
              <div key={item.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
            {chartData.length > 4 && (
              <p className="text-xs text-muted-foreground">+{chartData.length - 4} more</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
