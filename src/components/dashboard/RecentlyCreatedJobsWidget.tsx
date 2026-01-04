import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Calendar, User } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

export const RecentlyCreatedJobsWidget = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();

  const recentJobs = projects
    ?.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    ?.slice(0, 10) || [];

  if (isLoading) {
    return (
      <Card variant="analytics">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            Recently Created Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="analytics" className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          Recently Created Jobs
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {recentJobs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Briefcase className="h-8 w-8 mx-auto mb-1.5 opacity-20" />
            <p className="text-xs">No jobs created yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-3">
            <div className="space-y-1.5">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-background border border-border/50 hover:bg-muted/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/?tab=projects&projectId=${job.id}`)}
                >
                  <div className="shrink-0 p-1.5 rounded-md bg-muted/50">
                    <Briefcase className="h-3 w-3 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-xs text-foreground truncate">
                        {job.name || "Untitled Project"}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] shrink-0 h-4 px-1.5 font-medium"
                      >
                        {job.status || "Draft"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      {job.clients?.name && (
                        <span className="flex items-center gap-1 truncate">
                          <User className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{job.clients.name}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5 shrink-0" />
                        <span>
                          {job.created_at 
                            ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true })
                            : "Unknown"
                          }
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
