import { useProjects } from "@/hooks/useProjects";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Circle } from "lucide-react";
import { PixelChartIcon } from "@/components/icons/PixelArtIcons";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const StatusOverviewWidget = () => {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: jobStatuses = [], isLoading: statusesLoading } = useJobStatuses();

  const isLoading = projectsLoading || statusesLoading;

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
      primary: { bg: "bg-primary", text: "text-primary" },
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

  // Show only Project category statuses
  const displayStatuses = jobStatuses.filter(status => 
    status.category.toLowerCase() === 'project' && status.is_active
  );

  if (isLoading) {
    return (
      <Card variant="analytics">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span className="truncate">Project Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="analytics" className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          Project Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {displayStatuses.length === 0 && totalProjects === 0 ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-3">
              <PixelChartIcon size={48} />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Track your progress</p>
            <p className="text-xs text-muted-foreground">No projects yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-3">
            <div className="space-y-2">
              {displayStatuses.map((status) => {
            const count = statusCounts[status.name] || 0;
            const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
            const colors = getStatusColor(status.color);

            return (
              <div key={status.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Circle className={cn("h-2.5 w-2.5 fill-current shrink-0", colors.text)} />
                    <span className="text-sm font-medium text-foreground truncate">
                      {status.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground shrink-0">
                    {count}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-500 rounded-full", colors.bg)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
