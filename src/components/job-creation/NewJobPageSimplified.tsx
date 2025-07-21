
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NewJobWizard } from "./NewJobWizard";

interface NewJobPageSimplifiedProps {
  onBack: () => void;
}

export const NewJobPageSimplified = ({ onBack }: NewJobPageSimplifiedProps) => {
  const [jobData, setJobData] = useState({
    title: "",
    status: "draft",
    client_id: null,
    description: ""
  });

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Clean Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Jobs</span>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Create New Job</h1>
              <p className="text-sm text-gray-500">Step-by-step job creation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Creation Wizard */}
      <div className="w-full">
        <NewJobWizard 
          onBack={onBack}
          initialData={jobData}
          onDataChange={setJobData}
        />
      </div>
    </div>
  );
};
