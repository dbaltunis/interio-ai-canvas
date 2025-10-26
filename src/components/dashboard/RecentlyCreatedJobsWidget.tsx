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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
            Recently Created Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 sm:h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Briefcase className="h-4 w-4" />
          Recently Created Jobs
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {recentJobs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs">No jobs created yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-lg bg-background border border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                  onClick={() => navigate(`/?tab=projects&projectId=${job.id}`)}
                >
                  <div className="mt-0.5 shrink-0 p-1 sm:p-1.5 rounded-md bg-muted/50">
                    <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">
                        {job.name || "Untitled Project"}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] sm:text-xs shrink-0 h-4 sm:h-5 px-1.5 sm:px-2 font-medium"
                      >
                        {job.status || "Draft"}
                      </Badge>
                    </div>
                    
                    {job.clients?.name && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 mb-1 truncate">
                        <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                        <span className="truncate">{job.clients.name}</span>
                      </p>
                    )}
                    
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                      <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                      <span className="truncate">
                        {job.created_at 
                          ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true })
                          : "Date unknown"
                        }
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
