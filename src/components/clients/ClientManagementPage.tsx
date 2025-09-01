
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download, Users } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useClientStats } from "@/hooks/useClientJobs";
import { useHasPermission } from "@/hooks/usePermissions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientCreateForm } from "./ClientCreateForm";
import { ClientProfilePage } from "./ClientProfilePage";
import { ClientListView } from "./ClientListView";
import { ClientFilters } from "./ClientFilters";
import { ClientImportExport } from "./ClientImportExport";
import { JobsPagination } from "../jobs/JobsPagination";
import { ErrorFallback } from "@/components/ui/error-fallback";
import { LoadingFallback } from "@/components/ui/loading-fallback";
import { HelpDrawer } from "@/components/ui/help-drawer";
import { HelpIcon } from "@/components/ui/help-icon";
import { Badge } from "@/components/ui/badge";

interface ClientManagementPageProps {
  onTabChange?: (tab: string) => void;
}

export const ClientManagementPage = ({ onTabChange }: ClientManagementPageProps = {}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showClientProfile, setShowClientProfile] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [clientType, setClientType] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const itemsPerPage = 20;

  // Permission checks
  const canViewClients = useHasPermission('view_clients');
  const canCreateClients = useHasPermission('create_clients');
  const canDeleteClients = useHasPermission('delete_clients');

  const { data: clients, isLoading } = useClients();
  const { data: clientStats, isLoading: isLoadingStats } = useClientStats();

  // If user doesn't have permission to view clients, show access denied
  if (!canViewClients) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view clients.</p>
        </div>
      </div>
    );
  }

  // Merge clients with their stats
  const clientsWithStats = clients?.map(client => {
    const stats = clientStats?.find(stat => stat.clientId === client.id);
    return {
      ...client,
      projectCount: stats?.projectCount || 0,
      totalValue: stats?.totalValue || 0,
      quotesData: stats?.quotesData || { draft: 0, sent: 0, accepted: 0, total: 0 }
    };
  }) || [];

  const filteredClients = clientsWithStats.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = clientType === 'all' || client.client_type === clientType;
    
    // Activity filter logic
    let matchesActivity = true;
    if (activityFilter !== 'all') {
      switch (activityFilter) {
        case 'active_projects':
          matchesActivity = client.projectCount > 0;
          break;
        case 'pending_quotes':
          matchesActivity = (client.quotesData?.draft || 0) + (client.quotesData?.sent || 0) > 0;
          break;
        case 'high_value':
          matchesActivity = client.totalValue > 5000;
          break;
        case 'inactive':
          matchesActivity = client.projectCount === 0 && (client.quotesData?.total || 0) === 0;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesActivity;
  });

  // Pagination logic
  const totalItems = filteredClients.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  const handleClientClick = (client: any) => {
    setSelectedClient(client);
    setShowClientProfile(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatuses([]);
    setSelectedProjects([]);
    setClientType("all");
    setActivityFilter("all");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Show import/export if selected
  if (showImportExport) {
    return (
      <ClientImportExport
        onBack={() => setShowImportExport(false)}
      />
    );
  }

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
        onTabChange={onTabChange}
      />
    );
  }

  if (isLoading || isLoadingStats) {
    return <LoadingFallback title="Loading clients..." />;
  }

  return (
    <div className="bg-background min-h-screen animate-fade-in">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-h1 text-foreground">Clients</h1>
              <HelpIcon onClick={() => setShowHelp(true)} />
            </div>
            <Badge className="bg-secondary/10 text-secondary border-secondary/20">
              {totalItems} clients
            </Badge>
          </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="p-2"
            title="Filter"
          >
            <Filter className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowImportExport(true)}
            className="p-2"
            title="Import/Export"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          {canCreateClients && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Client
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card p-4 rounded-lg border border-border">
          <ClientFilters
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            clientType={clientType}
            setClientType={setClientType}
            activityFilter={activityFilter}
            setActivityFilter={setActivityFilter}
            onClearFilters={clearFilters}
          />
        </div>
      )}

      {/* Client List */}
      <ClientListView
        clients={paginatedClients}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClientClick={handleClientClick}
        isLoading={isLoading || isLoadingStats}
      />

      {/* Pagination */}
      <JobsPagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />

      {/* New Client Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <ClientCreateForm onBack={() => setShowCreateForm(false)} />
        </DialogContent>
      </Dialog>
      
      <HelpDrawer
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Clients"
        sections={{
          purpose: {
            title: "What this page is for",
            content: "Manage your client database, track client relationships, and access client project history. View client contact information, project timelines, and communication records."
          },
          actions: {
            title: "Common actions",
            content: "Create new clients, edit client information, filter by status or activity, import/export client data, and view client project history."
          },
          tips: {
            title: "Tips & best practices",
            content: "Keep client information up to date. Use consistent naming conventions. Regular communication logs help track relationship progress."
          },
          shortcuts: [
            { key: "Ctrl + N", description: "Create new client" },
            { key: "Ctrl + F", description: "Focus search" },
            { key: "Esc", description: "Clear filters" }
          ]
        }}
      />
      </div>
    </div>
  );
};
