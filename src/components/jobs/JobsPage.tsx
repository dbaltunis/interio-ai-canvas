
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Shield, FolderOpen, Columns3 } from "lucide-react";
import { useQuotes, useCreateQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useCreateProject, useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission, useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { JobsTableView } from "./JobsTableView";
import { JobDetailPage } from "./JobDetailPage";
import { JobsFilter } from "./JobsFilter";
import { HelpDrawer } from "@/components/ui/help-drawer";
import { HelpIcon } from "@/components/ui/help-icon";
import { JobsFocusHandler } from "./JobsFocusHandler";
import { useIsMobile } from "@/hooks/use-mobile";
import { ColumnCustomizationModal } from "./ColumnCustomizationModal";
import { useColumnPreferences } from "@/hooks/useColumnPreferences";

const JobsPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get('jobId');
  const createClientParam = searchParams.get('createClient');
  
  console.log('[JOBS] JobsPage render - selectedJobId:', selectedJobId, 'createClientParam:', createClientParam);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showHelp, setShowHelp] = useState(false);
  const [showColumnCustomization, setShowColumnCustomization] = useState(false);
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  
  const { 
    columns, 
    visibleColumns, 
    toggleColumn, 
    reorderColumns, 
    resetToDefaults 
  } = useColumnPreferences();
  
  const isMobile = useIsMobile();
  
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
        console.error('[JOBS] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });
  
  // Check if view permissions are explicitly in user_permissions table
  const hasViewAllJobsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_all_jobs'
  ) ?? false;
  const hasViewAssignedJobsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_assigned_jobs'
  ) ?? false;
  
  // Check if user has ANY explicit permissions in the user_permissions table
  // If they do, we should respect ALL permission settings (including missing ones = disabled)
  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;
  
  // Check if user has explicit job view permissions ENABLED (in the table)
  const hasExplicitViewPermissions = hasViewAllJobsPermission || hasViewAssignedJobsPermission;
  
  // Determine view access and scope:
  // - Owners/System Owners: Only bypass restrictions if NO explicit permissions exist in table at all
  //   If ANY explicit permissions exist in table, respect ALL settings (missing = disabled)
  // - Admins and Regular users: Always check explicit permissions
  // - If only view_assigned_jobs: Only see jobs where user_id matches current user OR client assigned to user
  // - If only view_all_jobs: See all jobs
  // - If both: See all jobs (view_all_jobs takes precedence)
  // - If both disabled (not in table): See no jobs
  const canViewJobsExplicit = isOwner && !hasAnyExplicitPermissions 
    ? true // Owner with no explicit permissions in table at all = full access
    : hasViewAllJobsPermission || hasViewAssignedJobsPermission; // Otherwise respect explicit permissions (enabled ones)
  
  // Filter by assignment if:
  // - User is not an Owner, OR
  // - Owner has ANY explicit permissions in table (respect all settings)
  // - AND they only have view_assigned_jobs enabled (not view_all_jobs)
  const shouldFilterByAssignment = (!isOwner || hasAnyExplicitPermissions) && !hasViewAllJobsPermission && hasViewAssignedJobsPermission;
  
  // Check if create_jobs is explicitly in user_permissions table (enabled)
  const hasCreateJobsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'create_jobs'
  ) ?? false;
  
  // Owners/System Owners: Only bypass restrictions if NO explicit permissions exist in table at all
  // If ANY explicit permissions exist in table, respect ALL settings (missing = disabled)
  // Admins and Regular users: Always check explicit permissions
  const canCreateJobsExplicit = isOwner && !hasAnyExplicitPermissions 
    ? true // Owner with no explicit permissions in table at all = full access
    : hasCreateJobsPermission; // Otherwise respect explicit permissions (enabled ones)
  
  // Check if delete_jobs is explicitly in user_permissions table (enabled)
  const hasDeleteJobsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'delete_jobs'
  ) ?? false;
  
  // Owners/System Owners: Only bypass restrictions if NO explicit permissions exist in table at all
  // If ANY explicit permissions exist in table, respect ALL settings (missing = disabled)
  // Admins and Regular users: Always check explicit permissions
  const canDeleteJobsExplicit = isOwner && !hasAnyExplicitPermissions 
    ? true // Owner with no explicit permissions in table at all = full access
    : hasDeleteJobsPermission; // Otherwise respect explicit permissions (enabled ones)
  
  // Debug: Log permission state
  useEffect(() => {
    console.log('[JOBS] Permission check - isOwner:', isOwner, 'isAdmin:', isAdmin);
    console.log('[JOBS] Permission check - hasAnyExplicitPermissions:', hasAnyExplicitPermissions, 'explicitPermissions count:', explicitPermissions?.length);
    console.log('[JOBS] Permission check - hasExplicitViewPermissions (enabled):', hasExplicitViewPermissions);
    console.log('[JOBS] Permission check - canViewJobsExplicit:', canViewJobsExplicit, 'shouldFilterByAssignment:', shouldFilterByAssignment);
    console.log('[JOBS] Permission check - hasViewAllJobsPermission:', hasViewAllJobsPermission, 'hasViewAssignedJobsPermission:', hasViewAssignedJobsPermission);
    console.log('[JOBS] Explicit permissions:', explicitPermissions?.map((p: { permission_name: string }) => p.permission_name));
  }, [canViewJobsExplicit, shouldFilterByAssignment, hasViewAllJobsPermission, hasViewAssignedJobsPermission, hasExplicitViewPermissions, hasAnyExplicitPermissions, explicitPermissions, isOwner, isAdmin]);
  
  // Only fetch quotes if user has view permissions
  const shouldFetchQuotes = canViewJobsExplicit && !permissionsLoading;
  const { data: allQuotes = [], refetch: refetchQuotes } = useQuotes(undefined, {
    enabled: shouldFetchQuotes
  });
  
  // Fetch projects and clients to filter by assignment if needed
  // Only fetch if user has view permissions
  const { data: allProjects = [] } = useProjects({
    enabled: canViewJobsExplicit && !permissionsLoading
  });
  const { data: allClients = [] } = useClients(canViewJobsExplicit && !permissionsLoading);
  
  // Filter projects and quotes based on permissions:
  // - If shouldFilterByAssignment is true, only show projects/quotes where:
  //   1. project.user_id matches current user (jobs created by user), OR
  //   2. project.client_id has a client with assigned_to === current user (jobs for clients assigned to user)
  // - Otherwise, show all projects/quotes
  const { filteredProjects, filteredQuotes } = useMemo(() => {
    console.log('[JOBS] Filtering - shouldFilterByAssignment:', shouldFilterByAssignment, 'user.id:', user?.id);
    console.log('[JOBS] Filtering - allProjects count:', allProjects.length, 'allQuotes count:', allQuotes.length, 'allClients count:', allClients.length);
    
    if (!shouldFilterByAssignment || !user) {
      console.log('[JOBS] Filtering - No filtering needed, returning all data');
      return { filteredProjects: allProjects, filteredQuotes: allQuotes };
    }
    
    // Get client IDs where the current user is assigned
    const assignedClientIds = new Set(
      allClients
        .filter((client: any) => client.assigned_to === user.id)
        .map((client: any) => client.id)
    );
    console.log('[JOBS] Filtering - Assigned client IDs:', Array.from(assignedClientIds));
    
    // Filter projects where:
    // 1. project.user_id matches current user (created by user), OR
    // 2. project.client_id is in assignedClientIds (client assigned to user)
    const assignedProjects = allProjects.filter((project: any) => {
      const isCreatedByUser = project.user_id === user.id;
      const isClientAssignedToUser = project.client_id && assignedClientIds.has(project.client_id);
      const isAssigned = isCreatedByUser || isClientAssignedToUser;
      
      console.log('[JOBS] Filtering - Project:', project.id, 
        'user_id:', project.user_id, 
        'client_id:', project.client_id,
        'isCreatedByUser:', isCreatedByUser,
        'isClientAssignedToUser:', isClientAssignedToUser,
        'isAssigned:', isAssigned);
      
      return isAssigned;
    });
    
    const assignedProjectIds = new Set(assignedProjects.map((project: any) => project.id));
    console.log('[JOBS] Filtering - Assigned project IDs:', Array.from(assignedProjectIds));
    
    // Filter quotes to only show quotes for assigned projects
    const filteredQuotes = allQuotes.filter((quote: any) => {
      const isIncluded = quote.project_id && assignedProjectIds.has(quote.project_id);
      if (!isIncluded) {
        console.log('[JOBS] Filtering - Quote excluded:', quote.id, 'project_id:', quote.project_id);
      }
      return isIncluded;
    });
    
    console.log('[JOBS] Filtering - Filtered projects count:', assignedProjects.length, 'Filtered quotes count:', filteredQuotes.length);
    
    return {
      filteredProjects: assignedProjects,
      filteredQuotes
    };
  }, [allProjects, allQuotes, allClients, shouldFilterByAssignment, user]);
  
  // Use filtered data
  const quotes = filteredQuotes;
  const createProject = useCreateProject();
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const { toast } = useToast();

  const handleBackFromJob = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('jobId');
      return newParams;
    });
    // Refresh the quotes when coming back to ensure we see any updates
    refetchQuotes();
  };

  const handleNewJob = async (clientId?: string | null) => {
    // Check permission before creating - use explicit check
    if (!canCreateJobsExplicit) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to create jobs.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Creating new job...", clientId ? `for client: ${clientId}` : '');
      
      // Create the project - useCreateProject will handle job number generation
      const newProject = await createProject.mutateAsync({
        name: `New Job ${new Date().toLocaleDateString()}`,
        description: "",
        status: "planning",
        client_id: clientId || null
      });

      console.log("Project created:", newProject);

      // Then create a quote for this project
      const newQuote = await createQuote.mutateAsync({
        project_id: newProject.id,
        client_id: clientId || null,
        status: "draft",
        subtotal: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 0,
        notes: "New job created",
      });

      console.log("Quote created:", newQuote);

      // Refresh the quotes list to show the new job
      await refetchQuotes();

      // Navigate directly to the project detail page using the PROJECT ID
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('jobId', newProject.id);
        return newParams;
      });
    } catch (error) {
      console.error("Failed to create new job:", error);
      toast({
        title: "Error",
        description: "Failed to create new job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJobSelect = async (quote: any) => {
    // Check if quote already has a project_id
    const existingProjectId = quote.project_id || quote.projects?.id;
    if (existingProjectId) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('jobId', existingProjectId);
        return newParams;
      });
      return;
    }

    // Quote doesn't have a project (CRM-created quote) - create one
    // Check permission before creating - use explicit check
    if (!canCreateJobsExplicit) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to create jobs.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Creating project for CRM quote:", quote);
      
      const newProject = await createProject.mutateAsync({
        name: `Job ${quote.quote_number || new Date().toLocaleDateString()}`,
        description: `Project created from quote ${quote.quote_number}`,
        status: "planning",
        job_number: quote.quote_number,
        client_id: quote.client_id
      });

      console.log("Project created for CRM quote:", newProject);

      // Update the quote with the new project_id
      await updateQuote.mutateAsync({
        id: quote.id,
        project_id: newProject.id
      });

      // Refresh quotes to reflect the update
      await refetchQuotes();

      // Navigate to the job detail page
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('jobId', newProject.id);
        return newParams;
      });

      toast({
        title: "Success",
        description: "Job opened successfully",
      });
    } catch (error) {
      console.error("Failed to create project for CRM quote:", error);
      toast({
        title: "Error",
        description: "Unable to open job details. Please try again.",
        variant: "destructive",
      });
    }
  };


  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Check permissions - block access if user doesn't have view permissions
  // Wait for permissions and role to load
  if (permissionsLoading || roleLoading || explicitPermissions === undefined || userRoleData === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Loading Permissions</h2>
            <p className="text-muted-foreground">Checking access permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Block access if user doesn't have view permissions
  if (!canViewJobsExplicit) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You do not have permission to view jobs. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Direct rendering - no intermediate pages
  if (selectedJobId) {
    return <JobDetailPage jobId={selectedJobId} onBack={handleBackFromJob} />;
  }

  // Show loading state when auto-creating project
  if (isAutoCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Creating Project</h2>
            <p className="text-muted-foreground">Setting up your new project with client information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <JobsFocusHandler />
      <div className="bg-background/50 min-h-screen animate-fade-in">
      <div className="space-y-4 p-4 lg:p-6">
        {/* Enhanced Header with Design System */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-h1 text-foreground">Projects</h1>
            <HelpIcon onClick={() => setShowHelp(true)} />
          </div>
          <Badge className="bg-secondary/10 text-secondary border-secondary/20">
            {quotes.length} projects
          </Badge>
        </div>
          
          <div className="flex items-center gap-3">
            {!isMobile && (
              <Button 
                onClick={() => setShowColumnCustomization(true)}
                variant="outline"
                size="sm"
                className="h-9"
              >
                <Columns3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Edit Columns</span>
              </Button>
            )}
            <JobsFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              onClearFilters={handleClearFilters}
            />
            {canCreateJobsExplicit && !isMobile && (
              <Button 
                onClick={() => {
                  console.log('[JOBS] New Project button clicked, canCreateJobsExplicit:', canCreateJobsExplicit);
                  handleNewJob();
                }}
                disabled={createProject.isPending || createQuote.isPending || !canCreateJobsExplicit}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                data-create-project
              >
                <Plus className="h-4 w-4 mr-2" />
                {(createProject.isPending || createQuote.isPending) ? "Creating..." : "New Project"}
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Jobs List */}
        <Card className="rounded-xl shadow-sm border-border/40 bg-card">
          <JobsTableView
            onJobSelect={handleJobSelect} 
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            visibleColumns={visibleColumns}
            filteredQuotes={shouldFilterByAssignment ? quotes : undefined}
            filteredProjects={shouldFilterByAssignment ? filteredProjects : undefined}
            canDeleteJobs={canDeleteJobsExplicit}
          />
        </Card>
      </div>
      
      <ColumnCustomizationModal
        isOpen={showColumnCustomization}
        onClose={() => setShowColumnCustomization(false)}
        columns={columns}
        onToggleColumn={toggleColumn}
        onReorderColumns={reorderColumns}
        onResetToDefaults={resetToDefaults}
      />
      
      <HelpDrawer
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Projects"
        sections={{
          purpose: {
            title: "What this page is for",
            content: "Manage all your window treatment projects from initial quotes to completed installations. Track progress, manage timelines, and organize project details."
          },
          actions: {
            title: "Common actions",
            content: "Create new projects, view project details, filter by status, search projects, and track progress through different stages."
          },
          tips: {
            title: "Tips & best practices",
            content: "Use consistent naming conventions for projects. Keep project statuses updated. Archive completed projects to reduce clutter."
          },
          shortcuts: [
            { key: "Ctrl + N", description: "Create new project" },
            { key: "Ctrl + F", description: "Focus search" },
            { key: "Esc", description: "Clear filters" }
          ]
        }}
      />
      </div>
    </>
  );
};

export default JobsPage;
