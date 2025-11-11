import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { useUpdateQuote } from "@/hooks/useQuotes";
import { useUpdateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";

interface JobStatusDropdownProps {
  currentStatus?: string; // Legacy: for backward compatibility
  currentStatusId?: string | null; // New: UUID of the status
  jobType: "quote" | "project";
  jobId: string;
  onStatusChange?: (newStatus: string) => void;
}

export const JobStatusDropdown = ({ 
  currentStatus, 
  currentStatusId,
  jobType, 
  jobId, 
  onStatusChange 
}: JobStatusDropdownProps) => {
  const { data: jobStatuses = [] } = useJobStatuses();
  const updateQuote = useUpdateQuote();
  const updateProject = useUpdateProject();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Permission checks - use create_jobs since edit permissions don't exist
  const canCreateJobs = useHasPermission('create_jobs');
  const canViewAllJobs = useHasPermission('view_all_jobs');
  const canEditJobs = canCreateJobs || canViewAllJobs;

  // Filter statuses based on job type
  const availableStatuses = jobStatuses.filter(status => {
    if (jobType === "quote") {
      return status.category.toLowerCase() === "quote";
    } else {
      // For projects, only show Project category statuses
      return status.category.toLowerCase() === "project";
    }
  });

  // Get current status details - prioritize status_id (UUID) over legacy status name
  const currentStatusDetails = currentStatusId 
    ? jobStatuses.find(status => status.id === currentStatusId)
    : (jobStatuses.find(status => status.name === currentStatus) || 
       jobStatuses.find(status => status.name.toLowerCase() === currentStatus?.toLowerCase()));

  const getStatusColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'gray': 'bg-muted/50 text-muted-foreground border-border',
      'blue': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20', 
      'green': 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
      'yellow': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
      'orange': 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
      'red': 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
      'purple': 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
      'primary': 'bg-primary/10 text-primary border-primary/20',
    };
    return colorMap[color.toLowerCase()] || 'bg-muted/50 text-muted-foreground border-border';
  };
  
  const getStatusDotColor = (color: string) => {
    const dotColorMap: Record<string, string> = {
      'gray': 'bg-muted-foreground',
      'blue': 'bg-blue-500',
      'green': 'bg-green-500',
      'yellow': 'bg-yellow-500',
      'orange': 'bg-orange-500',
      'red': 'bg-red-500',
      'purple': 'bg-purple-500',
      'primary': 'bg-primary',
    };
    return dotColorMap[color.toLowerCase()] || 'bg-muted-foreground';
  };

  const handleStatusChange = async (statusId: string, statusName: string) => {
    try {
      if (jobType === "quote") {
        await updateQuote.mutateAsync({ id: jobId, status_id: statusId });
      } else {
        await updateProject.mutateAsync({ id: jobId, status_id: statusId });
      }
      
      onStatusChange?.(statusName);
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  // Check if user has permission to edit
  const isReadOnly = !canEditJobs;

  // If user doesn't have permission to edit, show as read-only badge
  if (isReadOnly) {
    return (
      <Badge 
        className={`${
          currentStatusDetails 
            ? getStatusColor(currentStatusDetails.color)
            : 'bg-muted/50 text-muted-foreground border-border'
        } font-medium border`}
      >
        {currentStatusDetails?.name || currentStatus || 'No Status'}
      </Badge>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Badge 
            className={`${
              currentStatusDetails 
                ? getStatusColor(currentStatusDetails.color)
                : 'bg-muted/50 text-muted-foreground border-border'
            } flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity border`}
          >
            {currentStatusDetails?.name || currentStatus || 'No Status'}
            <ChevronDown className="h-3 w-3" />
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-background z-[100]">
        {availableStatuses.map((status) => (
          <DropdownMenuItem
            key={status.id}
            onClick={() => handleStatusChange(status.id, status.name)}
            className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusDotColor(status.color)}`} />
              <div>
                <div className="font-medium text-sm">{status.name}</div>
                {status.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">{status.description}</div>
                )}
              </div>
            </div>
            {(currentStatusId ? status.id === currentStatusId : (status.name === currentStatus || status.name.toLowerCase() === currentStatus?.toLowerCase())) && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};