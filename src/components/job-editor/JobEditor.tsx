import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from "@/hooks/useProjects";
import { WindowManager } from './WindowManager';
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react';

interface JobEditorProps {
  projectId: string;
}

export const JobEditor = ({ projectId }: JobEditorProps) => {
  const { data: projects, isLoading, isError, mutate } = useProjects();
  const [activeRoomId, setActiveRoomId] = useState('');
  const [selectedWindowId, setSelectedWindowId] = useState('');

  useEffect(() => {
    if (projects && projects.length > 0) {
      // Logic to potentially set initial activeRoomId or selectedWindowId
    }
  }, [projects]);

  const handleSaveProject = async (updatedProject: any) => {
    // Optimistically update the project in the local cache
    const updatedProjects = projects?.map(p => p.id === updatedProject.id ? updatedProject : p) || [];
    mutate(updatedProjects, false); // Update local data without re-fetching

    // Make the API call to update the project
    try {
      const response = await fetch(`/api/projects/${updatedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.status}`);
      }

      // If the API call is successful, trigger a re-fetch to update the data
      mutate();
    } catch (error: any) {
      console.error("Update project failed:", error);
      // If the API call fails, revert the local cache to the previous state
      mutate(projects, false);
    }
  };

  const project = projects?.find(p => p.id === projectId);

  if (isLoading) {
    return <div>Loading project...</div>;
  }

  if (isError) {
    return <div>Error loading project.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Edit Project</h1>
          <div>{/* Placeholder for additional actions */}</div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            {/* Placeholder for Room and Window Selection */}
            <div>
              {/* Room List */}
              <div>
                {/* Example Room Item */}
                {/* End Example Room Item */}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <WindowManager
              project={project}
              onSave={handleSaveProject}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
