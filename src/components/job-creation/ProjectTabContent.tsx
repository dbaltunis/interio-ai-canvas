import { ProjectClientTab } from "./ProjectClientTab";
import { ProjectJobsTab } from "./ProjectJobsTab";
import { ProjectQuoteTab } from "./ProjectQuoteTab";
import { ProjectWorkshopTab } from "./ProjectWorkshopTab";
import { useClients } from "@/hooks/useClients";
import { useUpdateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { EmailManagement } from "@/components/jobs/EmailManagement";
import { useCanEditJob } from "@/hooks/useJobEditPermissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { ProjectStatusProvider, useProjectStatus } from "@/contexts/ProjectStatusContext";
import { ProjectLockedBanner } from "@/components/projects/ProjectLockedBanner";

interface ProjectTabContentProps {
  activeTab: string;
  project: any;
  quote?: any;
  onBack: () => void;
  onProjectUpdate?: (updatedProject: any) => void;
  onTabChange?: (tab: string) => void;
  shouldRedirectToQuote?: boolean;
}

// Inner component that uses the context
const ProjectTabContentInner = ({ 
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
  
  // Use project status context for locking - this now works because we're inside the provider
  const { isLocked, isViewOnly, canEdit: statusCanEdit, isLoading: statusLoading } = useProjectStatus();
  
  // Use explicit permissions hook for edit checks
  const { canEditJob, isLoading: editPermissionsLoading } = useCanEditJob(project);
  
  // Combine permission and status checks
  const isReadOnly = !canEditJob || editPermissionsLoading || isLocked || isViewOnly || statusLoading;

  const handleClientSelect = async (clientId: string) => {
    if (isReadOnly) {
      toast({
        title: "Permission Denied",
        description: isLocked || isViewOnly 
          ? "This project's status prevents editing."
          : "You don't have permission to edit this job.",
        variant: "destructive",
      });
      return;
    }
    
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
    if (isReadOnly) {
      toast({
        title: "Permission Denied",
        description: isLocked || isViewOnly 
          ? "This project's status prevents editing."
          : "You don't have permission to edit this job.",
        variant: "destructive",
      });
      return;
    }
    
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
          <strong>View Only:</strong> {isLocked || isViewOnly 
            ? "This project's status prevents editing." 
            : "You don't have permission to edit this job."} Contact your administrator if you need access.
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
              isReadOnly={isReadOnly}
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
      <ProjectLockedBanner className="mb-4" />
      {renderTabContent()}
    </main>
  );
};

// Main component that provides the context
export const ProjectTabContent = (props: ProjectTabContentProps) => {
  return (
    <ProjectStatusProvider projectId={props.project?.id}>
      <ProjectTabContentInner {...props} />
    </ProjectStatusProvider>
  );
};
