import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useClients, useDealerOwnClients } from "@/hooks/useClients";
import { useClientStats } from "@/hooks/useClientJobs";
import { useHasPermission } from "@/hooks/usePermissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsDealer } from "@/hooks/useIsDealer";
// useQuery and supabase removed - using centralized useHasPermission hook
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientCreateForm } from "./ClientCreateForm";
import { ClientProfilePage } from "./ClientProfilePage";
import { ClientListView } from "./ClientListView";
import { CRMFilters } from "../crm/CRMFilters";
import { ClientImportExport } from "./ClientImportExport";
import { ClientFormWithLeadIntelligence } from "./ClientFormWithLeadIntelligence";
import { JobsPagination } from "../jobs/JobsPagination";
import { ErrorFallback } from "@/components/ui/error-fallback";
import { ClientManagementSkeleton } from "./skeleton/ClientManagementSkeleton";
import { HelpDrawer } from "@/components/ui/help-drawer";
import { Badge } from "@/components/ui/badge";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileClientView } from "./MobileClientView";
interface ClientManagementPageProps {
  onTabChange?: (tab: string) => void;
}
export const ClientManagementPage = ({
  onTabChange
}: ClientManagementPageProps = {}) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showClientProfile, setShowClientProfile] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // CRM Filters
  const [filters, setFilters] = useState({
    stage: "all",
    source: "all",
    dateRange: "all",
    minDealValue: "",
    maxDealValue: "",
    assignedTo: "all"
  });

  // Check if user is a Dealer - they see only their own clients
  const { data: isDealer, isLoading: isDealerLoading } = useIsDealer();

  // Permission checks using centralized hook
  const canViewAllClients = useHasPermission('view_all_clients');
  const canViewAssignedClients = useHasPermission('view_assigned_clients');
  const hasDealerAccess = isDealer === true;
  const canViewClientsExplicit = hasDealerAccess || canViewAllClients !== false || canViewAssignedClients !== false;
  const shouldFilterByAssignment = !hasDealerAccess && canViewAllClients === false && canViewAssignedClients !== false;
  const canCreateClients = useHasPermission('create_clients') !== false;
  const canDeleteClients = useHasPermission('delete_clients') !== false;

  // Keep role loading for initial render gate
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const permissionsLoading = false; // useHasPermission handles loading internally
  const explicitPermissionsLoading = false;

  // Only fetch clients if user has view permissions
  // IMPORTANT: This prevents fetching clients from the database if permission is denied
  const shouldFetchClients = canViewClientsExplicit && !roleLoading && !isDealerLoading;
  
  console.log('[CLIENTS] Fetch decision:', {
    canViewClientsExplicit,
    roleLoading,
    isDealerLoading,
    shouldFetchClients,
    isDealer
  });
  
  // Use dealer-specific hook if user is a dealer - they only see their own clients
  const { data: regularClients, isLoading: regularClientsLoading } = useClients(shouldFetchClients && !isDealer);
  const { data: dealerClients, isLoading: dealerClientsLoading } = useDealerOwnClients();
  
  // Use appropriate data source based on user type
  const allClients = isDealer ? dealerClients : regularClients;
  const isLoading = isDealer ? dealerClientsLoading : regularClientsLoading;
  const {
    data: clientStats,
    isLoading: isLoadingStats
  } = useClientStats();

  // Filter clients by creation if needed (must be before conditional returns)
  // When user only has view_assigned_clients permission (and view_all_clients is disabled),
  // show only clients created by the current logged in user
  const filteredClientsByPermission = useMemo(() => {
    if (isDealer) {
      // Dealers already get filtered data from useDealerOwnClients
      return allClients || [];
    }
    
    if (!shouldFilterByAssignment || !user || !allClients) {
      return allClients || [];
    }
    
    // Filter to only show clients created by the current user
    // Check both created_by and assigned_to as fallback (for older clients that might not have created_by set)
    const filtered = allClients.filter((client: any) => 
      client.created_by === user.id || 
      (client.created_by === null && client.assigned_to === user.id)
    );
    console.log('[CLIENTS] Filtering by created_by:', {
      totalClients: allClients.length,
      filteredCount: filtered.length,
      userId: user.id,
      shouldFilterByAssignment,
      sampleClients: allClients.slice(0, 3).map((c: any) => ({
        id: c.id,
        name: c.name,
        created_by: c.created_by,
        assigned_to: c.assigned_to
      }))
    });
    return filtered;
  }, [allClients, shouldFilterByAssignment, user, isDealer]);

  // Merge clients with their stats (must be before conditional returns)
  const clientsWithStats = useMemo(() => {
    return filteredClientsByPermission?.map(client => {
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
  }, [filteredClientsByPermission, clientStats]);

  // Handle permission loading and preserve navigation state
  // IMPORTANT: Wait for explicitPermissions to be loaded before making permission decisions
  if (roleLoading || isDealerLoading) {
    // If we're showing client profile, keep showing it during permission refetch
    if (showClientProfile && selectedClient) {
      return <ClientProfilePage clientId={selectedClient.id} onBack={() => {
        setShowClientProfile(false);
        setSelectedClient(null);
      }} onEdit={() => {
        console.log("Edit client:", selectedClient);
      }} onTabChange={onTabChange} />;
    }
    return <ClientManagementSkeleton />;
  }

  // If user doesn't have permission to view clients, show access denied
  // Only check this AFTER permissions have been loaded (explicitPermissions !== undefined)
  if (!canViewClientsExplicit) {
    console.log('[CLIENTS] Access denied - no view permissions');
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view clients.</p>
        </div>
      </div>;
  }

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
    return <ClientManagementSkeleton />;
  }

  // Return mobile view for mobile devices  
  if (isMobile && !showClientProfile) {
    return <MobileClientView onClientClick={handleClientClick} />;
  }
  return <div className="bg-background min-h-screen animate-fade-in">
      <div className="space-y-4 p-4 md:p-6 lg:p-6">
        {/* Compact Header - Analytics Style */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Clients</h1>
            <SectionHelpButton sectionId="clients" />
            <Badge variant="secondary" className="text-xs">
              {totalItems} clients
            </Badge>
          </div>
        
          <div className="flex items-center gap-2">
            {/* Always-visible Search Input */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} size="icon-sm" className="rounded-lg" title="Filter">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" onClick={() => setShowImportExport(true)} size="icon-sm" className="rounded-lg" title="Import/Export">
              <Download className="h-4 w-4" />
            </Button>
            
            {canCreateClients && <Button onClick={() => setShowCreateForm(true)} className="rounded-lg shadow-sm" data-create-client>
                <Plus className="w-4 h-4 mr-2" />
                New Client
              </Button>}
          </div>
        </div>

      {/* Filters */}
      {showFilters && <CRMFilters filters={filters} onFilterChange={handleFilterChange} onReset={clearFilters} />}

      {/* Client List */}
      <ClientListView 
        clients={paginatedClients} 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange} 
        onClientClick={handleClientClick} 
        isLoading={isLoading || isLoadingStats}
        canDeleteClients={canDeleteClients}
      />

      {/* Pagination */}
      <JobsPagination 
        currentPage={currentPage} 
        totalItems={totalItems} 
        itemsPerPage={itemsPerPage} 
        onPageChange={handlePageChange}
        onItemsPerPageChange={(newSize) => {
          setItemsPerPage(newSize);
          setCurrentPage(1); // Reset to first page when changing page size
        }}
        itemsPerPageOptions={[20, 50, 100]}
      />

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