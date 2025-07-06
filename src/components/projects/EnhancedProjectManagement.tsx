
import { useState } from "react";
import { ProjectManagement } from "./ProjectManagement";
import { ProjectDetailsView } from "./ProjectDetailsView";
import { DocumentManagement } from "@/components/files/DocumentManagement";

export const EnhancedProjectManagement = () => {
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'documents'>('list');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setCurrentView('details');
  };

  const handleEditProject = () => {
    // Implementation for editing project
    console.log('Edit project:', selectedProject);
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedProject(null);
  };

  const handleViewDocuments = () => {
    setCurrentView('documents');
  };

  switch (currentView) {
    case 'details':
      return (
        <ProjectDetailsView
          project={selectedProject}
          onBack={handleBack}
          onEdit={handleEditProject}
        />
      );
    
    case 'documents':
      return (
        <div>
          <div className="mb-6">
            <button onClick={handleBack} className="text-blue-600 hover:text-blue-700">
              ← Back to Projects
            </button>
          </div>
          <DocumentManagement projectId={selectedProject?.id} />
        </div>
      );
    
    default:
      return (
        <ProjectManagement
          onViewProject={handleViewProject}
          onViewDocuments={handleViewDocuments}
        />
      );
  }
};
