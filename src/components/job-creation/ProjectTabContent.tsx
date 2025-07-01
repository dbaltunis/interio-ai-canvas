
import { ProjectClientTab } from "./ProjectClientTab";
import { ProjectJobsTab } from "./ProjectJobsTab";
import { ProjectQuoteTab } from "./ProjectQuoteTab";
import { ProjectWorkshopTab } from "./ProjectWorkshopTab";
import { useClients } from "@/hooks/useClients";
import { useUpdateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";

interface ProjectTabContentProps {
  activeTab: string;
  project: any;
  onBack: () => void;
}

export const ProjectTabContent = ({ activeTab, project, onBack }: ProjectTabContentProps) => {
  const { data: clients } = useClients();
  const updateProject = useUpdateProject();
  const { toast } = useToast();
  const client = clients?.find(c => c.id === project.client_id);

  const handleClientSelect = async (clientId: string) => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        client_id: clientId
      });
      toast({
        title: "Success",
        description: "Client has been assigned to the project",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project with selected client",
        variant: "destructive",
      });
    }
  };

  const handleClientRemove = async () => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        client_id: null
      });
      toast({
        title: "Success",
        description: "Client has been removed from the project",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove client from project",
        variant: "destructive",
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "client":
        return (
          <ProjectClientTab 
            project={project} 
            onClientSelect={handleClientSelect}
            onClientRemove={handleClientRemove}
          />
        );
      case "jobs":
        return <ProjectJobsTab project={project} onBack={onBack} />;
      case "quote":
        return <ProjectQuoteTab project={project} />;
      case "workshop":
        return <ProjectWorkshopTab project={project} />;
      default:
        return <ProjectJobsTab project={project} onBack={onBack} />;
    }
  };

  return (
    <div className="p-6">
      {renderTabContent()}
    </div>
  );
};
