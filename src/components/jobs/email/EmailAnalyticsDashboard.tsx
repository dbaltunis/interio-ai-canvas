import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, Eye, MousePointerClick, BarChart3 } from "lucide-react";
import { useEmails, useEmailKPIs } from "@/hooks/useEmails";
import { useEmailCampaigns } from "@/hooks/useEmailCampaigns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { useMemo } from "react";

export const EmailAnalyticsDashboard = () => {
  const { data: emails = [] } = useEmails();
  const { data: kpis } = useEmailKPIs();
  const { data: campaigns = [] } = useEmailCampaigns();

  // Generate last 14 days chart data
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 13);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEmails = emails.filter(email => {
        const emailDate = startOfDay(new Date(email.created_at));
        return emailDate.getTime() === dayStart.getTime();
      });

      return {
        date: format(day, 'MMM d'),
        sent: dayEmails.length,
        opened: dayEmails.filter(e => (e.open_count || 0) > 0).length,
        clicked: dayEmails.filter(e => (e.click_count || 0) > 0).length,
      };
    });
  }, [emails]);

  // Campaign performance data
  const campaignData = useMemo(() => {
    return campaigns
      .filter(c => c.status === 'sent' || c.status === 'completed')
      .slice(0, 5)
      .map(campaign => ({
        name: campaign.name.length > 15 ? campaign.name.slice(0, 15) + '...' : campaign.name,
        recipients: campaign.recipient_count || 0,
      }));
  }, [campaigns]);

  if (emails.length === 0) {
    return (
      <Card variant="analytics" className="h-full">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Analytics Yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Start sending emails to see performance metrics and trends here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Analytics Card - Shopify Style */}
      <Card variant="analytics" className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <span>Email Analytics</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Performance overview • {emails.length} total emails
          </p>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Primary KPIs - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg border border-border/50 bg-card">
              <div className="text-[10px] text-muted-foreground mb-0.5">Total Sent</div>
              <p className="text-lg font-bold">{kpis?.totalSent || 0}</p>
            </div>
            <div className="p-2 rounded-lg border border-border/50 bg-card">
              <div className="text-[10px] text-muted-foreground mb-0.5">Delivered</div>
              <p className="text-lg font-bold">{kpis?.totalDelivered || 0}</p>
              <p className="text-[10px] text-muted-foreground">{kpis?.deliveryRate || 0}% rate</p>
            </div>
            <div className="p-2 rounded-lg border border-border/50 bg-card">
              <div className="text-[10px] text-muted-foreground mb-0.5">Open Rate</div>
              <p className="text-lg font-bold">{kpis?.openRate || 0}%</p>
            </div>
            <div className="p-2 rounded-lg border border-border/50 bg-card">
              <div className="text-[10px] text-muted-foreground mb-0.5">Click Rate</div>
              <p className="text-lg font-bold">{kpis?.clickRate || 0}%</p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-card">
            <div className="flex items-center gap-2">
              <div className="text-[10px] text-muted-foreground">Bounced</div>
              <p className="text-sm font-semibold">{kpis?.totalBounced || 0}</p>
              <span className="text-[10px] text-muted-foreground">({kpis?.bounceRate || 0}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[10px] text-muted-foreground">Avg. Read Time</div>
              <p className="text-sm font-semibold">{kpis?.avgTimeSpent || '0m 0s'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Email Activity Chart */}
        <Card variant="analytics">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BarChart3 className="h-4 w-4 text-primary shrink-0" />
              <span>Email Activity (Last 14 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="openedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sent" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#sentGradient)"
                    strokeWidth={2}
                    name="Sent"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="opened" 
                    stroke="hsl(var(--chart-2))" 
                    fill="url(#openedGradient)"
                    strokeWidth={2}
                    name="Opened"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card variant="analytics">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Send className="h-4 w-4 text-primary shrink-0" />
              <span>Recent Campaigns</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {campaignData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Send className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No campaigns sent yet</p>
                </div>
              </div>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 10 }} 
                      tickLine={false} 
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Bar 
                      dataKey="recipients" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                      name="Recipients"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
