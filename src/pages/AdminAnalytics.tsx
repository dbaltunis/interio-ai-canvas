import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats, useAdminSignupsChart } from "@/hooks/useAdminStats";
import { useAdminAccounts } from "@/hooks/useAdminAccounts";
import { Users, TrendingUp, Clock, DollarSign } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export default function AdminAnalytics() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: signupsData } = useAdminSignupsChart(30);
  const { data: accounts } = useAdminAccounts();

  const subscriptionBreakdown = [
    { name: "Active", value: stats?.activeSubscriptions || 0, color: "#10b981" },
    { name: "Trial", value: stats?.trialSubscriptions || 0, color: "#f59e0b" },
    { name: "None", value: (stats?.totalAccounts || 0) - (stats?.activeSubscriptions || 0) - (stats?.trialSubscriptions || 0), color: "#6b7280" },
  ];

  const accountTypeBreakdown = accounts?.reduce((acc: Record<string, number>, account) => {
    acc[account.account_type] = (acc[account.account_type] || 0) + 1;
    return acc;
  }, {}) || {};

  const accountTypeData = Object.entries(accountTypeBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const recentSignups = accounts?.slice(0, 10) || [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Analytics</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAccounts || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newSignupsThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">Paying customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Accounts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.trialSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">Currently testing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthlyRevenue.toFixed(2) || 0}</div>
            <p className="text-xs text-muted-foreground">From active subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Signups (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={signupsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), "MMM dd")}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date), "MMM dd, yyyy")}
                />
                <Legend />
                <Line type="monotone" dataKey="signups" stroke="hsl(var(--primary))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Signups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSignups.map((account) => (
              <div key={account.user_id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{account.display_name || account.email}</p>
                  <p className="text-sm text-muted-foreground">{account.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm capitalize">{account.account_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(account.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
