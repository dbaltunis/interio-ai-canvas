
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Mail, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Settings,
  Plus,
  TrendingUp,
  Clock,
  Eye
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useClientStats } from "@/hooks/useClientJobs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClientCreateForm } from "../clients/ClientCreateForm";
import { ClientProfilePage } from "../clients/ClientProfilePage";
import { ViewToggle } from "./ViewToggle";
import { ClientListView } from "./ClientListView";
import { KanbanClientCard } from "./KanbanClientCard";

const FUNNEL_STAGES = [
  { key: "lead", label: "Leads", icon: Users, color: "bg-gray-100 text-gray-800" },
  { key: "contacted", label: "Contacted", icon: Mail, color: "bg-blue-100 text-blue-800" },
  { key: "measuring_scheduled", label: "Measuring", icon: Calendar, color: "bg-yellow-100 text-yellow-800" },
  { key: "quoted", label: "Quoted", icon: FileText, color: "bg-secondary text-secondary-foreground" },
  { key: "approved", label: "Approved", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  { key: "in_production", label: "In Production", icon: Settings, color: "bg-orange-100 text-orange-800" },
  { key: "completed", label: "Completed", icon: CheckCircle, color: "bg-emerald-100 text-emerald-800" }
];

export const ClientFunnelDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showClientProfile, setShowClientProfile] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'kanban' | 'list'>('kanban');

  const { data: clientStats, isLoading } = useClientStats();
  const { data: clients } = useClients();

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const clientsByStage = FUNNEL_STAGES.reduce((acc, stage) => {
    acc[stage.key] = filteredClients.filter(client => 
      (client.funnel_stage || 'lead') === stage.key
    );
    return acc;
  }, {} as Record<string, any[]>);

  const totalValue = clientStats?.reduce((sum, client) => sum + client.totalValue, 0) || 0;
  const totalClients = clients?.length || 0;
  const conversionRate = totalClients > 0 ? (clientsByStage.approved?.length || 0) / totalClients * 100 : 0;

  const handleClientClick = (client: any) => {
    setSelectedClient(client);
    setShowClientProfile(true);
  };

  // Show client profile if selected
  if (showClientProfile && selectedClient) {
    return (
      <ClientProfilePage
        clientId={selectedClient.id}
        onBack={() => {
          setShowClientProfile(false);
          setSelectedClient(null);
        }}
        onEdit={() => {
          console.log("Edit client:", selectedClient);
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600">Loading client funnel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Client Funnel</h1>
          <p className="text-gray-600 mt-1">Track your clients through the sales process</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-brand-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Active pipeline</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total potential</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Lead to project</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Deal Size</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${clientsByStage.approved?.length > 0 ? Math.round(totalValue / clientsByStage.approved.length).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per project</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle and Controls */}
      <ViewToggle
        currentView={currentView}
        onViewChange={setCurrentView}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewClient={() => setShowCreateForm(true)}
      />

      {/* Content based on current view */}
      {currentView === 'list' ? (
        <ClientListView
          clients={filteredClients}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClientClick={handleClientClick}
        />
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {FUNNEL_STAGES.map((stage) => {
            const stageClients = clientsByStage[stage.key] || [];
            const StageIcon = stage.icon;
            
            return (
              <Card key={stage.key} className="min-h-[500px]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <StageIcon className="h-4 w-4" />
                      {stage.label}
                    </div>
                    <Badge variant="secondary" className={stage.color}>
                      {stageClients.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stageClients.map((client) => (
                    <KanbanClientCard
                      key={client.id}
                      client={client}
                      onClientClick={handleClientClick}
                    />
                  ))}
                  
                  {stageClients.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <StageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No clients</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Client Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <ClientCreateForm onBack={() => setShowCreateForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
