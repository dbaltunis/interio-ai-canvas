
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/useClients";
import { DollarSign, Users, TrendingUp, Calendar } from "lucide-react";

export const ClientFunnelDashboard = () => {
  const { data: clients } = useClients();

  const funnelStages = [
    { name: "Lead", color: "bg-blue-100 text-blue-800", count: 0, value: 0 },
    { name: "Qualified", color: "bg-yellow-100 text-yellow-800", count: 0, value: 0 },
    { name: "Proposal", color: "bg-purple-100 text-purple-800", count: 0, value: 0 },
    { name: "Negotiation", color: "bg-orange-100 text-orange-800", count: 0, value: 0 },
    { name: "Closed Won", color: "bg-green-100 text-green-800", count: 0, value: 0 },
    { name: "Closed Lost", color: "bg-red-100 text-red-800", count: 0, value: 0 },
  ];

  // Calculate funnel metrics
  const stageMetrics = funnelStages.map(stage => {
    const stageClients = clients?.filter(client => client.funnel_stage === stage.name.toLowerCase().replace(' ', '_')) || [];
    return {
      ...stage,
      count: stageClients.length,
      value: stageClients.reduce((sum, client) => sum + (client.lifetime_revenue || 0), 0)
    };
  });

  const totalClients = clients?.length || 0;
  const totalValue = stageMetrics.reduce((sum, stage) => sum + stage.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalClients > 0 ? Math.round((stageMetrics.find(s => s.name === 'Closed Won')?.count || 0) / totalClients * 100) : 0}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalClients > 0 ? Math.round(totalValue / totalClients).toLocaleString() : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stageMetrics.map((stage, index) => (
              <div key={stage.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{stage.name}</h3>
                    <p className="text-sm text-gray-600">{stage.count} clients</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={stage.color}>${stage.value.toLocaleString()}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
