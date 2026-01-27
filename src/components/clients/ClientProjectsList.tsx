import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Plus, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, ExternalLink, MessageSquare } from "lucide-react";
import { PixelCalendarIcon } from "@/components/icons/PixelArtIcons";
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
import { useUnifiedClientNotes } from "@/hooks/useUnifiedClientNotes";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { useFormattedDates } from "@/hooks/useFormattedDate";

interface ClientProjectsListProps {
  clientId: string;
  onTabChange?: (tab: string) => void;
  compact?: boolean;
}

export const ClientProjectsList = ({ clientId, onTabChange, compact = false }: ClientProjectsListProps) => {
  const { user } = useAuth();
  const { data: projects, isLoading } = useClientJobs(clientId);
  const { notesByProject } = useUnifiedClientNotes(clientId);
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const createQuote = useCreateQuote();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const { isLoading: permissionsLoading } = useUserPermissions();
  const { formatCurrency } = useFormattedCurrency();
  const { formattedDates: dueDates } = useFormattedDates(projects, (p) => p.due_date, false);

  // Calculate project value from quotes
  const getProjectValue = (project: any): number => {
    if (!project.quotes || project.quotes.length === 0) return 0;
    // Get the latest quote's total_amount
    const latestQuote = project.quotes[0];
    return parseFloat(latestQuote.total_amount?.toString() || '0');
  };

  // Calculate total value of all projects
  const totalProjectsValue = projects?.reduce((sum, project) => sum + getProjectValue(project), 0) || 0;
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
    return (
      <div className="space-y-2 py-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    );
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
            {projects.slice(0, 5).map((project) => {
              const notesCount = notesByProject[project.id] || 0;
              const projectValue = getProjectValue(project);
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleViewProject(project.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate flex items-center gap-1">
                      {project.name}
                      {notesCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
                          <MessageSquare className="h-2.5 w-2.5" />
                          {notesCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {project.job_number && (
                        <span className="text-[10px] text-muted-foreground">#{formatJobNumber(project.job_number)}</span>
                      )}
                      {projectValue > 0 && (
                        <span className="text-[10px] font-medium text-green-600">{formatCurrency(projectValue)}</span>
                      )}
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(project.status || 'planning')} text-[9px] px-1 py-0 h-4 shrink-0`} variant="secondary">
                    {(project.status || 'planning').replace('_', ' ')}
                  </Badge>
                </div>
              );
            })}
            {/* Total Projects Value */}
            {totalProjectsValue > 0 && (
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground">Total Value:</span>
                <span className="text-xs font-bold text-green-600">{formatCurrency(totalProjectsValue)}</span>
              </div>
            )}
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
    <Card variant="analytics">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Client Projects
            </CardTitle>
          </div>
          {hasCreateJobsPermission && (
            <Button size="sm" onClick={handleCreateProject} disabled={isCreating} className="h-7 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              {isCreating ? "Creating..." : "New"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!projects || projects.length === 0 ? (
          <div className="empty-state">
            <PixelCalendarIcon size={48} className="mx-auto mb-2" />
            <p className="empty-state-title">Ready for projects</p>
            <p className="empty-state-text text-xs">Start your first project with this client</p>
            {hasCreateJobsPermission && (
              <Button className="mt-3" variant="outline" size="sm" onClick={handleCreateProject} disabled={isCreating}>
                <Plus className="h-3.5 w-3.5 mr-1" />
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
                <TableHead>Value</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const notesCount = notesByProject[project.id] || 0;
                return (
                <TableRow key={project.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {project.name}
                        {notesCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            <MessageSquare className="h-3 w-3" />
                            {notesCount}
                          </span>
                        )}
                      </div>
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
                    {getProjectValue(project) > 0 ? (
                      <span className="font-medium text-green-600">
                        {formatCurrency(getProjectValue(project))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {project.due_date ? (dueDates[project.id] || new Date(project.due_date).toLocaleDateString()) : 'Not set'}
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
                );
              })}
            </TableBody>
            {projects.length > 0 && totalProjectsValue > 0 && (
              <TableFooter>
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={3} className="font-medium text-right">
                    Total Projects Value:
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatCurrency(totalProjectsValue)}
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
