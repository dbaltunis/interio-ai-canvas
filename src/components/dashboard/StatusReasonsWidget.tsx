import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, XCircle, PauseCircle, User, Calendar, CheckCircle2 } from "lucide-react";
import { useStatusReasonsKPI } from "@/hooks/useStatusReasonsKPI";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { PixelBriefcaseIcon } from "@/components/icons/PixelArtIcons";

const getStatusConfig = (status: string | null) => {
  switch (status) {
    case 'Rejected':
      return {
        icon: XCircle,
        bgClass: "bg-destructive/10",
        iconClass: "text-destructive",
        badgeVariant: "destructive" as const,
      };
    case 'Cancelled':
      return {
        icon: AlertTriangle,
        bgClass: "bg-warning/10",
        iconClass: "text-warning",
        badgeVariant: "secondary" as const,
      };
    case 'On Hold':
      return {
        icon: PauseCircle,
        bgClass: "bg-primary/10",
        iconClass: "text-primary",
        badgeVariant: "outline" as const,
      };
    default:
      return {
        icon: AlertTriangle,
        bgClass: "bg-muted",
        iconClass: "text-muted-foreground",
        badgeVariant: "outline" as const,
      };
  }
};

export const StatusReasonsWidget = () => {
  const { data: statusReasons, isLoading, error } = useStatusReasonsKPI(10);

  if (isLoading) {
    return (
      <Card variant="analytics" className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Rejections & Cancellations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="analytics" className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Rejections & Cancellations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load status reasons</p>
        </CardContent>
      </Card>
    );
  }

  if (!statusReasons || statusReasons.length === 0) {
    return (
      <Card variant="analytics" className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Rejections & Cancellations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">All projects on track! 🎉</p>
            <p className="text-xs text-muted-foreground">No rejections or cancellations recorded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="analytics" className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          Rejections & Cancellations
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[280px] pr-3">
          <div className="space-y-1.5">
            {statusReasons.map((item) => {
              const config = getStatusConfig(item.new_status_name);
              const StatusIcon = config.icon;
              
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-background border border-border/50 hover:bg-muted/50 transition-all"
                >
                  <div className={`shrink-0 p-1.5 rounded-md ${config.bgClass}`}>
                    <StatusIcon className={`h-3 w-3 ${config.iconClass}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-xs text-foreground truncate">
                        {item.project_name || "Untitled Project"}
                      </h4>
                      <Badge 
                        variant={config.badgeVariant}
                        className="text-[10px] shrink-0 h-4 px-1.5 font-medium"
                      >
                        {item.new_status_name}
                      </Badge>
                    </div>
                    
                    {item.reason && (
                      <p className="text-[10px] text-muted-foreground italic truncate mt-0.5">
                        "{item.reason}"
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1 truncate">
                        <User className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{item.user_name || item.user_email || 'Unknown'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5 shrink-0" />
                        <span>
                          {formatDistanceToNow(new Date(item.changed_at), { addSuffix: true })}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
