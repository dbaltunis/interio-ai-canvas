import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Circle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const StatusOverviewWidget = () => {
  const { data: projects, isLoading } = useProjects();

  const statusConfig = {
    planning: { label: "Planning", color: "bg-blue-500", textColor: "text-blue-700" },
    in_progress: { label: "In Progress", color: "bg-yellow-500", textColor: "text-yellow-700" },
    completed: { label: "Completed", color: "bg-green-500", textColor: "text-green-700" },
    on_hold: { label: "On Hold", color: "bg-orange-500", textColor: "text-orange-700" },
    cancelled: { label: "Cancelled", color: "bg-red-500", textColor: "text-red-700" },
  };

  const statusCounts = projects?.reduce((acc, project) => {
    const status = project.status || "planning";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalProjects = projects?.length || 0;

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
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="truncate">Project Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = statusCounts[status] || 0;
          const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;

          return (
            <div key={status} className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <Circle className={cn("h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current shrink-0", config.textColor)} />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {config.label}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground shrink-0">
                  {count}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 sm:h-2 overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-500 rounded-full", config.color)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        
        {totalProjects === 0 && (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-20" />
            <p className="text-xs sm:text-sm">No projects yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
