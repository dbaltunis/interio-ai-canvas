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
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Project Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Project Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = statusCounts[status] || 0;
          const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;

          return (
            <div key={status} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Circle className={cn("h-3 w-3 fill-current", config.textColor)} />
                  <span className="text-sm font-medium text-foreground">
                    {config.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {count} {count === 1 ? "project" : "projects"}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-500 rounded-full", config.color)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        
        {totalProjects === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No projects yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
