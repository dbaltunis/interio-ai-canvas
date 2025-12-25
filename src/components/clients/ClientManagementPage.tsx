import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download, Users } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useClientStats } from "@/hooks/useClientJobs";
import { useHasPermission, useUserPermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

  // Get user role to check if they're Owner/System Owner/Admin
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;

  // Explicit check: Check user_permissions table first, then fall back to role for Owners/Admins
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[CLIENTS] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  // Check if view permissions are explicitly in user_permissions table
  const hasViewAllClientsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_all_clients'
  ) ?? false;
  const hasViewAssignedClientsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_assigned_clients'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;
  const hasExplicitViewPermissions = hasViewAllClientsPermission || hasViewAssignedClientsPermission;

  // Owners and System Owners always have full access, regardless of explicit permissions
  const canViewClientsExplicit =
    userRoleData?.isSystemOwner || isOwner
      ? true
      : isAdmin
          ? !hasAnyExplicitPermissions || hasViewAllClientsPermission || hasViewAssignedClientsPermission
          : hasViewAllClientsPermission || hasViewAssignedClientsPermission;

  // Owners never filter by assignment - they always see all clients
  const shouldFilterByAssignment = !isOwner && !hasViewAllClientsPermission && hasViewAssignedClientsPermission;

  // Check if create_clients is explicitly in user_permissions table (enabled)
  const hasCreateClientsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'create_clients'
  ) ?? false;

  // Owners and System Owners always have full access
  const canCreateClientsExplicit =
    userRoleData?.isSystemOwner || isOwner
      ? true
      : hasCreateClientsPermission;

  // Check if delete_clients is explicitly in user_permissions table (enabled)
  const hasDeleteClientsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'delete_clients'
  ) ?? false;

  // System Owner: always can delete
  // Owner/Admin: only bypass restrictions if NO explicit permissions exist in table at all
  // If ANY explicit permissions exist, respect ALL settings (missing = disabled)
  const canDeleteClientsExplicit =
    userRoleData?.isSystemOwner
      ? true // System Owner always can delete clients
      : (isOwner || isAdmin) && !hasAnyExplicitPermissions
        ? true // Owner/Admin with no explicit permissions = full access
        : hasDeleteClientsPermission; // Otherwise respect explicit permissions

  // Permission checks (using explicit permissions)
  const canCreateClients = canCreateClientsExplicit;
  const canDeleteClients = canDeleteClientsExplicit;

  // Only fetch clients if user has view permissions
  const shouldFetchClients = canViewClientsExplicit && !permissionsLoading && !roleLoading;
  const {
    data: allClients,
    isLoading
  } = useClients(shouldFetchClients);
  const {
    data: clientStats,
    isLoading: isLoadingStats
  } = useClientStats();

  // Filter clients by assignment if needed (must be before conditional returns)
  const filteredClientsByPermission = useMemo(() => {
    if (!shouldFilterByAssignment || !user || !allClients) {
      return allClients || [];
    }
    
    // Filter to only show clients assigned to the current user
    return allClients.filter((client: any) => client.assigned_to === user.id);
  }, [allClients, shouldFilterByAssignment, user]);

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
  if (permissionsLoading || roleLoading) {
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
  if (!canViewClientsExplicit) {
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
      <ClientListView 
        clients={paginatedClients} 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange} 
        onClientClick={handleClientClick} 
        isLoading={isLoading || isLoadingStats}
        canDeleteClients={canDeleteClients}
      />

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