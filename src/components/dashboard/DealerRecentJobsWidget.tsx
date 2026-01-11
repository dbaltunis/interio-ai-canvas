import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDealerOwnProjects } from "@/hooks/useProjects";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";

/**
 * Widget showing only the dealer's own recently created jobs
 * - Only shows jobs where user_id === current dealer's ID
 * - Simplified view without financial data
 */
export const DealerRecentJobsWidget = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading: projectsLoading } = useDealerOwnProjects();
  const { data: jobStatuses, isLoading: statusesLoading } = useJobStatuses();

  const isLoading = projectsLoading || statusesLoading;

  // Build status lookup map
  const statusMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    jobStatuses?.forEach(status => {
      map.set(status.id, { 
        name: status.name, 
        color: status.color || 'hsl(var(--muted-foreground))'
      });
    });
    return map;
  }, [jobStatuses]);

  // Get recent 5 projects
  const recentProjects = useMemo(() => {
    if (!projects) return [];
    return projects.slice(0, 5);
  }, [projects]);

  const getStatusDisplay = (project: any) => {
    const statusId = project.status_id;
    if (statusId && statusMap.has(statusId)) {
      return statusMap.get(statusId)!;
    }
    // Fallback for legacy status field
    const status = project.status || 'pending';
    return {
      name: status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      color: 'hsl(var(--muted-foreground))'
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            Your Recent Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            Your Recent Jobs
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/jobs')}
            className="h-7 text-xs"
          >
            View All
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentProjects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No jobs yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/jobs?action=new')}
              className="h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create Your First Job
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentProjects.map((project: any) => {
              const statusInfo = getStatusDisplay(project);
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/jobs?jobId=${project.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {project.job_number || project.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.clients?.name || 'No client'} • {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs shrink-0 ml-2"
                    style={{ 
                      backgroundColor: `${statusInfo.color}20`,
                      color: statusInfo.color,
                      borderColor: statusInfo.color
                    }}
                  >
                    {statusInfo.name}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
