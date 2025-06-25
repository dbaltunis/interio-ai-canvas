
import { useState, useEffect } from "react";
import { useCreateProject } from "@/hooks/useProjects";
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
  const { toast } = useToast();

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

  // Create a default project when component mounts and user is authenticated
  useEffect(() => {
    const createDefaultProject = async () => {
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
        // Use first available client if exists, otherwise create project without client
        const clientId = clients && clients.length > 0 ? clients[0].id : null;
        
        const newProject = await createProject.mutateAsync({
          name: "New Project",
          description: "",
          client_id: clientId, // This can be null and set later
          status: "planning",
          priority: "medium"
        });
        
        setCurrentProject(newProject);
        console.log("Created new project:", newProject.id);
        
        if (!clientId) {
          toast({
            title: "Project Created",
            description: "Project created successfully. You can assign a client later from the Client tab.",
          });
        }
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

    createDefaultProject();
  }, [clients, clientsLoading, currentProject, createProject, isCreating, hasAttemptedCreation, onBack, toast, isAuthenticated, isCheckingAuth]);

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
