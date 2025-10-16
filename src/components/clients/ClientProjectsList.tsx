
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { useClientJobs } from "@/hooks/useClientJobs";
import { useSearchParams } from "react-router-dom";
import { formatJobNumber } from "@/lib/format-job-number";

interface ClientProjectsListProps {
  clientId: string;
  onTabChange?: (tab: string) => void;
}

export const ClientProjectsList = ({ clientId, onTabChange }: ClientProjectsListProps) => {
  const { data: projects, isLoading } = useClientJobs(clientId);
  const [searchParams, setSearchParams] = useSearchParams();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'in_progress':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'planning':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'on_hold':
        return 'bg-muted/30 text-muted-foreground border-border';
      default:
        return 'bg-muted/30 text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'in_progress':
        return <Clock className="h-3 w-3" />;
      case 'planning':
        return <Calendar className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'low':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted/30 text-muted-foreground border-border';
    }
  };

  const handleViewProject = (projectId: string) => {
    // Set URL params to navigate to projects tab with the specific job
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', 'projects');
    newParams.set('jobId', projectId); // Changed from 'project' to 'jobId'
    setSearchParams(newParams);
    
    // If onTabChange is provided, use it to navigate
    if (onTabChange) {
      onTabChange('projects');
    }
  };

  const handleCreateProject = () => {
    // Navigate to projects tab for creating a new project
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', 'projects');
    newParams.set('client', clientId);
    newParams.set('action', 'create');
    setSearchParams(newParams);
    
    if (onTabChange) {
      onTabChange('projects');
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading projects...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Client Projects
          </CardTitle>
          <Button size="sm" onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!projects || projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No projects found for this client</p>
            <Button className="mt-2" variant="outline" onClick={handleCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Project
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.name}</div>
                      {project.job_number && (
                        <div className="text-sm text-muted-foreground">
                          Job #{formatJobNumber(project.job_number)}
                        </div>
                      )}
                      {project.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs mt-1">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(project.status || 'planning')} border flex items-center space-x-1 w-fit`} variant="secondary">
                      {getStatusIcon(project.status || 'planning')}
                      <span className="capitalize">{(project.status || 'planning').replace('_', ' ')}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getPriorityColor(project.priority || 'medium')} border`} variant="secondary">
                      {project.priority || 'medium'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewProject(project.id)}
                      className="hover:bg-primary hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Project
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
