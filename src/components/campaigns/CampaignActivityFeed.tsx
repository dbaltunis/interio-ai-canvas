import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Mail, CheckCircle2, XCircle, Eye, MousePointerClick, 
  Clock, Send, AlertCircle, RefreshCw, ChevronDown
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { EmailStatusDot } from "@/components/email/EmailStatusDot";

interface ActivityEvent {
  id: string;
  email_id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  status: string;
  event_type: string;
  created_at: string;
  event_data?: Record<string, any>;
}

interface CampaignActivityFeedProps {
  campaignId?: string;
  limit?: number;
  compact?: boolean;
  showHeader?: boolean;
  className?: string;
}

export const CampaignActivityFeed = ({
  campaignId,
  limit = 20,
  compact = false,
  showHeader = true,
  className,
}: CampaignActivityFeedProps) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch email activity events
  const { data: activities = [], isLoading, refetch } = useQuery({
    queryKey: ['email-activity-feed', campaignId, limit],
    queryFn: async () => {
      // Get emails with their analytics
      let query = supabase
        .from('emails')
        .select(`
          id,
          recipient_email,
          subject,
          status,
          created_at,
          clients:client_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data: emails, error } = await query;
      if (error) throw error;

      // Get analytics for these emails
      const emailIds = emails?.map(e => e.id) || [];
      const { data: analytics } = await supabase
        .from('email_analytics')
        .select('*')
        .in('email_id', emailIds)
        .order('created_at', { ascending: false });

      // Combine into activity events
      const activities: ActivityEvent[] = [];
      
      emails?.forEach((email: any) => {
        // Add the email send event
        activities.push({
          id: `email-${email.id}`,
          email_id: email.id,
          recipient_email: email.recipient_email || '',
          recipient_name: email.clients?.name || email.recipient_email || 'Unknown',
          subject: email.subject || 'No subject',
          status: email.status || 'sent',
          event_type: 'sent',
          created_at: email.created_at,
        });

        // Add analytics events
        const emailAnalytics = analytics?.filter(a => a.email_id === email.id) || [];
        emailAnalytics.forEach((event: any) => {
          activities.push({
            id: `analytics-${event.id}`,
            email_id: email.id,
            recipient_email: email.recipient_email || '',
            recipient_name: email.clients?.name || email.recipient_email || 'Unknown',
            subject: email.subject || 'No subject',
            status: event.event_type,
            event_type: event.event_type,
            created_at: event.created_at,
            event_data: event.event_data,
          });
        });
      });

      // Sort by most recent first
      return activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Real-time subscription for live updates
  useEffect(() => {
    const channelName = `activity-feed-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'emails',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['email-activity-feed'] });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'email_analytics',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['email-activity-feed'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'opened':
      case 'open':
        return <Eye className="h-4 w-4 text-emerald-500" />;
      case 'clicked':
      case 'click':
        return <MousePointerClick className="h-4 w-4 text-purple-500" />;
      case 'bounced':
      case 'bounce':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Mail className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'sent': return 'Sent';
      case 'delivered': return 'Delivered';
      case 'opened':
      case 'open': return 'Opened';
      case 'clicked':
      case 'click': return 'Clicked';
      case 'bounced':
      case 'bounce': return 'Bounced';
      case 'failed': return 'Failed';
      default: return eventType;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Activity Feed
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {showHeader && (
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Live Activity
            {activities.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activities.length}
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Email events will appear here in real-time
            </p>
          </div>
        ) : (
          <ScrollArea className={compact ? "h-[300px]" : "h-[400px]"}>
            <div className="divide-y">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors",
                    compact && "py-3"
                  )}
                >
                  {/* Event Icon */}
                  <div className={cn(
                    "flex items-center justify-center rounded-full shrink-0",
                    compact ? "w-7 h-7" : "w-8 h-8",
                    activity.event_type === 'sent' && "bg-blue-100 dark:bg-blue-900/30",
                    activity.event_type === 'delivered' && "bg-green-100 dark:bg-green-900/30",
                    ['opened', 'open'].includes(activity.event_type) && "bg-emerald-100 dark:bg-emerald-900/30",
                    ['clicked', 'click'].includes(activity.event_type) && "bg-purple-100 dark:bg-purple-900/30",
                    ['bounced', 'bounce', 'failed'].includes(activity.event_type) && "bg-red-100 dark:bg-red-900/30"
                  )}>
                    {getEventIcon(activity.event_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {activity.recipient_name}
                      </span>
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-xs text-muted-foreground">
                        {getEventLabel(activity.event_type)}
                      </span>
                    </div>
                    {!compact && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {activity.subject}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Status indicator */}
                  <EmailStatusDot 
                    status={activity.event_type} 
                    size="sm" 
                    showTooltip={false}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

// Compact inline version for dashboard widgets
export const ActivityFeedWidget = ({ limit = 5 }: { limit?: number }) => {
  return (
    <CampaignActivityFeed 
      limit={limit} 
      compact 
      showHeader 
      className="border-0 shadow-none"
    />
  );
};
