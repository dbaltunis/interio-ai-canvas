
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateProject } from "@/hooks/useProjects";
import { useClients, useCreateClient } from "@/hooks/useClients";

interface JobsPageHeaderProps {
  onProjectSelect?: (projectId: string) => void;
}

export const JobsPageHeader = ({ onProjectSelect }: JobsPageHeaderProps) => {
  const createProject = useCreateProject();
  const createClient = useCreateClient();
  const { data: clients } = useClients();

  const handleCreateProject = async () => {
    try {
      let clientId = clients?.[0]?.id;
      
      // If no clients exist, create a default one first
      if (!clientId) {
        console.log("No clients found, creating default client");
        const newClient = await createClient.mutateAsync({
          name: "Default Client",
          email: "client@example.com",
          phone: "",
          address: "",
          city: "",
          state: "",
          zip_code: "",
          notes: "Auto-created default client"
        });
        clientId = newClient.id;
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
