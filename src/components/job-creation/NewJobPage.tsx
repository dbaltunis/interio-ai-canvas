
import { useState, useEffect } from "react";
import { useCreateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectNavigation } from "./ProjectNavigation";
import { ProjectLoadingState } from "./ProjectLoadingState";
import { ProjectTabContent } from "./ProjectTabContent";

interface NewJobPageProps {
  onBack: () => void;
}

export const NewJobPage = ({ onBack }: NewJobPageProps) => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [currentProject, setCurrentProject] = useState<any>(null);
  
  const { data: clients } = useClients();
  const createProject = useCreateProject();

  // Create a default project immediately when component mounts
  useEffect(() => {
    const createDefaultProject = async () => {
      if (!clients || clients.length === 0) return;
      
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
      } catch (error) {
        console.error("Failed to create default project:", error);
      }
    };

    if (!currentProject && clients && clients.length > 0) {
      createDefaultProject();
    }
  }, [clients, currentProject, createProject]);

  // Show loading state if no project yet
  if (!currentProject) {
    return <ProjectLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader 
        projectName={currentProject.name} 
        onBack={onBack} 
      />
      <ProjectNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {/* Tab Content */}
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
