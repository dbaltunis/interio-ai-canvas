
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Shield, FolderOpen, Columns3, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuotes, useCreateQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useCreateProject, useProjects, useDealerOwnProjects } from "@/hooks/useProjects";
import { useIsDealer } from "@/hooks/useIsDealer";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { JobsTableView } from "./JobsTableView";
import { JobDetailPage } from "./JobDetailPage";
import { JobsFilter } from "./JobsFilter";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";
import { JobsFocusHandler } from "./JobsFocusHandler";
import { useIsMobile } from "@/hooks/use-mobile";
import { ColumnCustomizationModal } from "./ColumnCustomizationModal";
import { useColumnPreferences } from "@/hooks/useColumnPreferences";
import { JobNotFound } from "./JobNotFound";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { format } from "date-fns";
import { useMyProjectAssignments } from "@/hooks/useMyProjectAssignments";


// Helper to convert user format to date-fns format
const convertToDateFnsFormat = (userFormat: string): string => {
  const formatMap: Record<string, string> = {
    'MM/dd/yyyy': 'MM/dd/yyyy',
    'dd/MM/yyyy': 'dd/MM/yyyy', 
    'yyyy-MM-dd': 'yyyy-MM-dd',
    'dd-MMM-yyyy': 'dd-MMM-yyyy',
  };
  return formatMap[userFormat] || 'MM/dd/yyyy';
};

const JobsPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get('jobId');
  const createClientParam = searchParams.get('createClient');
  
  // Get user preferences for date formatting
  const { data: userPreferences } = useUserPreferences();
  const userDateFormat = convertToDateFnsFormat(userPreferences?.date_format || 'MM/dd/yyyy');
  
  console.log('[JOBS] JobsPage render - selectedJobId:', selectedJobId, 'createClientParam:', createClientParam);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [showColumnCustomization, setShowColumnCustomization] = useState(false);
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  
  // CRITICAL: This query MUST be at top level before any early returns (React Rules of Hooks)
  const { data: jobExists, isLoading: validatingJob } = useQuery({
    queryKey: ['validate-job-exists', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return null;
      const { data } = await supabase
        .from('projects')
        .select('id')
        .eq('id', selectedJobId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!selectedJobId,
    staleTime: 30000,
  });
  
  const {
    columns, 
    visibleColumns, 
    toggleColumn, 
    reorderColumns, 
    resetToDefaults 
  } = useColumnPreferences();
  
  const isMobile = useIsMobile();
  
  // Check if user is a Dealer - they only see their own jobs
  const { data: isDealer, isLoading: isDealerLoading } = useIsDealer();

  // Permission checks using centralized hook
  const canViewAllJobs = useHasPermission('view_all_jobs');
  const canViewAssignedJobs = useHasPermission('view_assigned_jobs');
  const canViewJobsExplicit = canViewAllJobs !== false || canViewAssignedJobs !== false;
  const shouldFilterByAssignment = canViewAllJobs === false && canViewAssignedJobs !== false;
  const canCreateJobsRaw = useHasPermission('create_jobs');
  const canCreateJobsExplicit = isDealer === true || canCreateJobsRaw !== false;
  const canDeleteJobsExplicit = useHasPermission('delete_jobs') !== false;

  // Keep role loading for initial render gate
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const permissionsLoading = false; // useHasPermission handles loading internally
  
  // Only fetch quotes if user has view permissions
  const shouldFetchQuotes = canViewJobsExplicit;
  const { data: allQuotes = [], refetch: refetchQuotes } = useQuotes(undefined, {
    enabled: shouldFetchQuotes
  });
  
  // Use dealer-specific hook if user is a dealer - they only see their own jobs
  const { data: regularProjects = [] } = useProjects({
    enabled: canViewJobsExplicit && !isDealer
  });
  const { data: dealerProjects = [] } = useDealerOwnProjects();
  
  // Use dealer projects if user is a dealer, otherwise use regular projects
  // FIX: Don't return empty during loading if we have data - prevents visibility flash
  const allProjects = useMemo(() => {
    // If dealer, use dealer projects
    if (isDealer === true) return dealerProjects;
    // For non-dealers (including while loading), use regularProjects
    // This prevents flash of empty state when dealer check is slow
    return regularProjects;
  }, [isDealer, dealerProjects, regularProjects]);
  
  const { data: allClients = [] } = useClients(canViewJobsExplicit);
  
  // Fetch user's direct project assignments (from project_assignments table)
  const { data: myAssignedProjectIds = [], isLoading: assignmentsLoading } = useMyProjectAssignments();
  const myAssignedProjectIdSet = useMemo(() => new Set(myAssignedProjectIds), [myAssignedProjectIds]);
  
  const { filteredProjects, filteredQuotes } = useMemo(() => {
    console.log('[JOBS] Filtering - shouldFilterByAssignment:', shouldFilterByAssignment, 'user.id:', user?.id);
    console.log('[JOBS] Filtering - allProjects count:', allProjects.length, 'allQuotes count:', allQuotes.length, 'allClients count:', allClients.length);
    console.log('[JOBS] Filtering - myAssignedProjectIds count:', myAssignedProjectIds.length, 'assignmentsLoading:', assignmentsLoading);
    
    // CRITICAL: Wait for assignment data before filtering to prevent race condition
    // When assignments are still loading, return all data to prevent empty state flash
    if (assignmentsLoading && shouldFilterByAssignment) {
      console.log('[JOBS] Filtering - Waiting for assignment data to load, showing all projects temporarily');
      return { filteredProjects: allProjects, filteredQuotes: allQuotes };
    }
    
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
    // 2. project.client_id is in assignedClientIds (client assigned to user), OR
    // 3. project.id is in myAssignedProjectIdSet (directly assigned via project_assignments)
    const assignedProjects = allProjects.filter((project: any) => {
      const isCreatedByUser = project.user_id === user.id;
      const isClientAssignedToUser = project.client_id && assignedClientIds.has(project.client_id);
      const isDirectlyAssigned = myAssignedProjectIdSet.has(project.id);
      const isAssigned = isCreatedByUser || isClientAssignedToUser || isDirectlyAssigned;
      
      console.log('[JOBS] Filtering - Project:', project.id, 
        'user_id:', project.user_id, 
        'client_id:', project.client_id,
        'isCreatedByUser:', isCreatedByUser,
        'isClientAssignedToUser:', isClientAssignedToUser,
        'isDirectlyAssigned:', isDirectlyAssigned,
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
  }, [allProjects, allQuotes, allClients, shouldFilterByAssignment, user, myAssignedProjectIdSet, myAssignedProjectIds.length, assignmentsLoading]);
  
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
        name: `New Job ${format(new Date(), userDateFormat)}`,
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
        name: `Job ${quote.quote_number || format(new Date(), userDateFormat)}`,
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
  // Wait for permissions, role, and assignments to load (include dealer loading state)
  // Return null to let Suspense skeleton persist (single loading state)
  // CRITICAL: Include assignmentsLoading for staff members to prevent race condition
  if (roleLoading || isDealerLoading || userRoleData === undefined || (shouldFilterByAssignment && assignmentsLoading)) {
    return null;
  }
  
  // Dealers always have view permission for their own jobs - bypass the check
  const hasDealerAccess = isDealer === true;

  // Block access if user doesn't have view permissions (dealers always have access to their own jobs)
  if (!canViewJobsExplicit && !hasDealerAccess) {
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
    // Still validating - let parent Suspense skeleton persist
    if (validatingJob) {
      return null;
    }
    
    // Job doesn't exist - show error and allow clearing URL
    if (jobExists === false) {
      return (
        <JobNotFound onBack={() => {
          setSearchParams(prev => {
            prev.delete('jobId');
            prev.delete('templateId');
            prev.delete('windowId');
            return prev;
          });
        }} />
      );
    }
    
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
        {/* Compact Header - Analytics Style */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Projects</h1>
            <SectionHelpButton sectionId="jobs" />
            <Badge variant="secondary" className="text-xs">
              {quotes.length} projects
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Always-visible Search Input */}
            <div className="relative w-full sm:w-48 lg:w-64 min-w-0 order-last sm:order-first">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 w-full"
              />
            </div>
            
            {!isMobile && (
              <Button 
                onClick={() => setShowColumnCustomization(true)}
                variant="outline"
                size="icon"
                className="h-9 w-9"
              >
                <Columns3 className="h-4 w-4" />
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
      
      </div>
    </>
  );
};

export default JobsPage;
