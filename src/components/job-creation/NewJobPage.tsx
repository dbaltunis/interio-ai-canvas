
import { useState, useEffect } from "react";
import { useCreateProject, useProjects } from "@/hooks/useProjects";
import { useCreateQuote } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectNavigation } from "./ProjectNavigation";
import { ProjectLoadingState } from "./ProjectLoadingState";
import { ProjectTabContent } from "./ProjectTabContent";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewJobPageProps {
  onBack: () => void;
}

export const NewJobPage = ({ onBack }: NewJobPageProps) => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasAttemptedCreation, setHasAttemptedCreation] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: projects } = useProjects();
  const createProject = useCreateProject();
  const createQuote = useCreateQuote();
  const { toast } = useToast();

  // Get client data for navigation indicator
  const client = clients?.find(c => c.id === currentProject?.client_id);

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Auth check error:", error);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!user);
          console.log("Auth check result:", !!user, user?.id);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Update current project when projects data changes
  useEffect(() => {
    if (currentProject && projects) {
      const updatedProject = projects.find(p => p.id === currentProject.id);
      if (updatedProject && updatedProject.name !== currentProject.name) {
        console.log("Updating current project from projects data:", updatedProject);
        setCurrentProject(updatedProject);
      }
    }
  }, [projects, currentProject]);

  // Create a default project and quote when component mounts and user is authenticated
  useEffect(() => {
    const createDefaultProjectAndQuote = async () => {
      // Wait for auth check to complete
      if (isCheckingAuth) return;
      
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.error("User not authenticated, cannot create project");
        toast({
          title: "Authentication Required",
          description: "Please log in to create a project.",
          variant: "destructive"
        });
        onBack();
        return;
      }

      // Prevent multiple creation attempts
      if (hasAttemptedCreation || currentProject || isCreating) return;
      
      setIsCreating(true);
      setHasAttemptedCreation(true);
      
      try {
        console.log("Creating new project without client...");
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Get count of existing projects to generate sequential job number
        const { count } = await supabase
          .from("projects")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", user.id);
        
        // Generate proper sequential job number starting from 1000
        const jobNumber = String(1000 + (count || 0) + 1);
        
        // Create project without any client assigned - completely empty
        const newProject = await createProject.mutateAsync({
          name: "New Project",
          description: "",
          status: "planning",
          priority: "medium",
          client_id: null,
          job_number: jobNumber
        });
        
        console.log("Project created successfully:", newProject);
        
        // Create a quote for this project so it appears in job management
        if (newProject) {
          console.log("Creating quote for project:", newProject.id);
          
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
          
          console.log("Quote created successfully for project:", newProject.id);
        }
        
        setCurrentProject(newProject);
        console.log("Created new project:", newProject.id);
        
        toast({
          title: "New Job Created",
          description: `Job #${jobNumber} created successfully. You can assign a client from the Client tab.`,
        });
      } catch (error) {
        console.error("Failed to create default project:", error);
        toast({
          title: "Error",
          description: "Failed to create project. Please try again.",
          variant: "destructive"
        });
        onBack(); // Return to previous page on error
      } finally {
        setIsCreating(false);
      }
    };

    createDefaultProjectAndQuote();
  }, [currentProject, createProject, createQuote, isCreating, hasAttemptedCreation, onBack, toast, isAuthenticated, isCheckingAuth]);

  const handleProjectUpdate = (updatedProject: any) => {
    console.log("Project update received in NewJobPage:", updatedProject);
    setCurrentProject(updatedProject);
  };

  // Show minimal loading state
  if (isCheckingAuth || isCreating || !currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">
            {isCheckingAuth ? "Authenticating..." : isCreating ? "Creating project..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader 
        projectName={currentProject.name || "New Project"} 
        onBack={onBack} 
      />
      <ProjectNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        project={currentProject}
        client={client}
      />
      
      <div className="min-h-[600px]">
        <ProjectTabContent 
          activeTab={activeTab} 
          project={currentProject} 
          onBack={onBack} 
          onProjectUpdate={handleProjectUpdate}
        />
      </div>
    </div>
  );
};
