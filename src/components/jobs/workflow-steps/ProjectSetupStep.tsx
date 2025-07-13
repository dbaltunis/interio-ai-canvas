import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  User, 
  Calendar,
  Hash,
  FileText,
  DollarSign
} from "lucide-react";
import { useCreateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";

interface ProjectSetupStepProps {
  client?: any;
  project?: any;
  onProjectUpdate: (project: any) => void;
}

export const ProjectSetupStep = ({ client, project, onProjectUpdate }: ProjectSetupStepProps) => {
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    priority: "medium" as const,
    start_date: "",
    due_date: "",
    status: "draft" as const
  });

  const createProjectMutation = useCreateProject();
  const { toast } = useToast();

  // Generate project name suggestion based on client
  useEffect(() => {
    if (client && !projectData.name) {
      const today = new Date().toISOString().split('T')[0];
      const suggestion = `${client.name} - Window Treatments - ${today}`;
      setProjectData(prev => ({ ...prev, name: suggestion }));
    }
  }, [client, projectData.name]);

  const handleCreateProject = async () => {
    if (!client) {
      toast({
        title: "Error",
        description: "Please select a client first",
        variant: "destructive"
      });
      return;
    }

    if (!projectData.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const createdProject = await createProjectMutation.mutateAsync({
        ...projectData,
        client_id: client.id,
        start_date: projectData.start_date || null,
        due_date: projectData.due_date || null
      });

      onProjectUpdate(createdProject);
      toast({
        title: "Success",
        description: "Project created successfully"
      });
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-blue-100 text-blue-800",
    "in-progress": "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800"
  };

  return (
    <div className="space-y-6">
      {/* Client Summary */}
      {client && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Client: {client.name}</h3>
                <p className="text-sm text-blue-600">
                  {client.email} • {client.phone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Created Success */}
      {project && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800">{project.name}</h3>
                  <p className="text-sm text-green-600">
                    Job #{project.job_number} • {project.status}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Created</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Setup Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={projectData.name}
                onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name"
                disabled={!!project}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the project..."
                rows={3}
                disabled={!!project}
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={projectData.priority}
                onChange={(e) => setProjectData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                disabled={!!project}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={projectData.status}
                onChange={(e) => setProjectData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                disabled={!!project}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={projectData.start_date}
                onChange={(e) => setProjectData(prev => ({ ...prev, start_date: e.target.value }))}
                disabled={!!project}
              />
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={projectData.due_date}
                onChange={(e) => setProjectData(prev => ({ ...prev, due_date: e.target.value }))}
                disabled={!!project}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Preview:</h4>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className={priorityColors[projectData.priority]}>
                {projectData.priority} priority
              </Badge>
              <Badge variant="secondary" className={statusColors[projectData.status]}>
                {projectData.status}
              </Badge>
              {projectData.start_date && (
                <span className="flex items-center gap-1 text-gray-600">
                  <Calendar className="h-3 w-3" />
                  Starts {new Date(projectData.start_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {!project && (
            <div className="pt-4">
              <Button
                onClick={handleCreateProject}
                disabled={createProjectMutation.isPending || !projectData.name.trim() || !client}
                className="bg-brand-primary hover:bg-brand-accent flex items-center gap-2"
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                <Hash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps Preview */}
      {project && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <FileText className="h-5 w-5" />
              Next: Room & Window Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-600 mb-4">
              Now you'll add rooms and windows to create your curtain and blind treatments.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-800 mb-1">Add Rooms</h4>
                <p className="text-blue-600">Create rooms for your project</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-800 mb-1">Add Windows</h4>
                <p className="text-blue-600">Map windows in each room</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-800 mb-1">Configure Treatments</h4>
                <p className="text-blue-600">Set curtains, blinds & pricing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};