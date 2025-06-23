
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";

interface JobsPageHeaderProps {
  onProjectSelect?: (projectId: string) => void;
}

export const JobsPageHeader = ({ onProjectSelect }: JobsPageHeaderProps) => {
  const createProject = useCreateProject();
  const { data: clients } = useClients();

  const handleCreateProject = async () => {
    try {
      // Create a default client if none exists
      let clientId = clients?.[0]?.id;
      
      if (!clientId) {
        // For demo purposes, we'll create a project without a client
        // In a real app, you'd want to handle this differently
        console.log("No clients available");
        return;
      }

      const newProject = await createProject.mutateAsync({
        name: `Project ${Date.now()}`,
        client_id: clientId,
        status: "planning",
        priority: "medium"
      });
      
      if (onProjectSelect) {
        onProjectSelect(newProject.id);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground">
          Manage your window treatment projects
        </p>
      </div>
      <Button onClick={handleCreateProject} className="flex items-center space-x-2">
        <Plus className="h-4 w-4" />
        <span>New Job</span>
      </Button>
    </div>
  );
};
