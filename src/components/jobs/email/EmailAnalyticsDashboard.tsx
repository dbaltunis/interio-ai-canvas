import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, Send, CheckCircle2, Eye, MousePointerClick, 
  XCircle, TrendingUp, TrendingDown, Clock
} from "lucide-react";
import { useEmails, useEmailKPIs } from "@/hooks/useEmails";
import { useEmailCampaigns } from "@/hooks/useEmailCampaigns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

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

  const metrics = [
    {
      label: 'Total Sent',
      value: kpis?.totalSent || 0,
      icon: Send,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Delivered',
      value: kpis?.totalDelivered || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      subValue: `${kpis?.deliveryRate || 0}%`,
    },
    {
      label: 'Open Rate',
      value: `${kpis?.openRate || 0}%`,
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      trend: (kpis?.openRate || 0) > 20 ? 'up' : 'down',
    },
    {
      label: 'Click Rate',
      value: `${kpis?.clickRate || 0}%`,
      icon: MousePointerClick,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      trend: (kpis?.clickRate || 0) > 3 ? 'up' : 'down',
    },
    {
      label: 'Bounced',
      value: kpis?.totalBounced || 0,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      subValue: `${kpis?.bounceRate || 0}%`,
    },
  ];

  if (emails.length === 0) {
    return (
      <Card className="bg-muted/20">
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
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={cn("p-2 rounded-lg", metric.bgColor)}>
                    <Icon className={cn("h-4 w-4", metric.color)} />
                  </div>
                  {metric.trend && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        metric.trend === 'up' 
                          ? "text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20" 
                          : "text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20"
                      )}
                    >
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                      )}
                      {metric.trend === 'up' ? 'Good' : 'Low'}
                    </Badge>
                  )}
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                    {metric.subValue && (
                      <Badge variant="secondary" className="text-xs">
                        {metric.subValue}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Email Activity Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Email Activity (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="openedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
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
                    stroke="#22c55e" 
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {campaignData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No campaigns sent yet</p>
                </div>
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 11 }} 
                      tickLine={false} 
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
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

      {/* Avg Time Spent */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Time Spent Reading</p>
                <p className="text-xl font-bold">{kpis?.avgTimeSpent || '0m 0s'}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              Across all emails
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
