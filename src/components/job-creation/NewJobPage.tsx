
import { useState, useEffect } from "react";
import { useCreateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectNavigation } from "./ProjectNavigation";
import { ProjectLoadingState } from "./ProjectLoadingState";
import { ProjectTabContent } from "./ProjectTabContent";
import { useToast } from "@/hooks/use-toast";

interface NewJobPageProps {
  onBack: () => void;
}

export const NewJobPage = ({ onBack }: NewJobPageProps) => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasAttemptedCreation, setHasAttemptedCreation] = useState(false);
  
  const { data: clients, isLoading: clientsLoading } = useClients();
  const createProject = useCreateProject();
  const { toast } = useToast();

  // Create a default project when component mounts
  useEffect(() => {
    const createDefaultProject = async () => {
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
  }, [clients, clientsLoading, currentProject, createProject, isCreating, hasAttemptedCreation, onBack, toast]);

  // Show loading state if no project yet or creating
  if (clientsLoading || isCreating || !currentProject) {
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
