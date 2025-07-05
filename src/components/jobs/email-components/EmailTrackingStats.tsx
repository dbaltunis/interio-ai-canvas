import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MousePointer, CheckCircle, XCircle, Clock } from "lucide-react";

export const EmailTrackingStats = () => {
  const { data: emailStats } = useQuery({
    queryKey: ['email-tracking-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get recent email stats
      const { data: emails, error } = await supabase
        .from('emails')
        .select('status, open_count, click_count, sent_at, delivered_at, opened_at, clicked_at')
        .eq('user_id', user.id)
        .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('sent_at', { ascending: false });

      if (error) throw error;

      const stats = {
        total: emails?.length || 0,
        sent: emails?.filter(e => e.status === 'sent' || e.status === 'delivered' || e.status === 'opened' || e.status === 'clicked').length || 0,
        delivered: emails?.filter(e => e.status === 'delivered' || e.status === 'opened' || e.status === 'clicked').length || 0,
        opened: emails?.filter(e => e.status === 'opened' || e.status === 'clicked').length || 0,
        clicked: emails?.filter(e => e.status === 'clicked').length || 0,
        bounced: emails?.filter(e => e.status === 'bounced' || e.status === 'failed').length || 0,
        totalOpens: emails?.reduce((sum, e) => sum + (e.open_count || 0), 0) || 0,
        totalClicks: emails?.reduce((sum, e) => sum + (e.click_count || 0), 0) || 0,
      };

      return { emails, stats };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!emailStats) return null;

  const { stats } = emailStats;

  const getOpenRate = () => {
    if (stats.delivered === 0) return 0;
    return Math.round((stats.opened / stats.delivered) * 100);
  };

  const getClickRate = () => {
    if (stats.delivered === 0) return 0;
    return Math.round((stats.clicked / stats.delivered) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Email Tracking Stats (Last 7 Days)
        </CardTitle>
        <CardDescription>
          Real-time tracking data from SendGrid webhook
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
            <div className="text-sm text-blue-600">Emails Sent</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-sm text-green-600">Delivered</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.opened}</div>
            <div className="text-sm text-purple-600">Opened</div>
            <Badge variant="secondary" className="mt-1 text-xs">
              {getOpenRate()}% rate
            </Badge>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.clicked}</div>
            <div className="text-sm text-orange-600">Clicked</div>
            <Badge variant="secondary" className="mt-1 text-xs">
              {getClickRate()}% rate
            </Badge>
          </div>
        </div>

        {stats.bounced > 0 && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">{stats.bounced} emails bounced or failed</span>
            </div>
          </div>
        )}

        {stats.totalOpens > stats.opened && (
          <div className="mt-2 text-sm text-muted-foreground">
            Total opens: {stats.totalOpens} (some emails opened multiple times)
          </div>
        )}
      </CardContent>
    </Card>
  );
};