
import { ProjectClientTab } from "./ProjectClientTab";
import { ProjectJobsTab } from "./ProjectJobsTab";
import { ProjectQuoteTab } from "./ProjectQuoteTab";
import { ProjectWorkshopTab } from "./ProjectWorkshopTab";
import { useClients } from "@/hooks/useClients";
import { useUpdateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { EmailManagement } from "@/components/jobs/EmailManagement";
import { useHasPermission } from "@/hooks/usePermissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

interface ProjectTabContentProps {
  activeTab: string;
  project: any;
  quote?: any;
  onBack: () => void;
  onProjectUpdate?: (updatedProject: any) => void;
  onTabChange?: (tab: string) => void;
  shouldRedirectToQuote?: boolean;
}

export const ProjectTabContent = ({ 
  activeTab, 
  project, 
  quote, 
  onBack, 
  onProjectUpdate,
  onTabChange,
  shouldRedirectToQuote = false
}: ProjectTabContentProps) => {
  const { data: clients } = useClients();
  const updateProject = useUpdateProject();
  const { toast } = useToast();
  const { user } = useAuth();
  const client = clients?.find(c => c.id === project.client_id);
  
  // Permission checks
  const canEditAllJobs = useHasPermission('edit_all_jobs');
  const canEditOwnJobs = useHasPermission('edit_own_jobs');
  const canEditJob = canEditAllJobs || (canEditOwnJobs && project?.user_id === user?.id);
  const isReadOnly = !canEditJob;

  const handleClientSelect = async (clientId: string) => {
    try {
      console.log("Selecting client:", clientId, "for project:", project.id);
      
      const updatedProject = await updateProject.mutateAsync({
        id: project.id,
        client_id: clientId
      });
      
      console.log("Project updated successfully:", updatedProject);
      
      // Update the current project object to reflect the change immediately
      project.client_id = clientId;
      onProjectUpdate?.(updatedProject);
      
      toast({
        title: "Client Assigned",
        description: "Client has been successfully assigned to the project",
      });
    } catch (error) {
      console.error("Failed to assign client:", error);
      toast({
        title: "Error",
        description: "Failed to update project with selected client",
        variant: "destructive",
      });
    }
  };

  const handleClientRemove = async () => {
    try {
      console.log("Removing client from project:", project.id);
      
      const updatedProject = await updateProject.mutateAsync({
        id: project.id,
        client_id: null
      });
      
      // Update the current project object to reflect the change immediately
      project.client_id = null;
      onProjectUpdate?.(updatedProject);
      
      toast({
        title: "Success",
        description: "Client has been removed from the project",
      });
    } catch (error) {
      console.error("Failed to remove client:", error);
      toast({
        title: "Error",
        description: "Failed to remove client from project",
        variant: "destructive",
      });
    }
  };

  const handleProjectUpdate = (updatedProject: any) => {
    console.log("ProjectTabContent - project updated:", updatedProject);
    onProjectUpdate?.(updatedProject);
  };

  const renderTabContent = () => {
    // Show read-only alert if user can't edit
    const readOnlyAlert = isReadOnly && (
      <Alert className="mb-4">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          <strong>View Only:</strong> You don't have permission to edit this job. Contact your administrator if you need access.
        </AlertDescription>
      </Alert>
    );

    switch (activeTab) {
      case "client":
        return (
          <>
            {readOnlyAlert}
            <ProjectClientTab 
              project={project} 
              onClientSelect={handleClientSelect}
              onClientRemove={handleClientRemove}
            />
          </>
        );
      case "jobs":
        return (
          <>
            {readOnlyAlert}
            <ProjectJobsTab project={project} onProjectUpdate={handleProjectUpdate} />
          </>
        );
      case "quote":
        return (
          <>
            {readOnlyAlert}
            <ProjectQuoteTab 
              project={project} 
              shouldHighlightNewQuote={shouldRedirectToQuote}
            />
          </>
        );
      case "workshop":
        return (
          <>
            {readOnlyAlert}
            <ProjectWorkshopTab project={project} />
          </>
        );
      case "emails":
        return <EmailManagement />;
      case "calendar":
        return (
          <div className="company-gradient-soft glass-morphism rounded-xl border border-border/60 shadow-sm p-6">
            <h2 className="text-lg font-semibold">Calendar</h2>
            <p className="text-muted-foreground mt-1">Schedule and view job-related events here.</p>
          </div>
        );
      default:
        return (
          <>
            {readOnlyAlert}
            <ProjectJobsTab project={project} onProjectUpdate={handleProjectUpdate} />
          </>
        );
    }
  };

  return (
    <main className="p-4 md:p-6">
      {renderTabContent()}
    </main>
  );
};
