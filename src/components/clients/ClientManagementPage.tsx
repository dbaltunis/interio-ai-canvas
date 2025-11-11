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
import { CRMFilters } from "../crm/CRMFilters";
import { ClientImportExport } from "./ClientImportExport";
import { ClientFormWithLeadIntelligence } from "./ClientFormWithLeadIntelligence";
import { JobsPagination } from "../jobs/JobsPagination";
import { ErrorFallback } from "@/components/ui/error-fallback";
import { LoadingFallback } from "@/components/ui/loading-fallback";
import { HelpDrawer } from "@/components/ui/help-drawer";
import { HelpIcon } from "@/components/ui/help-icon";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileClientView } from "./MobileClientView";
interface ClientManagementPageProps {
  onTabChange?: (tab: string) => void;
}
export const ClientManagementPage = ({
  onTabChange
}: ClientManagementPageProps = {}) => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showClientProfile, setShowClientProfile] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const itemsPerPage = 20;

  // CRM Filters
  const [filters, setFilters] = useState({
    stage: "all",
    source: "all",
    dateRange: "all",
    minDealValue: "",
    maxDealValue: "",
    assignedTo: "all"
  });

  // Permission checks
  const canViewClients = useHasPermission('view_clients');
  const canCreateClients = useHasPermission('create_clients');
  const canDeleteClients = useHasPermission('delete_clients');
  const {
    data: clients,
    isLoading
  } = useClients();
  const {
    data: clientStats,
    isLoading: isLoadingStats
  } = useClientStats();

  // Handle permission loading and preserve navigation state
  if (canViewClients === undefined) {
    // If we're showing client profile, keep showing it during permission refetch
    if (showClientProfile && selectedClient) {
      return <ClientProfilePage clientId={selectedClient.id} onBack={() => {
        setShowClientProfile(false);
        setSelectedClient(null);
      }} onEdit={() => {
        console.log("Edit client:", selectedClient);
      }} onTabChange={onTabChange} />;
    }
    return <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="text-lg text-muted-foreground">Loading clients...</div>
        </div>
      </div>;
  }

  // If user doesn't have permission to view clients, show access denied
  if (!canViewClients) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view clients.</p>
        </div>
      </div>;
  }

  // Merge clients with their stats
  const clientsWithStats = clients?.map(client => {
    const stats = clientStats?.find(stat => stat.clientId === client.id);
    return {
      ...client,
      projectCount: stats?.projectCount || 0,
      totalValue: stats?.totalValue || 0,
      quotesData: stats?.quotesData || {
        draft: 0,
        sent: 0,
        accepted: 0,
        total: 0
      }
    };
  }) || [];
  const filteredClients = clientsWithStats.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.email?.toLowerCase().includes(searchTerm.toLowerCase()) || client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || client.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStage = filters.stage === 'all' || client.funnel_stage === filters.stage;
    const matchesSource = filters.source === 'all' || client.lead_source === filters.source;

    // Date range filter
    let matchesDateRange = true;
    if (filters.dateRange !== 'all') {
      const createdDate = new Date(client.created_at);
      const daysAgo = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      matchesDateRange = createdDate >= cutoffDate;
    }

    // Deal value filter
    const matchesMinValue = !filters.minDealValue || (client.deal_value || 0) >= parseFloat(filters.minDealValue);
    const matchesMaxValue = !filters.maxDealValue || (client.deal_value || 0) <= parseFloat(filters.maxDealValue);
    return matchesSearch && matchesStage && matchesSource && matchesDateRange && matchesMinValue && matchesMaxValue;
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
    setFilters({
      stage: "all",
      source: "all",
      dateRange: "all",
      minDealValue: "",
      maxDealValue: "",
      assignedTo: "all"
    });
    setCurrentPage(1);
  };
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
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
    return <ClientImportExport onBack={() => setShowImportExport(false)} />;
  }

  // Show client profile if selected
  if (showClientProfile && selectedClient) {
    return <ClientProfilePage clientId={selectedClient.id} onBack={() => {
      setShowClientProfile(false);
      setSelectedClient(null);
    }} onEdit={() => {
      console.log("Edit client:", selectedClient);
    }} onTabChange={onTabChange} />;
  }
  if (isLoading || isLoadingStats) {
    return <LoadingFallback title="Loading clients..." />;
  }

  // Return mobile view for mobile devices  
  if (isMobile && !showClientProfile) {
    return <MobileClientView onClientClick={handleClientClick} />;
  }
  return <div className="bg-background min-h-screen animate-fade-in">
      <div className="space-y-6 p-6">
        {/* Header - matching Projects page style */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-h1 text-foreground">Clients</h1>
            <HelpIcon onClick={() => setShowHelp(true)} />
            <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
              {totalItems} clients
            </Badge>
          </div>
        
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} size="icon" title="Filter">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" onClick={() => setShowImportExport(true)} size="icon" title="Import/Export">
              <Download className="h-4 w-4" />
            </Button>
            
            {canCreateClients && <Button onClick={() => setShowCreateForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90" data-create-client>
                <Plus className="w-4 h-4 mr-2" />
                New Client
              </Button>}
          </div>
        </div>

      {/* Filters */}
      {showFilters && <CRMFilters filters={filters} onFilterChange={handleFilterChange} onReset={clearFilters} />}

      {/* Client List */}
      <ClientListView clients={paginatedClients} searchTerm={searchTerm} onSearchChange={handleSearchChange} onClientClick={handleClientClick} isLoading={isLoading || isLoadingStats} />

      {/* Pagination */}
      <JobsPagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />

      {/* Create Client Dialog with Lead Intelligence */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <ClientFormWithLeadIntelligence onCancel={() => setShowCreateForm(false)} onSuccess={() => setShowCreateForm(false)} />
        </DialogContent>
      </Dialog>
      
      <HelpDrawer isOpen={showHelp} onClose={() => setShowHelp(false)} title="Clients" sections={{
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
        shortcuts: [{
          key: "Ctrl + N",
          description: "Create new client"
        }, {
          key: "Ctrl + F",
          description: "Focus search"
        }, {
          key: "Esc",
          description: "Clear filters"
        }]
      }} />
      </div>
    </div>;
};