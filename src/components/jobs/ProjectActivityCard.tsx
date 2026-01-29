import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  ArrowRightCircle, 
  UserPlus, 
  UserMinus, 
  Mail, 
  FileText, 
  MessageSquare, 
  Link, 
  Plus, 
  Copy,
  ChevronDown,
  ChevronUp,
  Activity
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useProjectActivityLog, ProjectActivity, ProjectActivityType } from "@/hooks/useProjectActivityLog";
import { cn } from "@/lib/utils";

interface ProjectActivityCardProps {
  projectId: string;
  maxItems?: number;
}

const activityIcons: Record<ProjectActivityType, React.ElementType> = {
  status_changed: ArrowRightCircle,
  team_assigned: UserPlus,
  team_removed: UserMinus,
  email_sent: Mail,
  quote_created: FileText,
  quote_sent: Mail,
  note_added: MessageSquare,
  client_linked: Link,
  project_created: Plus,
  project_duplicated: Copy,
  room_added: Plus,
  window_added: Plus,
  treatment_added: Plus,
  share_link_created: Link,
  pdf_exported: FileText,
};

const activityColors: Record<ProjectActivityType, string> = {
  status_changed: "text-blue-500",
  team_assigned: "text-green-500",
  team_removed: "text-orange-500",
  email_sent: "text-purple-500",
  quote_created: "text-emerald-500",
  quote_sent: "text-indigo-500",
  note_added: "text-amber-500",
  client_linked: "text-cyan-500",
  project_created: "text-primary",
  project_duplicated: "text-violet-500",
  room_added: "text-sky-500",
  window_added: "text-slate-500",
  treatment_added: "text-fuchsia-500",
  share_link_created: "text-lime-500",
  pdf_exported: "text-rose-500",
};

const CompactActivityItem = ({ activity }: { activity: ProjectActivity }) => {
  const Icon = activityIcons[activity.activity_type] || Clock;
  const iconColor = activityColors[activity.activity_type] || "text-muted-foreground";
  
  // Format timestamp - use relative for recent, absolute for older
  const createdAt = new Date(activity.created_at);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  const timeDisplay = daysDiff < 7 
    ? formatDistanceToNow(createdAt, { addSuffix: true })
    : format(createdAt, "MMM d");

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className={cn("mt-0.5 shrink-0", iconColor)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-tight truncate">
          {activity.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {activity.user_name}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {timeDisplay}
          </span>
        </div>
      </div>
    </div>
  );
};

const ExpandedActivityItem = ({ activity }: { activity: ProjectActivity }) => {
  const Icon = activityIcons[activity.activity_type] || Clock;
  const iconColor = activityColors[activity.activity_type] || "text-muted-foreground";
  
  const createdAt = new Date(activity.created_at);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className={cn("mt-0.5 shrink-0 p-1.5 rounded-full bg-muted/50", iconColor)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {activity.title}
        </p>
        {activity.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {activity.description}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-xs text-muted-foreground">
            by {activity.user_name}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {format(createdAt, "MMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
      </div>
    </div>
  );
};

export const ProjectActivityCard = ({ projectId, maxItems = 5 }: ProjectActivityCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: activities = [], isLoading } = useProjectActivityLog(projectId);

  const displayedActivities = isExpanded ? activities : activities.slice(0, maxItems);
  const hasMore = activities.length > maxItems;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Project Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Project Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No activity recorded yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Activity will appear here as you work on this project
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Project Activity
          </CardTitle>
          {activities.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {activities.length} {activities.length === 1 ? 'event' : 'events'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "divide-y divide-border/50",
          isExpanded && "max-h-[400px] overflow-y-auto"
        )}>
          {displayedActivities.map((activity) => (
            isExpanded 
              ? <ExpandedActivityItem key={activity.id} activity={activity} />
              : <CompactActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
        
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                View All ({activities.length - maxItems} more)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
