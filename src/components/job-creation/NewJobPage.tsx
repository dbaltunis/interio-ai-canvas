
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
  
  const { data: clients } = useClients();
  const createProject = useCreateProject();
  const { toast } = useToast();

  // Create a default project when component mounts
  useEffect(() => {
    const createDefaultProject = async () => {
      if (!clients || clients.length === 0 || currentProject || isCreating) return;
      
      setIsCreating(true);
      try {
        const defaultClient = clients[0]; // Use first available client
        const newProject = await createProject.mutateAsync({
          name: "New Project",
          description: "",
          client_id: defaultClient.id,
          status: "planning",
          priority: "medium"
        });
        
        setCurrentProject(newProject);
        console.log("Created new project:", newProject.id);
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
  }, [clients, currentProject, createProject, isCreating, onBack, toast]);

  // Show loading state if no project yet or creating
  if (!currentProject || isCreating) {
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
