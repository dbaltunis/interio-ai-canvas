
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Shield, FolderOpen } from "lucide-react";
import { useQuotes, useCreateQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useCreateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import { JobsTableView } from "./JobsTableView";
import { JobDetailPage } from "./JobDetailPage";
import { JobsFilter } from "./JobsFilter";

const JobsPage = () => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Permission checks
  const canViewJobs = useHasPermission('view_jobs');
  const canCreateJobs = useHasPermission('create_jobs');
  
  const { data: quotes = [], refetch: refetchQuotes } = useQuotes();
  const createProject = useCreateProject();
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const { toast } = useToast();

  // Show loading while permissions are being checked
  if (canViewJobs === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="text-lg text-muted-foreground">Loading projects...</div>
        </div>
      </div>
    );
  }

  // If user doesn't have permission to view jobs, show access denied
  if (!canViewJobs) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <Card variant="modern" className="max-w-md">
          <CardContent className="text-center p-8">
            <div className="p-4 bg-red-500/10 rounded-lg inline-block mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to view projects.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleNewJob = async () => {
    try {
      console.log("Creating new job...");
      
      // Generate a unique job number
      const jobNumber = `JOB-${Date.now()}`;
      
      // First create the project
      const newProject = await createProject.mutateAsync({
        name: `New Job ${new Date().toLocaleDateString()}`,
        description: "",
        status: "planning",
        job_number: jobNumber
      });

      console.log("Project created:", newProject);

      // Then create a quote for this project
      const newQuote = await createQuote.mutateAsync({
        project_id: newProject.id,
        client_id: null,
        status: "draft",
        subtotal: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 0,
        notes: "New job created",
        quote_number: jobNumber
      });

      console.log("Quote created:", newQuote);

      // Refresh the quotes list to show the new job
      await refetchQuotes();

      // Navigate directly to the project detail page using the PROJECT ID
      setSelectedJobId(newProject.id);

      toast({
        title: "Success",
        description: "New job created successfully",
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
    console.log("Job selected:", quote);
    
    // Check if quote already has a project_id
    const existingProjectId = quote.project_id || quote.projects?.id;
    if (existingProjectId) {
      setSelectedJobId(existingProjectId);
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
      setSelectedJobId(newProject.id);

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

  const handleBackFromJob = () => {
    setSelectedJobId(null);
    // Refresh the quotes when coming back to ensure we see any updates
    refetchQuotes();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Direct rendering - no intermediate pages
  if (selectedJobId) {
    return <JobDetailPage jobId={selectedJobId} onBack={handleBackFromJob} />;
  }

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20 min-h-screen animate-fade-in">
      <div className="space-y-6 p-6">
        {/* Enhanced Header with Design System */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-light rounded-lg">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-h1 text-default">Projects</h1>
              <p className="text-small text-muted">Manage your jobs and projects</p>
            </div>
            <Badge className="bg-accent-light text-accent border-accent">
              {quotes.length} projects
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <JobsFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              onClearFilters={handleClearFilters}
            />
            {canCreateJobs && (
              <Button 
                onClick={handleNewJob}
                disabled={createProject.isPending || createQuote.isPending}
                className="bg-primary text-white hover:bg-primary-600 rounded-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                {(createProject.isPending || createQuote.isPending) ? "Creating..." : "New Project"}
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Jobs List */}
        <Card className="bg-surface border-default rounded-lg shadow-sm">
          <CardContent className="p-6">
            <JobsTableView 
              onJobSelect={handleJobSelect} 
              searchTerm={searchTerm}
              statusFilter={statusFilter}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobsPage;
