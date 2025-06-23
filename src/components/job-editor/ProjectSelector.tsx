
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";

interface ProjectSelectorProps {
  selectedProjectId: string;
  onProjectSelect: (projectId: string) => void;
}

export const ProjectSelector = ({ selectedProjectId, onProjectSelect }: ProjectSelectorProps) => {
  const { data: projects } = useProjects();
  const { data: clients } = useClients();

  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Project</CardTitle>
        <CardDescription>Choose an existing project to edit</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedProjectId} onValueChange={onProjectSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a project..." />
          </SelectTrigger>
          <SelectContent>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedProject && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium">{selectedProject.name}</h4>
            <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{selectedProject.status}</Badge>
              <Badge variant="outline">{selectedProject.priority}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
