
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { FolderOpen } from "lucide-react";

interface JobsTableProps {
  onProjectSelect?: (projectId: string) => void;
}

export const JobsTable = ({ onProjectSelect }: JobsTableProps) => {
  const { data: projects } = useProjects();

  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground">
            Create your first project to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
                <Button 
                  onClick={() => onProjectSelect?.(project.id)}
                  variant="outline"
                >
                  Open Project
                </Button>
              </div>
            </div>
          </CardHeader>
          {project.total_amount && (
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                £{project.total_amount.toFixed(2)}
              </p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
