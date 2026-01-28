
import { useState } from "react";
import { useQuotes } from "@/hooks/useQuotes";
import { useUpdateProject } from "@/hooks/useProjects";
import { ProjectHeader } from "../job-creation/ProjectHeader";
import { ProjectNavigation } from "../job-creation/ProjectNavigation";
import { ProjectTabContent } from "../job-creation/ProjectTabContent";
import { NewJobPage } from "../job-creation/NewJobPage";

interface JobEditPageProps {
  jobId: string;
  onBack: () => void;
}

export const JobEditPage = ({ jobId, onBack }: JobEditPageProps) => {
  const [activeTab, setActiveTab] = useState("jobs");
  const { data: quotes } = useQuotes();
  const updateProject = useUpdateProject();

  // If jobId is "new", show the new job creation page
  if (jobId === "new") {
    return <NewJobPage onBack={onBack} />;
  }

  const job = quotes?.find(q => q.id === jobId);

  if (!job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Job not found</h2>
          <button onClick={onBack} className="text-blue-600 hover:text-blue-700">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  // Handler for project name updates
  const handleProjectUpdate = async (updates: { name?: string }) => {
    if (!job?.project_id) {
      console.error('No project_id found for job:', job?.id);
      throw new Error('Cannot update - no project ID');
    }
    
    await updateProject.mutateAsync({
      id: job.project_id,
      ...updates
    });
  };

  // Get the project name (from the linked project, not the quote_number)
  const projectName = job.projects?.name || job.quote_number || "Job";

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-7xl space-y-4 p-4">
        <ProjectHeader 
          projectName={projectName} 
          projectNumber={job.quote_number}
          projectValue={job.total_amount}
          currentStatus={job.status}
          projectId={job} // Pass the whole job object so the component can extract project_id
          quoteId={job.id}
          onBack={onBack}
          onProjectUpdate={handleProjectUpdate}
        />
        <ProjectNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {/* Tab Content */}
        <section aria-label="Job section content" className="min-h-[600px]">
          <ProjectTabContent 
            activeTab={activeTab} 
            project={job} 
            onBack={onBack} 
          />
        </section>
      </main>
    </div>
  );
};
