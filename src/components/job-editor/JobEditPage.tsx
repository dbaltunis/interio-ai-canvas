
import { useState } from "react";
import { useQuotes } from "@/hooks/useQuotes";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader 
        projectName={job.quote_number || "Job"} 
        projectNumber={job.quote_number}
        projectValue={job.total_amount}
        currentStatus={job.status}
        projectId={job} // Pass the whole job object so the component can extract project_id
        quoteId={job.id}
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
          project={job} 
          onBack={onBack} 
        />
      </div>
    </div>
  );
};
