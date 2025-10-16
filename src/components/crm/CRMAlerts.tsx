import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, TrendingUp, FileText, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, isPast, isWithinInterval, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";

export const CRMAlerts = () => {
  const navigate = useNavigate();
  
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["crm-alerts"],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const sevenDaysFromNow = addDays(now, 7);

      // Get clients with various alert conditions
      const { data: clients } = await supabase
        .from("clients")
        .select("*, deals(*)");

      const overdueFollowUps = clients?.filter(c => 
        c.follow_up_date && isPast(new Date(c.follow_up_date)) && !['approved', 'lost'].includes(c.funnel_stage)
      ) || [];

      const hotLeadsNeedingAction = clients?.filter(c => 
        (c.lead_score || 0) > 70 && 
        (!c.last_activity_date || new Date(c.last_activity_date) < sevenDaysAgo)
      ) || [];

      const dealsClosingSoon = clients?.filter(c => {
        const hasUpcomingDeals = c.deals?.some((d: any) => 
          d.expected_close_date && 
          isWithinInterval(new Date(d.expected_close_date), { start: now, end: sevenDaysFromNow })
        );
        return hasUpcomingDeals;
      }) || [];

      const inactiveHighValue = clients?.filter(c =>
        (c.deal_value || 0) > 5000 &&
        (!c.last_activity_date || new Date(c.last_activity_date) < new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000))
      ) || [];

      return [
        ...overdueFollowUps.map(c => ({
          id: c.id,
          type: "overdue_followup",
          title: "Overdue Follow-up",
          message: `${c.company_name || c.name} - Follow-up was ${formatDistanceToNow(new Date(c.follow_up_date!))} ago`,
          icon: AlertCircle,
          color: "text-red-600",
          client: c,
        })),
        ...hotLeadsNeedingAction.map(c => ({
          id: c.id,
          type: "hot_lead",
          title: "Hot Lead Needs Action",
          message: `${c.company_name || c.name} - Score: ${c.lead_score}, No activity for ${c.last_activity_date ? formatDistanceToNow(new Date(c.last_activity_date)) : 'unknown time'}`,
          icon: TrendingUp,
          color: "text-orange-600",
          client: c,
        })),
        ...dealsClosingSoon.map(c => ({
          id: c.id,
          type: "closing_soon",
          title: "Deal Closing Soon",
          message: `${c.company_name || c.name} - Deal closing within 7 days`,
          icon: Calendar,
          color: "text-blue-600",
          client: c,
        })),
        ...inactiveHighValue.map(c => ({
          id: c.id,
          type: "high_value_inactive",
          title: "High-Value Lead Inactive",
          message: `${c.company_name || c.name} - $${(c.deal_value || 0).toLocaleString()} deal, inactive for ${c.last_activity_date ? formatDistanceToNow(new Date(c.last_activity_date)) : 'unknown time'}`,
          icon: DollarSign,
          color: "text-purple-600",
          client: c,
        })),
      ].slice(0, 10); // Limit to top 10 alerts
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Action Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Action Center</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No urgent actions required. Great job!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Action Center
          <Badge variant="destructive">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={`${alert.type}-${alert.id}`}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/?tab=clients&client=${alert.id}`)}
            >
              <alert.icon className={`h-5 w-5 mt-0.5 ${alert.color}`} />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">{alert.title}</p>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost">View</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};