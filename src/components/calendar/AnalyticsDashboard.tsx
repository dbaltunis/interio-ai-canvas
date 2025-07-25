import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Calendar, TrendingUp, Users, Clock, Mail, Phone } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState("7"); // days

  // Fetch booking analytics
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["booking-analytics", dateRange],
    queryFn: async () => {
      const days = parseInt(dateRange);
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');

      // Get bookings with scheduler details
      const { data: bookings, error } = await supabase
        .from("appointments_booked")
        .select(`
          *,
          scheduler:appointment_schedulers(name, duration)
        `)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Process data for charts
      const dailyBookings = [];
      const statusCounts = { confirmed: 0, cancelled: 0, completed: 0, "no-show": 0 };
      const schedulerStats = new Map();

      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayBookings = bookings?.filter(b => 
          format(new Date(b.created_at), 'yyyy-MM-dd') === dateStr
        ) || [];

        dailyBookings.push({
          date: format(date, 'MMM dd'),
          bookings: dayBookings.length,
          confirmed: dayBookings.filter(b => b.status === 'confirmed').length,
          cancelled: dayBookings.filter(b => b.status === 'cancelled').length,
        });
      }

      // Count statuses
      bookings?.forEach(booking => {
        statusCounts[booking.status as keyof typeof statusCounts]++;
        
        // Count by scheduler
        const schedulerName = booking.scheduler?.name || 'Unknown';
        const current = schedulerStats.get(schedulerName) || { name: schedulerName, count: 0, revenue: 0 };
        schedulerStats.set(schedulerName, { 
          ...current, 
          count: current.count + 1,
          revenue: current.revenue + (booking.scheduler?.duration * 2 || 0) // Assuming $2/minute
        });
      });

      const schedulerData = Array.from(schedulerStats.values()).slice(0, 5);

      return {
        totalBookings: bookings?.length || 0,
        dailyBookings,
        statusCounts,
        schedulerData,
        conversionRate: bookings?.length ? 
          (statusCounts.confirmed + statusCounts.completed) / bookings.length * 100 : 0,
        totalRevenue: Array.from(schedulerStats.values()).reduce((sum, s) => sum + s.revenue, 0)
      };
    },
  });

  const statusColors = {
    confirmed: "#10b981",
    completed: "#3b82f6", 
    cancelled: "#ef4444",
    "no-show": "#6b7280"
  };

  const pieData = analyticsData ? Object.entries(analyticsData.statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: statusColors[status as keyof typeof statusColors]
  })) : [];

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {[
            { value: "7", label: "7 Days" },
            { value: "30", label: "30 Days" },
            { value: "90", label: "90 Days" }
          ].map((option) => (
            <Button
              key={option.value}
              variant={dateRange === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{analyticsData?.totalBookings || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analyticsData?.conversionRate.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{analyticsData?.statusCounts.confirmed || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${analyticsData?.totalRevenue || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Bookings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.dailyBookings || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Total Bookings"
                />
                <Line 
                  type="monotone" 
                  dataKey="confirmed" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Confirmed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Schedulers */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Appointment Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.schedulerData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="font-medium">Confirmed</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {analyticsData?.statusCounts.confirmed || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Completed</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {analyticsData?.statusCounts.completed || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-red-600" />
                <span className="font-medium">Cancelled</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                {analyticsData?.statusCounts.cancelled || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-600" />
                <span className="font-medium">No Show</span>
              </div>
              <span className="text-lg font-bold text-gray-600">
                {analyticsData?.statusCounts["no-show"] || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};