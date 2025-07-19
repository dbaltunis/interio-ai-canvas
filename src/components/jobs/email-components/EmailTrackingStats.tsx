
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmails } from "@/hooks/useEmails";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Mail, Eye, MousePointer, TrendingUp } from "lucide-react";

interface EmailTrackingStatsProps {
  clientId?: string;
}

export const EmailTrackingStats = ({ clientId }: EmailTrackingStatsProps) => {
  const { data: emails = [] } = useEmails();

  // Filter emails by client if specified
  const filteredEmails = clientId 
    ? emails.filter(email => email.client_id === clientId)
    : emails;

  // Mock stats until database columns are added
  const stats = {
    total: filteredEmails.length,
    sent: filteredEmails.filter(email => email.status === 'sent').length,
    delivered: filteredEmails.filter(email => email.status === 'delivered').length,
    opened: filteredEmails.filter(email => email.status === 'opened').length,
    clicked: filteredEmails.filter(email => email.status === 'clicked').length,
    bounced: filteredEmails.filter(email => email.status === 'bounced').length,
    failed: filteredEmails.filter(email => email.status === 'failed').length,
    totalOpens: filteredEmails.reduce((sum, email) => sum + (email.open_count || 0), 0),
    totalClicks: filteredEmails.reduce((sum, email) => sum + (email.click_count || 0), 0)
  };

  const chartData = [
    { name: 'Sent', value: stats.sent },
    { name: 'Delivered', value: stats.delivered },
    { name: 'Opened', value: stats.opened },
    { name: 'Clicked', value: stats.clicked },
    { name: 'Bounced', value: stats.bounced }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total} total emails
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.sent > 0 ? Math.round((stats.opened / stats.sent) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOpens} total opens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.sent > 0 ? Math.round((stats.clicked / stats.sent) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalClicks} total clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.sent > 0 ? Math.round((stats.bounced / stats.sent) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.bounced} bounced
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
