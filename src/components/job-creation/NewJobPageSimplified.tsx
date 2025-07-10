
import { useState, useEffect } from "react";
import { useCreateProject, useProjects } from "@/hooks/useProjects";
import { useCreateQuote } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectNavigation } from "./ProjectNavigation";
import { ProjectTabContent } from "./ProjectTabContent";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewJobPageSimplifiedProps {
  onBack: () => void;
}

export const NewJobPageSimplified = ({ onBack }: NewJobPageSimplifiedProps) => {
  const [activeTab, setActiveTab] = useState("client");
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [shouldRedirectToQuote, setShouldRedirectToQuote] = useState(false);
  
  const { data: clients } = useClients();
  const { data: projects } = useProjects();
  const createProject = useCreateProject();
  const createQuote = useCreateQuote();
  const { toast } = useToast();

  // Get client data for navigation indicator
  const client = clients?.find(c => c.id === currentProject?.client_id);

  // Create project on mount - lightweight approach
  useEffect(() => {
    const createDefaultProject = async () => {
      if (currentProject || isCreating) return;
      
      setIsCreating(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { count } = await supabase
          .from("projects")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", user.id);
        
        const jobNumber = String(1000 + (count || 0) + 1);
        
        console.log("Creating new project with job number:", jobNumber);
        
        const newProject = await createProject.mutateAsync({
          name: `Job #${jobNumber}`,
          description: "",
          status: "planning",
          priority: "medium",
          client_id: null,
          job_number: jobNumber
        });
        
        console.log("Project created successfully:", newProject);
        
        // Verify the project was created and has a valid ID
        if (!newProject || !newProject.id) {
          throw new Error("Project creation failed - no valid ID returned");
        }
        
        // Create quote
        await createQuote.mutateAsync({
          project_id: newProject.id,
          client_id: null,
          status: "draft",
          subtotal: 0,
          tax_rate: 0,
          tax_amount: 0,
          total_amount: 0,
          notes: "New job created"
        });
        
        console.log("Setting current project to:", newProject);
        setCurrentProject(newProject);
        
        toast({
          title: "New Job Created",
          description: `Job #${jobNumber} is ready. Start by adding a client.`,
        });
      } catch (error) {
        console.error("Failed to create project:", error);
        toast({
          title: "Error",
          description: "Failed to create job. Please try again.",
          variant: "destructive"
        });
        onBack();
      } finally {
        setIsCreating(false);
      }
    };

    createDefaultProject();
  }, [currentProject, isCreating, createProject, createQuote, onBack, toast]);

  const handleProjectUpdate = (updatedProject: any) => {
    setCurrentProject(updatedProject);
    
    // Auto-redirect to quote when status changes to "Quote"
    if (updatedProject.status === "Quote" && activeTab !== "quote") {
      setShouldRedirectToQuote(true);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShouldRedirectToQuote(false);
  };

  if (isCreating || !currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Creating new job...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader 
        projectName={currentProject.name || `Job #${currentProject.job_number}`} 
        onBack={onBack} 
      />
      
      <ProjectNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        project={currentProject}
        client={client}
        shouldRedirectToQuote={shouldRedirectToQuote}
      />
      
      <div className="min-h-[600px]">
        <ProjectTabContent 
          activeTab={activeTab} 
          project={currentProject} 
          onBack={onBack} 
          onProjectUpdate={handleProjectUpdate}
          onTabChange={handleTabChange}
          shouldRedirectToQuote={shouldRedirectToQuote}
        />
      </div>
    </div>
  );
};
