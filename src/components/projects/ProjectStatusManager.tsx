import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, CheckCircle, AlertCircle, XCircle, Play } from "lucide-react";
import { useUpdateProject } from "@/hooks/useProjects";
import { useJobStatuses } from "@/hooks/useJobStatuses";

interface ProjectStatusManagerProps {
  project: any;
  onUpdate?: (project: any) => void;
}

export const ProjectStatusManager = ({ project, onUpdate }: ProjectStatusManagerProps) => {
  const updateProject = useUpdateProject();
  const { data: jobStatuses = [] } = useJobStatuses();
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter statuses for projects
  const projectStatuses = jobStatuses.filter(
    status => status.category.toLowerCase() === 'project'
  );

  // Get current status details from database
  const currentStatusDetails = projectStatuses.find(
    status => status.name.toLowerCase() === project.status?.toLowerCase()
  );

  const getStatusColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'gray': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
      'blue': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', 
      'green': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      'orange': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
      'red': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      'purple': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
      'primary': 'bg-primary/10 text-primary border-primary/20',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const updateData: any = {
        id: project.id,
        status: newStatus.toLowerCase()
      };

      // Auto-set completion date when marking as completed
      const statusDetails = projectStatuses.find(s => s.name.toLowerCase() === newStatus.toLowerCase());
      if (statusDetails?.action === 'completed' && !project.completion_date) {
        updateData.completion_date = new Date().toISOString().split('T')[0];
      }

      const updatedProject = await updateProject.mutateAsync(updateData);
      onUpdate?.(updatedProject);
    } catch (error) {
      console.error('Error updating project status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if current status allows editing
  const isLocked = currentStatusDetails?.action === 'locked' || currentStatusDetails?.action === 'completed';
  const isViewOnly = currentStatusDetails?.action === 'view_only';
  const canChangeStatus = !isLocked && !isViewOnly;

  // Default icon if no status found
  const StatusIcon = CheckCircle;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="h-5 w-5" />
          Project Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Status</p>
            <Badge className={currentStatusDetails ? getStatusColor(currentStatusDetails.color) : 'bg-gray-100 text-gray-800'}>
              {currentStatusDetails ? currentStatusDetails.name : project.status}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="text-sm font-medium">
              {new Date(project.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Update Status</Label>
          <Select 
            value={project.status} 
            onValueChange={handleStatusUpdate}
            disabled={isUpdating || !canChangeStatus}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projectStatuses.map((status) => (
                <SelectItem key={status.id} value={status.name.toLowerCase()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{status.name}</span>
                    {(status.action === 'locked' || status.action === 'view_only') && (
                      <Badge variant="outline" className="text-xs ml-2">
                        {status.action === 'locked' ? 'Locked' : 'View Only'}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!canChangeStatus && (
            <p className="text-xs text-muted-foreground">
              Status is {isLocked ? 'locked' : 'view-only'} and cannot be changed
            </p>
          )}
        </div>

        {/* Quick Status Actions - Now using dynamic statuses */}
        {canChangeStatus && (
          <div className="grid grid-cols-2 gap-2">
            {projectStatuses
              .filter(status => 
                status.action === 'completed' && 
                project.status !== status.name.toLowerCase()
              )
              .map((status) => (
                <Button
                  key={status.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate(status.name)}
                  disabled={isUpdating}
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {status.name}
                </Button>
              ))
            }
          </div>
        )}

        {/* Progress Indicator - Now using dynamic logic */}
        <div className="space-y-2">
          <Label>Progress</Label>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStatusDetails 
                  ? `bg-${currentStatusDetails.color}-500`
                  : 'bg-gray-400'
              }`}
              style={{
                width: `${
                  currentStatusDetails?.action === 'completed' ? 100 :
                  currentStatusDetails?.action === 'progress_only' ? 70 :
                  currentStatusDetails?.action === 'view_only' ? 50 :
                  currentStatusDetails?.action === 'editable' ? 30 :
                  20
                }%`
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};