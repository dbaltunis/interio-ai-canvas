
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuotes, useCreateQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useCreateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { JobsTableView } from "./JobsTableView";
import { JobDetailPage } from "./JobDetailPage";
import { JobsFilter } from "./JobsFilter";

const JobsPage = () => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: quotes = [], refetch: refetchQuotes } = useQuotes();
  const createProject = useCreateProject();
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const { toast } = useToast();

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-brand-primary">Jobs</h1>
          <div className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-medium">
            {quotes.length} jobs
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <JobsFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onClearFilters={handleClearFilters}
          />
          <Button 
            onClick={handleNewJob}
            disabled={createProject.isPending || createQuote.isPending}
            className="bg-brand-primary hover:bg-brand-accent text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {(createProject.isPending || createQuote.isPending) ? "Creating..." : "New Job"}
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      <JobsTableView 
        onJobSelect={handleJobSelect} 
        searchTerm={searchTerm}
        statusFilter={statusFilter}
      />
    </div>
  );
};

export default JobsPage;
