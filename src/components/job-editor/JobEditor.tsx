
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Calculator, Package } from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import { WindowManager } from "./WindowManager";

interface JobEditorProps {
  projectId: string;
  onBack?: () => void;
}

export const JobEditor = ({ projectId, onBack }: JobEditorProps) => {
  const [activeRoomId, setActiveRoomId] = useState("");
  const [selectedWindowId, setSelectedWindowId] = useState("");
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return <div className="p-6">Loading project...</div>;
  }

  if (!project) {
    return <div className="p-6">Project not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-600">{project.job_number}</p>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate
          </Button>
          <Button variant="outline" size="sm">
            <Package className="h-4 w-4 mr-2" />
            Inventory
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <WindowManager
            project={project}
            activeRoomId={activeRoomId}
            selectedWindowId={selectedWindowId}
            onWindowSelect={setSelectedWindowId}
          />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-gray-600">Client:</span>
                <p className="font-medium">{project.client_id}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Due Date:</span>
                <p className="font-medium">{project.due_date || "Not set"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Priority:</span>
                <p className="font-medium capitalize">{project.priority}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
