import { useProjects } from "@/hooks/useProjects";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Circle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const StatusOverviewWidget = () => {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: jobStatuses = [], isLoading: statusesLoading } = useJobStatuses();

  const isLoading = projectsLoading || statusesLoading;

  // Map status colors from job_statuses table
  const getStatusColor = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      gray: { bg: "bg-gray-500", text: "text-gray-700" },
      blue: { bg: "bg-blue-500", text: "text-blue-700" },
      green: { bg: "bg-green-500", text: "text-green-700" },
      yellow: { bg: "bg-yellow-500", text: "text-yellow-700" },
      orange: { bg: "bg-orange-500", text: "text-orange-700" },
      red: { bg: "bg-red-500", text: "text-red-700" },
      purple: { bg: "bg-purple-500", text: "text-purple-700" },
      pink: { bg: "bg-pink-500", text: "text-pink-700" },
    };
    return colorMap[color?.toLowerCase()] || { bg: "bg-gray-500", text: "text-gray-700" };
  };

  // Count projects by status
  const statusCounts = projects?.reduce((acc, project) => {
    const status = project.status || "Draft";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalProjects = projects?.length || 0;

  // Filter to only show statuses that have projects or are commonly used
  const displayStatuses = jobStatuses.filter(status => 
    statusCounts[status.name] > 0 || 
    ['Draft', 'Planning', 'In Production', 'Completed', 'Cancelled'].includes(status.name)
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Project Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-10 sm:h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism border-primary/20">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="truncate">Project Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {displayStatuses.length === 0 && totalProjects === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-20" />
            <p className="text-xs sm:text-sm">No projects yet</p>
          </div>
        ) : (
          displayStatuses.map((status) => {
            const count = statusCounts[status.name] || 0;
            const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
            const colors = getStatusColor(status.color);

            return (
              <div key={status.id} className="space-y-2 p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn("h-3 w-3 rounded-full shrink-0", colors.bg)} />
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                      {status.name}
                    </span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-foreground shrink-0 px-2.5 py-1 rounded-full bg-primary/10">
                    {count}
                  </span>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className={cn("h-full transition-all duration-500 rounded-full shadow-sm", colors.bg)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
