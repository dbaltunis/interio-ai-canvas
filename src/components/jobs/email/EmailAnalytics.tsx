
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Mail, Eye, MousePointer, Archive } from "lucide-react";
import { useEmailKPIs } from "@/hooks/useEmails";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export const EmailAnalytics = () => {
  const { data: kpis } = useEmailKPIs();

  // Mock data for charts - in a real app, this would come from your analytics API
  const emailTrendData = [
    { month: 'Jan', sent: 45, opened: 32, clicked: 12 },
    { month: 'Feb', sent: 52, opened: 38, clicked: 18 },
    { month: 'Mar', sent: 48, opened: 35, clicked: 15 },
    { month: 'Apr', sent: 61, opened: 44, clicked: 22 },
    { month: 'May', sent: 55, opened: 41, clicked: 19 },
    { month: 'Jun', sent: 67, opened: 48, clicked: 25 },
  ];

  const statusData = [
    { name: 'Delivered', value: kpis?.totalSent || 0, color: '#10B981' },
    { name: 'Bounced', value: 2, color: '#EF4444' },
    { name: 'Pending', value: 1, color: '#F59E0B' },
  ];

  const deviceData = [
    { device: 'Desktop', opens: 45, clicks: 20 },
    { device: 'Mobile', opens: 62, clicks: 18 },
    { device: 'Tablet', opens: 20, clicks: 7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Email Analytics</h2>
          <p className="text-gray-600 text-sm mt-1">
            Track performance and engagement metrics
          </p>
        </div>
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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Total Sent
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kpis?.totalSent || 0}</div>
            <p className="text-xs text-green-600 mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Open Rate
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis?.openRate || 0}%</div>
            <p className="text-xs text-green-600 mt-1">+3.2% vs industry avg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center">
                <MousePointer className="w-4 h-4 mr-2" />
                Click Rate
              </div>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{kpis?.clickRate || 0}%</div>
            <p className="text-xs text-red-600 mt-1">-1.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center">
                <Archive className="w-4 h-4 mr-2" />
                Delivery Rate
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{kpis?.deliveryRate || 0}%</div>
            <p className="text-xs text-green-600 mt-1">+0.5% improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Email Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emailTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2} name="Sent" />
                <Line type="monotone" dataKey="opened" stroke="#10B981" strokeWidth={2} name="Opened" />
                <Line type="monotone" dataKey="clicked" stroke="#8B5CF6" strokeWidth={2} name="Clicked" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Delivery Status */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Opens by Device</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="device" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="opens" fill="#3B82F6" name="Opens" />
                <Bar dataKey="clicks" fill="#10B981" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Emails */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { subject: "Summer Sale - 20% Off All Services", openRate: 45.2, clickRate: 12.8 },
                { subject: "Your Project Update", openRate: 38.7, clickRate: 8.9 },
                { subject: "Thank You for Your Business", openRate: 52.1, clickRate: 15.3 },
                { subject: "Quote Follow-up", openRate: 28.4, clickRate: 6.2 },
              ].map((email, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{email.subject}</div>
                    <div className="flex gap-4 text-xs text-gray-600 mt-1">
                      <span>Open: {email.openRate}%</span>
                      <span>Click: {email.clickRate}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${email.openRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
