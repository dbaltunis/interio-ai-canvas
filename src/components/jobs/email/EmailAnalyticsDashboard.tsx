import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Send, BarChart3, RefreshCw } from "lucide-react";
import { useEmails, useEmailKPIs } from "@/hooks/useEmails";
import { useEmailCampaigns } from "@/hooks/useEmailCampaigns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, startOfDay, eachDayOfInterval, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { DashboardDateFilter } from "@/components/dashboard/DashboardDateFilter";
import { DashboardDateProvider } from "@/contexts/DashboardDateContext";

const EmailAnalyticsDashboardInner = () => {
  const { data: emails = [], refetch, isRefetching } = useEmails();
  const { data: kpis } = useEmailKPIs();
  const { data: campaigns = [] } = useEmailCampaigns();
  
  // Local date range state
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  // Filter emails by selected date range
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      const emailDate = new Date(email.created_at);
      return emailDate >= dateRange.startDate && emailDate <= dateRange.endDate;
    });
  }, [emails, dateRange]);

  // Calculate KPIs from filtered emails
  const filteredKpis = useMemo(() => {
    const totalSent = filteredEmails.length;
    const delivered = filteredEmails.filter(e => ['delivered', 'opened', 'clicked'].includes(e.status)).length;
    const opened = filteredEmails.filter(e => (e.open_count || 0) > 0).length;
    const clicked = filteredEmails.filter(e => (e.click_count || 0) > 0).length;
    const bounced = filteredEmails.filter(e => ['bounced', 'failed'].includes(e.status)).length;

    return {
      totalSent,
      totalDelivered: delivered,
      deliveryRate: totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0,
      openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
      clickRate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0,
      totalBounced: bounced,
      bounceRate: totalSent > 0 ? Math.round((bounced / totalSent) * 100) : 0,
    };
  }, [filteredEmails]);

  // Generate chart data based on date range
  const chartData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.startDate, end: dateRange.endDate });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEmails = filteredEmails.filter(email => {
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
  }, [filteredEmails, dateRange]);

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
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">Email Analytics</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {filteredEmails.length} emails in selected period
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <DashboardDateFilter />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                disabled={isRefetching}
                title="Refresh analytics data"
                className="h-7 w-7"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Primary KPIs - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg border border-border/50 bg-card">
              <div className="text-[10px] text-muted-foreground mb-0.5">Total Sent</div>
              <p className="text-lg font-bold">{filteredKpis.totalSent}</p>
            </div>
            <div className="p-2 rounded-lg border border-border/50 bg-card">
              <div className="text-[10px] text-muted-foreground mb-0.5">Delivered</div>
              <p className="text-lg font-bold">{filteredKpis.totalDelivered}</p>
              <p className="text-[10px] text-muted-foreground">{filteredKpis.deliveryRate}% rate</p>
            </div>
            <div className="p-2 rounded-lg border border-border/50 bg-card">
              <div className="text-[10px] text-muted-foreground mb-0.5">Open Rate</div>
              <p className="text-lg font-bold">{filteredKpis.openRate}%</p>
            </div>
            <div className="p-2 rounded-lg border border-border/50 bg-card">
              <div className="text-[10px] text-muted-foreground mb-0.5">Click Rate</div>
              <p className="text-lg font-bold">{filteredKpis.clickRate}%</p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-card">
            <div className="flex items-center gap-2">
              <div className="text-[10px] text-muted-foreground">Bounced</div>
              <p className="text-sm font-semibold">{filteredKpis.totalBounced}</p>
              <span className="text-[10px] text-muted-foreground">({filteredKpis.bounceRate}%)</span>
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
              <span>Email Activity</span>
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

// Wrap with provider so DashboardDateFilter works
export const EmailAnalyticsDashboard = () => {
  return (
    <DashboardDateProvider>
      <EmailAnalyticsDashboardInner />
    </DashboardDateProvider>
  );
};
