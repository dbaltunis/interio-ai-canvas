
import { useState, useEffect } from "react";
import { useProjects, useUpdateProject } from "@/hooks/useProjects";
import { useQuotes } from "@/hooks/useQuotes";
import { ProjectHeader } from "../job-creation/ProjectHeader";
import { ProjectNavigation } from "../job-creation/ProjectNavigation";
import { ProjectTabContent } from "../job-creation/ProjectTabContent";
import { ProjectLoadingState } from "../job-creation/ProjectLoadingState";
import { EnhancedProjectCreation } from "../job-creation/EnhancedProjectCreation";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface JobEditPageProps {
  jobId: string;
  onBack: () => void;
}

export const JobEditPage = ({ jobId, onBack }: JobEditPageProps) => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [shouldRedirectToQuote, setShouldRedirectToQuote] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: quotes } = useQuotes();
  const { data: clients } = useClients();
  const updateProject = useUpdateProject();
  const { toast } = useToast();

  // Handle new project creation
  const isNewProject = jobId === "new";
  
  useEffect(() => {
    if (!isNewProject && projects) {
      const project = projects.find(p => p.id === jobId);
      if (project) {
        setCurrentProject(project);
      }
    }
  }, [projects, jobId, isNewProject]);

  const handleProjectCreated = (newProject: any) => {
    console.log("New project created:", newProject);
    setCurrentProject(newProject);
    // Don't redirect back, stay in the project editor
  };

  const handleProjectUpdate = async (updatedProject: any) => {
    console.log("Project update received:", updatedProject);
    setCurrentProject(updatedProject);
  };

  const handleStatusChange = async (newStatus: string) => {
    console.log("Status change in JobEditPage:", newStatus);
    
    if (newStatus.toLowerCase() === 'quote') {
      setShouldRedirectToQuote(true);
      // Reset the redirect after a short delay to prevent continuous redirects
      setTimeout(() => setShouldRedirectToQuote(false), 1000);
    }
    
    // Update the current project status
    if (currentProject) {
      const updatedProject = { ...currentProject, status: newStatus };
      setCurrentProject(updatedProject);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "quote") {
      setShouldRedirectToQuote(false);
    }
  };

  // Show enhanced project creation for new projects
  if (isNewProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <EnhancedProjectCreation 
            onSuccess={handleProjectCreated}
            onCancel={onBack}
          />
        </div>
      </div>
    );
  }

  // Show loading state while projects are loading
  if (projectsLoading) {
    return <ProjectLoadingState />;
  }

  // Show error if project not found
  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const currentQuote = quotes?.find(q => q.project_id === currentProject.id);
  const client = clients?.find(c => c.id === currentProject.client_id);

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader
        projectName={currentProject.name}
        projectNumber={currentProject.job_number}
        projectValue={currentProject.total_amount}
        currentStatus={currentProject.status}
        projectId={currentProject.id}
        quoteId={currentQuote?.id}
        onBack={onBack}
        onStatusChange={handleStatusChange}
        onProjectUpdate={handleProjectUpdate}
        onTabChange={handleTabChange}
        hasExistingQuote={!!currentQuote}
      />
      
      <ProjectNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        project={currentProject}
        client={client}
        shouldRedirectToQuote={shouldRedirectToQuote}
      />
      
      <ProjectTabContent
        activeTab={activeTab}
        project={currentProject}
        quote={currentQuote}
        onBack={onBack}
        onProjectUpdate={handleProjectUpdate}
        onTabChange={handleTabChange}
        shouldRedirectToQuote={shouldRedirectToQuote}
      />
    </div>
  );
};
