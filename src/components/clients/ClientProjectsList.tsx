
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { useClientJobs } from "@/hooks/useClientJobs";
import { useNavigate } from "react-router-dom";
import { formatJobNumber } from "@/lib/format-job-number";
import { useCreateProject } from "@/hooks/useProjects";
import { useCreateQuote } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface ClientProjectsListProps {
  clientId: string;
  onTabChange?: (tab: string) => void;
  compact?: boolean;
}

export const ClientProjectsList = ({ clientId, onTabChange, compact = false }: ClientProjectsListProps) => {
  const { user } = useAuth();
  const { data: projects, isLoading } = useClientJobs(clientId);
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const createQuote = useCreateQuote();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const { isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[ClientProjectsList] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });
  
  // Check if create_jobs is explicitly in user_permissions table (ignores role-based)
  const hasCreateJobsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'create_jobs'
  ) ?? false;

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
    // Navigate directly with all params including section for quotation tab
    navigate(`/?tab=projects&jobId=${projectId}&section=quotation`);
  };

  const handleCreateProject = async () => {
    // Check permission before creating
    if (!hasCreateJobsPermission) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to create jobs.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    try {
      console.log('[CLIENT] Creating new project for client:', clientId);
      
      // Create the project - useCreateProject will handle job number generation
      const newProject = await createProject.mutateAsync({
        name: `New Job ${new Date().toLocaleDateString()}`,
        description: "",
        status: "planning",
        client_id: clientId
      });

      console.log('[CLIENT] Project created:', newProject.id);

      // Create a quote for this project
      await createQuote.mutateAsync({
        project_id: newProject.id,
        client_id: clientId,
        status: "draft",
        subtotal: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 0,
        notes: "New job created",
      });

      console.log('[CLIENT] Quote created, navigating to project');

      // Navigate to the projects tab with the new job opened
      const targetUrl = `/?tab=projects&jobId=${newProject.id}`;
      console.log('[CLIENT] Navigating to:', targetUrl);
      navigate(targetUrl);
      console.log('[CLIENT] Navigate called, checking if onTabChange exists:', !!onTabChange);
      
      if (onTabChange) {
        console.log('[CLIENT] Calling onTabChange with projects');
        onTabChange('projects');
      }

      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      console.error('[CLIENT] Failed to create project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-xs text-muted-foreground">Loading projects...</div>;
  }

  // Compact mode for sidebar
  if (compact) {
    return (
      <div className="space-y-1.5">
        {!projects || projects.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground mb-2">No projects yet</p>
            {hasCreateJobsPermission && (
              <Button size="sm" variant="outline" onClick={handleCreateProject} disabled={isCreating} className="h-6 text-[10px] px-2">
                <Plus className="h-2.5 w-2.5 mr-1" />
                {isCreating ? "..." : "New"}
              </Button>
            )}
          </div>
        ) : (
          <>
            {projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => handleViewProject(project.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{project.name}</div>
                  {project.job_number && (
                    <div className="text-[10px] text-muted-foreground">#{formatJobNumber(project.job_number)}</div>
                  )}
                </div>
                <Badge className={`${getStatusColor(project.status || 'planning')} text-[9px] px-1 py-0 h-4 shrink-0`} variant="secondary">
                  {(project.status || 'planning').replace('_', ' ')}
                </Badge>
              </div>
            ))}
            {projects.length > 5 && (
              <Button variant="ghost" size="sm" className="w-full h-6 text-[10px]" onClick={() => onTabChange?.('projects')}>
                +{projects.length - 5} more projects
              </Button>
            )}
            {hasCreateJobsPermission && (
              <Button size="sm" variant="outline" onClick={handleCreateProject} disabled={isCreating} className="w-full h-6 text-[10px] mt-1">
                <Plus className="h-2.5 w-2.5 mr-1" />
                {isCreating ? "Creating..." : "New Project"}
              </Button>
            )}
          </>
        )}
      </div>
    );
  }

  // Full mode (for tabs/standalone)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Client Projects
          </CardTitle>
          {hasCreateJobsPermission && (
            <Button size="sm" onClick={handleCreateProject} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? "Creating..." : "New Project"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!projects || projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No projects found for this client</p>
            {hasCreateJobsPermission && (
              <Button className="mt-2" variant="outline" onClick={handleCreateProject} disabled={isCreating}>
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? "Creating..." : "Create First Project"}
              </Button>
            )}
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
