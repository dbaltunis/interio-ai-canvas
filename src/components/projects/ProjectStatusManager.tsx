
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, CheckCircle, AlertCircle, XCircle, Play } from "lucide-react";
import { useUpdateProject } from "@/hooks/useProjects";

interface ProjectStatusManagerProps {
  project: any;
  onUpdate?: (project: any) => void;
}

export const ProjectStatusManager = ({ project, onUpdate }: ProjectStatusManagerProps) => {
  const updateProject = useUpdateProject();
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusConfig = {
    'planning': { icon: Clock, color: 'bg-gray-100 text-gray-800', label: 'Planning' },
    'measuring': { icon: Calendar, color: 'bg-orange-100 text-orange-800', label: 'Measuring' },
    'quoted': { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800', label: 'Quoted' },
    'approved': { icon: CheckCircle, color: 'bg-purple-100 text-purple-800', label: 'Approved' },
    'in-production': { icon: Play, color: 'bg-blue-100 text-blue-800', label: 'In Production' },
    'completed': { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Completed' },
    'cancelled': { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const updateData: any = {
        id: project.id,
        status: newStatus
      };

      // Auto-set completion date when marking as completed
      if (newStatus === 'completed' && !project.completion_date) {
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

  const currentStatus = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.planning;
  const StatusIcon = currentStatus.icon;

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
            <Badge className={currentStatus.color}>
              {currentStatus.label}
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
            disabled={isUpdating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="measuring">Measuring</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in-production">In Production</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Status Actions */}
        <div className="grid grid-cols-2 gap-2">
          {project.status !== 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}
          
          {project.status === 'quoted' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate('approved')}
              disabled={isUpdating}
              className="text-purple-600 hover:text-purple-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          )}
          
          {project.status === 'approved' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate('in-production')}
              disabled={isUpdating}
              className="text-blue-600 hover:text-blue-700"
            >
              <Play className="h-4 w-4 mr-1" />
              Start Production
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <Label>Progress</Label>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                project.status === 'completed' ? 'bg-green-500' :
                project.status === 'in-production' ? 'bg-blue-500' :
                project.status === 'approved' ? 'bg-purple-500' :
                project.status === 'quoted' ? 'bg-yellow-500' :
                project.status === 'measuring' ? 'bg-orange-500' :
                'bg-gray-400'
              }`}
              style={{
                width: `${
                  project.status === 'completed' ? 100 :
                  project.status === 'in-production' ? 80 :
                  project.status === 'approved' ? 60 :
                  project.status === 'quoted' ? 40 :
                  project.status === 'measuring' ? 20 :
                  10
                }%`
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
