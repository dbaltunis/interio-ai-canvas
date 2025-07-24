
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, DollarSign } from "lucide-react";

interface ClientProjectsProps {
  clientId: string;
  onCreateProject?: () => void;
}

export const ClientProjects = ({ clientId, onCreateProject }: ClientProjectsProps) => {
  // Mock projects data - replace with actual hook
  const projects = [
    {
      id: "1",
      name: "Living Room Curtains",
      status: "in_progress",
      start_date: "2024-01-15",
      due_date: "2024-02-15",
      total_value: 2500
    },
    {
      id: "2", 
      name: "Master Bedroom Blinds",
      status: "planning",
      start_date: "2024-02-01",
      due_date: "2024-03-01",
      total_value: 1800
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Projects</CardTitle>
          {onCreateProject && (
            <Button size="sm" onClick={onCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No projects found for this client.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{project.name}</h4>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{project.start_date} - {project.due_date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>${project.total_value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
