
import { useState } from "react";
import { ProjectManagement } from "./ProjectManagement";
import { ProjectDetailsView } from "./ProjectDetailsView";
import { ProjectCreateForm } from "./ProjectCreateForm";
import { ProjectEditForm } from "./ProjectEditForm";
import { DocumentManagement } from "@/components/files/DocumentManagement";

export const EnhancedProjectManagement = () => {
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'documents' | 'create' | 'edit'>('list');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setCurrentView('details');
  };

  const handleCreateProject = () => {
    setCurrentView('create');
  };

  const handleEditProject = (project?: any) => {
    if (project) {
      setSelectedProject(project);
    }
    setCurrentView('edit');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedProject(null);
  };

  const handleViewDocuments = () => {
    setCurrentView('documents');
  };

  const handleProjectSuccess = (project: any) => {
    setSelectedProject(project);
    setCurrentView('details');
  };

  switch (currentView) {
    case 'create':
      return (
        <ProjectCreateForm
          onBack={handleBack}
          onSuccess={handleProjectSuccess}
        />
      );

    case 'edit':
      return (
        <ProjectEditForm
          project={selectedProject}
          onBack={() => setCurrentView('details')}
          onSuccess={handleProjectSuccess}
        />
      );

    case 'details':
      return (
        <ProjectDetailsView
          project={selectedProject}
          onBack={handleBack}
          onEdit={() => handleEditProject(selectedProject)}
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
          onCreateProject={handleCreateProject}
          onViewDocuments={handleViewDocuments}
        />
      );
  }
};
