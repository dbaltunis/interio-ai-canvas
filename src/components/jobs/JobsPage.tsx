
import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Shield, FolderOpen, Columns3 } from "lucide-react";
import { useQuotes, useCreateQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useCreateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
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
  
  // Permission checks
  const canViewJobs = useHasPermission('view_jobs');
  const canCreateJobs = useHasPermission('create_jobs');
  const isMobile = useIsMobile();
  
  const { data: quotes = [], refetch: refetchQuotes } = useQuotes();
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
            {canCreateJobs && !isMobile && (
              <Button 
                onClick={() => handleNewJob()}
                disabled={createProject.isPending || createQuote.isPending}
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
