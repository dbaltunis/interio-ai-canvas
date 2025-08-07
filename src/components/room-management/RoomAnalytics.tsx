import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Home, DollarSign, Clock, TrendingUp, Package, AlertTriangle } from "lucide-react";

interface RoomAnalyticsProps {
  rooms: any[];
  surfaces: any[];
  treatments: any[];
}

export const RoomAnalytics = ({ rooms, surfaces, treatments }: RoomAnalyticsProps) => {
  // Calculate room statistics
  const roomStats = rooms?.map(room => {
    const roomSurfaces = surfaces?.filter(s => s.room_id === room.id) || [];
    const roomTreatments = treatments?.filter(t => t.room_id === room.id) || [];
    const roomValue = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
    
    return {
      ...room,
      surfaceCount: roomSurfaces.length,
      treatmentCount: roomTreatments.length,
      totalValue: roomValue,
      completionRate: roomTreatments.length > 0 ? 
        (roomTreatments.filter(t => t.status === 'completed').length / roomTreatments.length) * 100 : 0
    };
  }) || [];

  // Room type distribution
  const roomTypeData = roomStats.reduce((acc, room) => {
    const type = room.room_type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(roomTypeData).map(([type, count]) => ({
    name: type.replace('_', ' ').toUpperCase(),
    value: count,
    color: getTypeColor(type)
  }));

  // Room value chart data
  const valueChartData = roomStats
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5)
    .map(room => ({
      name: room.name,
      value: room.totalValue,
      surfaces: room.surfaceCount,
      treatments: room.treatmentCount
    }));

  // Overall statistics
  const totalValue = roomStats.reduce((sum, room) => sum + room.totalValue, 0);
  const totalSurfaces = surfaces?.length || 0;
  const totalTreatments = treatments?.length || 0;
  const avgCompletionRate = roomStats.length > 0 ? 
    roomStats.reduce((sum, room) => sum + room.completionRate, 0) / roomStats.length : 0;

  // Status distribution
  const statusData = treatments?.reduce((acc, treatment) => {
    const status = treatment.status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
                <p className="text-2xl font-bold">{rooms?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Surfaces</p>
                <p className="text-2xl font-bold">{totalSurfaces}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">{avgCompletionRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Value Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5" />
              <span>Room Values</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={valueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'value' ? `$${Number(value).toLocaleString()}` : String(value),
                    name === 'value' ? 'Value' : name
                  ]}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Room Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Home className="h-5 w-5" />
              <span>Room Types</span>
            </CardTitle>
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
      </div>

      {/* Room Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Room Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roomStats.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{room.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {room.room_type?.replace('_', ' ')} • {room.surfaceCount} surfaces • {room.treatmentCount} treatments
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">${room.totalValue.toLocaleString()}</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={room.completionRate} className="w-20" />
                      <span className="text-xs text-muted-foreground">{room.completionRate.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <Badge variant={room.completionRate === 100 ? "default" : room.completionRate > 50 ? "secondary" : "outline"}>
                    {room.completionRate === 100 ? "Complete" : room.completionRate > 50 ? "In Progress" : "Starting"}
                  </Badge>
                </div>
              </div>
            ))}
            
            {roomStats.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No rooms found. Create your first room to see analytics.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Treatment Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Treatment Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statusData).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{Number(count)}</div>
                <div className="text-sm capitalize">{status.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    living_room: "#3B82F6",
    bedroom: "#10B981",
    kitchen: "#F59E0B",
    bathroom: "hsl(var(--primary))",
    dining_room: "#EF4444",
    office: "#6B7280",
    unknown: "#9CA3AF"
  };
  return colors[type] || colors.unknown;
}