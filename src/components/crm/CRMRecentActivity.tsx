import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, Phone, Calendar, FileText, MessageSquare,
  CheckCircle, TrendingUp
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { formatDistanceToNow } from "date-fns";

export const CRMRecentActivity = () => {
  const { data: clients } = useClients();

  // Get recent activities from clients
  const recentActivities = clients
    ?.filter(c => c.last_activity_date || c.last_contact_date || c.stage_changed_at)
    ?.sort((a, b) => {
      const dateA = new Date(a.last_activity_date || a.last_contact_date || a.stage_changed_at || 0);
      const dateB = new Date(b.last_activity_date || b.last_contact_date || b.stage_changed_at || 0);
      return dateB.getTime() - dateA.getTime();
    })
    ?.slice(0, 10) || [];

  const getActivityIcon = (client: any) => {
    if (client.last_activity_date) return Mail;
    if (client.last_contact_date) return Phone;
    return TrendingUp;
  };

  const getActivityText = (client: any) => {
    if (client.last_activity_date) return "Recent activity";
    if (client.last_contact_date) return "Last contacted";
    if (client.stage_changed_at) return "Stage changed";
    return "Updated";
  };

  const getActivityDate = (client: any) => {
    return client.last_activity_date || client.last_contact_date || client.stage_changed_at || client.updated_at;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              recentActivities.map((client) => {
                const Icon = getActivityIcon(client);
                const activityText = getActivityText(client);
                const activityDate = getActivityDate(client);

                return (
                  <div
                    key={client.id}
                    className="flex items-start gap-3 p-2 rounded-lg border hover:bg-accent/5 transition-colors"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {client.client_type === 'B2B' ? client.company_name : client.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{activityText}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {client.funnel_stage?.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activityDate), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
