
import { useState, useEffect } from "react";
import { useCreateProject } from "@/hooks/useProjects";
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
      
      // Wait for clients to load (but don't require them)
      if (clientsLoading) return;
      
      setIsCreating(true);
      setHasAttemptedCreation(true);
      
      try {
        console.log("Creating new project without client...");
        
        // Create project without any client assigned - completely empty
        const newProject = await createProject.mutateAsync({
          name: "New Project",
          description: "",
          status: "planning",
          priority: "medium"
          // Note: client_id is intentionally omitted to be null
        });
        
        console.log("Project created successfully:", newProject);
        
        // Create a quote for this project so it appears in job management
        if (newProject) {
          console.log("Creating quote for project:", newProject.id);
          
          await createQuote.mutateAsync({
            project_id: newProject.id,
            quote_number: "", // Empty string will trigger auto-generation
            status: "draft",
            subtotal: 0,
            tax_rate: 0,
            tax_amount: 0,
            total_amount: 0,
            notes: "New job created"
            // Note: client_id is intentionally omitted to be null
          });
          
          console.log("Quote created successfully for project:", newProject.id);
        }
        
        setCurrentProject(newProject);
        console.log("Created new project:", newProject.id);
        
        toast({
          title: "New Job Created",
          description: "Empty job created successfully. You can assign a client from the Client tab.",
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
  }, [clients, clientsLoading, currentProject, createProject, createQuote, isCreating, hasAttemptedCreation, onBack, toast, isAuthenticated, isCheckingAuth]);

  // Show loading state if checking auth, no project yet, or creating
  if (isCheckingAuth || clientsLoading || isCreating || !currentProject) {
    return <ProjectLoadingState />;
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
        />
      </div>
    </div>
  );
};
