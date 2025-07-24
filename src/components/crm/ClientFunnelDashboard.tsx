import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { ClientProfilePage } from "@/components/clients/ClientProfilePage";

interface FunnelStage {
  name: string;
  color: string;
}

export const ClientFunnelDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const { data: clients = [], isLoading } = useClients();

  const funnelStages: FunnelStage[] = [
    { name: "Lead", color: "bg-gray-100 text-gray-800" },
    { name: "Contacted", color: "bg-blue-100 text-blue-800" },
    { name: "Qualified", color: "bg-yellow-100 text-yellow-800" },
    { name: "Proposal Sent", color: "bg-purple-100 text-purple-800" },
    { name: "Negotiation", color: "bg-orange-100 text-orange-800" },
    { name: "Closed Won", color: "bg-green-100 text-green-800" },
    { name: "Closed Lost", color: "bg-red-100 text-red-800" },
  ];

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalClients: clients?.length || 0,
    newClientsThisMonth: clients?.filter(client => {
      const createdDate = new Date(client.created_at);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
    }).length || 0,
    averageProjectValue: clients?.reduce((sum, client) => sum + (client.project_value || 0), 0) / (clients?.length || 1) || 0,
    clientsByStage: funnelStages.map(stage => ({
      name: stage.name,
      count: clients?.filter(client => client.funnel_stage === stage.name.toLowerCase()).length || 0
    }))
  };

  const handleClientSelect = (client: any) => {
    setSelectedClient(client.id);
  };

  if (selectedClient) {
    return (
      <ClientProfilePage 
        clientId={selectedClient}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Client Funnel</h2>
          <p className="text-muted-foreground">
            Track clients through the sales process
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.newClientsThisMonth}</div>
            <p className="text-xs text-muted-foreground">New clients this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Project Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.averageProjectValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Average project value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">18%</div>
            <p className="text-xs text-muted-foreground">Lead to close conversion</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {funnelStages.map(stage => (
          <Card key={stage.name}>
            <CardHeader>
              <CardTitle className="text-lg">{stage.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredClients?.filter(client => client.funnel_stage === stage.name.toLowerCase()).map(client => (
                  <div 
                    key={client.id} 
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{client.name}</h4>
                      <Badge className={stage.color}>{stage.name}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{client.company_name}</p>
                  </div>
                ))}
                {stats.clientsByStage.find(s => s.name === stage.name)?.count === 0 && (
                  <p className="text-sm text-gray-500">No clients in this stage.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search clients..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};
