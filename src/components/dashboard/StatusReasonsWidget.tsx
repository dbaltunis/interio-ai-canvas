import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Clock, XCircle, PauseCircle, User, Calendar } from "lucide-react";
import { useStatusReasonsKPI } from "@/hooks/useStatusReasonsKPI";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const getStatusIcon = (status: string | null) => {
  switch (status) {
    case 'Rejected':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'Cancelled':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'On Hold':
      return <PauseCircle className="h-4 w-4 text-primary" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusVariant = (status: string | null): "destructive" | "secondary" | "outline" => {
  switch (status) {
    case 'Rejected':
      return "destructive";
    case 'Cancelled':
      return "secondary";
    case 'On Hold':
      return "outline";
    default:
      return "outline";
  }
};

export const StatusReasonsWidget = () => {
  const { data: statusReasons, isLoading, error } = useStatusReasonsKPI(10);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Rejections & Cancellations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-warning" />
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Rejections & Cancellations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No rejections or cancellations recorded</p>
            <p className="text-xs text-muted-foreground mt-1">
              Reasons will appear here when projects are rejected or cancelled
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Rejections & Cancellations
          <Badge variant="secondary" className="ml-auto text-xs">
            {statusReasons.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-4">
            {statusReasons.map((item) => (
              <div
                key={item.id}
                className="border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                {/* Project Name & Status */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-medium text-sm leading-tight line-clamp-1">
                    {item.project_name}
                  </h4>
                  <Badge variant={getStatusVariant(item.new_status_name)} className="shrink-0 text-xs">
                    {getStatusIcon(item.new_status_name)}
                    <span className="ml-1">{item.new_status_name}</span>
                  </Badge>
                </div>

                {/* Reason */}
                {item.reason && (
                  <p className="text-sm text-muted-foreground italic mb-2 line-clamp-2">
                    "{item.reason}"
                  </p>
                )}

                {/* Meta info */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.user_name || item.user_email || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(item.changed_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
