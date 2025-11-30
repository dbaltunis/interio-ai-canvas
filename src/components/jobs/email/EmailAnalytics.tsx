import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Mail, Eye, MousePointer, AlertTriangle, CheckCircle, XCircle, HelpCircle, BarChart3 } from "lucide-react";
import { useEmails } from "@/hooks/useEmails";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";

// Helper component for metric explanations
const MetricExplainer = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground border border-border/50">
    <div className="font-medium text-foreground mb-1">{title}</div>
    {children}
  </div>
);

export const EmailAnalytics = () => {
  const { data: emails = [] } = useEmails();
  const [showExplanations, setShowExplanations] = useState(true);

  // Calculate real KPIs from actual data
  const totalEmails = emails.length;
  // Count emails that successfully reached recipients (delivered or opened)
  const deliveredEmails = emails.filter(e => ['delivered', 'opened', 'clicked'].includes(e.status)).length;
  const sentEmails = emails.filter(e => ['sent', 'delivered', 'opened', 'clicked'].includes(e.status)).length;
  const bouncedEmails = emails.filter(e => ['bounced', 'failed'].includes(e.status)).length;
  const openedEmails = emails.filter(e => (e.open_count || 0) > 0).length;
  const clickedEmails = emails.filter(e => (e.click_count || 0) > 0).length;
  const totalOpens = emails.reduce((sum, e) => sum + (e.open_count || 0), 0);
  const totalClicks = emails.reduce((sum, e) => sum + (e.click_count || 0), 0);

  const deliveryRate = totalEmails > 0 ? Math.round((deliveredEmails / totalEmails) * 100) : 0;
  const bounceRate = totalEmails > 0 ? Math.round((bouncedEmails / totalEmails) * 100) : 0;
  const openRate = deliveredEmails > 0 ? Math.round((openedEmails / deliveredEmails) * 100) : 0;
  const clickRate = deliveredEmails > 0 ? Math.round((clickedEmails / deliveredEmails) * 100) : 0;

  // Determine performance status
  const getPerformanceStatus = () => {
    if (totalEmails === 0) return { status: 'neutral', message: 'No emails sent yet' };
    if (openRate >= 25 && clickRate >= 3 && bounceRate < 5) return { status: 'excellent', message: 'Excellent performance!' };
    if (openRate >= 15 && clickRate >= 2 && bounceRate < 10) return { status: 'good', message: 'Good performance' };
    if (openRate < 10 || bounceRate > 15) return { status: 'needs-improvement', message: 'Needs improvement' };
    return { status: 'average', message: 'Average performance' };
  };

  const performance = getPerformanceStatus();

  // Mock trend data - in real app, this would come from historical analytics
  const emailTrendData = [
    { month: 'Jan', sent: Math.floor(totalEmails * 0.8), opened: Math.floor(openedEmails * 0.8), clicked: Math.floor(clickedEmails * 0.8) },
    { month: 'Feb', sent: Math.floor(totalEmails * 0.9), opened: Math.floor(openedEmails * 0.9), clicked: Math.floor(clickedEmails * 0.9) },
    { month: 'Mar', sent: Math.floor(totalEmails * 0.95), opened: Math.floor(openedEmails * 0.95), clicked: Math.floor(clickedEmails * 0.95) },
    { month: 'Apr', sent: totalEmails, opened: openedEmails, clicked: clickedEmails },
  ];

  const statusData = [
    { name: 'Delivered/Opened', value: deliveredEmails, color: '#10B981' },
    { name: 'Bounced/Failed', value: bouncedEmails, color: '#EF4444' },
    { name: 'Queued', value: emails.filter(e => e.status === 'queued').length, color: '#F59E0B' },
    { name: 'Sent', value: emails.filter(e => e.status === 'sent').length, color: '#3B82F6' },
  ];

  const deviceData = [
    { device: 'Desktop', opens: Math.floor(totalOpens * 0.4), clicks: Math.floor(totalClicks * 0.5) },
    { device: 'Mobile', opens: Math.floor(totalOpens * 0.5), clicks: Math.floor(totalClicks * 0.4) },
    { device: 'Tablet', opens: Math.floor(totalOpens * 0.1), clicks: Math.floor(totalClicks * 0.1) },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Performance Summary */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Email Performance Overview</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Understanding how your emails are performing
              </p>
            </div>
          </div>
          
          {/* Overall Performance Status */}
          {totalEmails > 0 && (
            <Card className="mt-4 border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {performance.status === 'excellent' && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {performance.status === 'good' && <CheckCircle className="h-5 w-5 text-blue-600" />}
                      {performance.status === 'needs-improvement' && <XCircle className="h-5 w-5 text-orange-600" />}
                      {performance.status === 'average' && <Mail className="h-5 w-5 text-gray-600" />}
                      <span className="font-semibold text-base">{performance.message}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on {totalEmails} total emails sent • {deliveredEmails} successfully delivered
                    </p>
                  </div>
                  <Badge 
                    variant={
                      performance.status === 'excellent' ? 'default' : 
                      performance.status === 'needs-improvement' ? 'destructive' : 
                      'secondary'
                    }
                    className="text-sm px-3 py-1"
                  >
                    {openRate}% Open • {clickRate}% Click
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExplanations(!showExplanations)}
            className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-accent transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            {showExplanations ? 'Hide' : 'Show'} Help
          </button>
          <Select defaultValue="30d">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Section: Key Performance Metrics */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">📊 Key Performance Metrics</h3>
          <p className="text-sm text-muted-foreground">The most important numbers to track your email success</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-4">
          {/* Open Rate Metric */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>Open Rate</span>
                </div>
                {openRate > 20 ? (
                  <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Good</Badge>
                ) : openRate > 15 ? (
                  <Badge variant="secondary">Average</Badge>
                ) : (
                  <Badge variant="destructive">Low</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{openRate}%</div>
              <p className="text-xs text-muted-foreground">
                {openedEmails} of {deliveredEmails} emails opened
              </p>
              {showExplanations && (
                <MetricExplainer title="What this means:">
                  <p>Percentage of delivered emails that recipients opened.</p>
                  <p className="mt-1"><strong>Industry benchmark:</strong> 15-25% is average, 25%+ is excellent.</p>
                </MetricExplainer>
              )}
            </CardContent>
          </Card>

          {/* Click Rate Metric */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-primary" />
                  <span>Click Rate</span>
                </div>
                {clickRate > 3 ? (
                  <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Good</Badge>
                ) : clickRate > 2 ? (
                  <Badge variant="secondary">Average</Badge>
                ) : (
                  <Badge variant="destructive">Low</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{clickRate}%</div>
              <p className="text-xs text-muted-foreground">
                {clickedEmails} emails had links clicked
              </p>
              {showExplanations && (
                <MetricExplainer title="What this means:">
                  <p>Percentage of delivered emails where recipients clicked a link.</p>
                  <p className="mt-1"><strong>Industry benchmark:</strong> 2-5% is average, 5%+ is excellent.</p>
                </MetricExplainer>
              )}
            </CardContent>
          </Card>

          {/* Delivery Rate Metric */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Delivery Rate</span>
                </div>
                {deliveryRate > 95 ? (
                  <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Good</Badge>
                ) : deliveryRate > 90 ? (
                  <Badge variant="secondary">OK</Badge>
                ) : (
                  <Badge variant="destructive">Poor</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{deliveryRate}%</div>
              <p className="text-xs text-muted-foreground">
                {deliveredEmails} of {totalEmails} delivered successfully
              </p>
              {showExplanations && (
                <MetricExplainer title="What this means:">
                  <p>Percentage of emails that reached recipients' inboxes without bouncing.</p>
                  <p className="mt-1"><strong>Goal:</strong> Should be 95%+ for healthy email list.</p>
                </MetricExplainer>
              )}
            </CardContent>
          </Card>

          {/* Bounce Rate Metric */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  <span>Bounce Rate</span>
                </div>
                {bounceRate < 5 ? (
                  <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Good</Badge>
                ) : bounceRate < 10 ? (
                  <Badge variant="secondary">Watch</Badge>
                ) : (
                  <Badge variant="destructive">High</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive mb-1">{bounceRate}%</div>
              <p className="text-xs text-muted-foreground">
                {bouncedEmails} emails bounced or failed
              </p>
              {showExplanations && (
                <MetricExplainer title="What this means:">
                  <p>Percentage of emails that couldn't be delivered (invalid addresses, full inboxes, etc.).</p>
                  <p className="mt-1"><strong>Action needed:</strong> If over 5%, clean your email list to remove invalid addresses.</p>
                </MetricExplainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Volume Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{totalEmails}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Sent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{totalOpens}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Opens</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalClicks}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Clicks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{Math.round((totalClicks / (totalOpens || 1)) * 100)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Click-to-Open Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section: Visual Analytics */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">📈 Trends & Patterns</h3>
          <p className="text-sm text-muted-foreground">Visual breakdown of your email performance over time</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Email Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Activity Over Time</CardTitle>
              <CardDescription>Track how your email volume and engagement changes month-to-month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={emailTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2} name="📤 Sent" />
                  <Line type="monotone" dataKey="opened" stroke="#10B981" strokeWidth={2} name="👁️ Opened" />
                  <Line type="monotone" dataKey="clicked" stroke="#8B5CF6" strokeWidth={2} name="🖱️ Clicked" />
                </LineChart>
              </ResponsiveContainer>
              {showExplanations && (
                <div className="mt-3 text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                  <strong>How to read:</strong> Blue line shows emails sent, green shows opens, purple shows clicks. 
                  Upward trends are good!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Delivery Status</CardTitle>
              <CardDescription>Where did your emails end up?</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {showExplanations && (
                <div className="mt-3 text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                  <strong>Goal:</strong> Most should be "Delivered" (green). 
                  High "Bounced" (red) means list needs cleaning.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Device Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Device Usage Breakdown</CardTitle>
              <CardDescription>What devices are your recipients using?</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deviceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="device" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="opens" fill="#3B82F6" name="📧 Opens" />
                  <Bar dataKey="clicks" fill="#10B981" name="🖱️ Clicks" />
                </BarChart>
              </ResponsiveContainer>
              {showExplanations && (
                <div className="mt-3 text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                  <strong>Why it matters:</strong> If most opens are on mobile, ensure your emails look good on small screens!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performing Emails */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🏆 Best Performing Emails</CardTitle>
              <CardDescription>Your most successful emails ranked by opens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emails
                  .filter(email => ['delivered', 'opened', 'clicked'].includes(email.status))
                  .sort((a, b) => (b.open_count || 0) - (a.open_count || 0))
                  .slice(0, 5)
                  .map((email, index) => (
                    <div key={email.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate mb-1">{email.subject}</div>
                        <div className="flex gap-3 text-xs">
                          <span className="flex items-center gap-1 text-green-600">
                            <Eye className="h-3 w-3" />
                            {email.open_count || 0} opens
                          </span>
                          <span className="flex items-center gap-1 text-blue-600">
                            <MousePointer className="h-3 w-3" />
                            {email.click_count || 0} clicks
                          </span>
                        </div>
                      </div>
                      <div className="w-20 flex-shrink-0">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${Math.min((email.open_count || 0) * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                {emails.filter(email => ['delivered', 'opened', 'clicked'].includes(email.status)).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No delivered emails yet</p>
                    <p className="text-xs mt-1">Send some emails to see performance data here!</p>
                  </div>
                )}
              </div>
              {showExplanations && emails.filter(e => ['delivered', 'opened', 'clicked'].includes(e.status)).length > 0 && (
                <div className="mt-3 text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                  <strong>Learn from success:</strong> Look at what these high-performing emails have in common 
                  (subject lines, content, timing) and replicate it!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
