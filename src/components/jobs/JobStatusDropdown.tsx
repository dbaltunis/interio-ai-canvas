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
import { useCanEditJob } from "@/hooks/useJobEditPermissions";
import { useProject } from "@/hooks/useProjects";
import { useLogStatusChange } from "@/hooks/useStatusHistory";
import { StatusReasonDialog } from "@/components/projects/StatusReasonDialog";
import { useIsDealer } from "@/hooks/useIsDealer";

interface JobStatusDropdownProps {
  currentStatus?: string; // Legacy: for backward compatibility
  currentStatusId?: string | null; // New: UUID of the status
  jobType: "quote" | "project";
  jobId: string;
  project?: any; // Optional: if provided, use it directly
  onStatusChange?: (newStatus: string) => void;
}

export const JobStatusDropdown = ({ 
  currentStatus, 
  currentStatusId,
  jobType, 
  jobId,
  project: providedProject,
  onStatusChange 
}: JobStatusDropdownProps) => {
  const { data: jobStatuses = [] } = useJobStatuses();
  const updateQuote = useUpdateQuote();
  const updateProject = useUpdateProject();
  const logStatusChange = useLogStatusChange();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // State for reason dialog
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    statusId: string;
    statusName: string;
    requiresReason: boolean;
  } | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Fetch project if not provided (for quotes, we might not have project)
  const { data: fetchedProject } = useProject(jobType === "project" ? jobId : "");
  const project = providedProject || fetchedProject;
  
  // Use explicit permissions hook for edit checks
  const { canEditJob } = useCanEditJob(project);
  const canEditJobs = canEditJob ?? false; // Default to false if loading
  const { data: isDealer } = useIsDealer();

  // Filter statuses based on job type
  const filteredByCategory = jobStatuses.filter(status => {
    if (jobType === "quote") {
      return status.category.toLowerCase() === "quote";
    } else {
      // For projects, only show Project category statuses
      return status.category.toLowerCase() === "project";
    }
  });

  // For dealers, restrict to forward-only transitions (no reverting approved/completed jobs)
  const availableStatuses = (() => {
    if (!isDealer || !currentStatusId) return filteredByCategory;
    
    const currentStatusObj = filteredByCategory.find(s => s.id === currentStatusId);
    if (!currentStatusObj) return filteredByCategory;
    
    const currentSortOrder = currentStatusObj.sort_order ?? 0;
    
    // Dealers can only move forward (higher sort_order) or stay at current
    return filteredByCategory.filter(status => {
      const statusSortOrder = status.sort_order ?? 0;
      return statusSortOrder >= currentSortOrder;
    });
  })();

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

  const handleStatusClick = (statusId: string, statusName: string, action: string | null) => {
    const requiresReason = action === 'requires_reason';
    
    if (requiresReason) {
      // Show reason dialog before changing status
      setPendingStatusChange({ statusId, statusName, requiresReason });
      setShowReasonDialog(true);
      setIsOpen(false);
    } else {
      // Direct status change
      executeStatusChange(statusId, statusName);
    }
  };

  const executeStatusChange = async (statusId: string, statusName: string, reason?: string) => {
    setIsChangingStatus(true);
    
    try {
      // Log the status change first
      if (jobType === "project") {
        await logStatusChange.mutateAsync({
          projectId: jobId,
          previousStatusId: currentStatusId || null,
          newStatusId: statusId,
          previousStatusName: currentStatusDetails?.name || null,
          newStatusName: statusName,
          reason,
        });
      }

      // Then update the status
      if (jobType === "quote") {
        await updateQuote.mutateAsync({ id: jobId, status_id: statusId });
      } else {
        await updateProject.mutateAsync({ id: jobId, status_id: statusId });
      }
      
      onStatusChange?.(statusName);
      setIsOpen(false);
      setShowReasonDialog(false);
      setPendingStatusChange(null);
      
      toast({
        title: "Status Updated",
        description: `Status changed to "${statusName}"${reason ? ' with reason recorded' : ''}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleReasonConfirm = (reason: string) => {
    if (pendingStatusChange) {
      executeStatusChange(
        pendingStatusChange.statusId,
        pendingStatusChange.statusName,
        reason
      );
    }
  };

  const handleReasonCancel = () => {
    setShowReasonDialog(false);
    setPendingStatusChange(null);
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
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="h-auto px-3 py-1.5 border hover:bg-muted/50"
          >
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${currentStatusDetails ? getStatusDotColor(currentStatusDetails.color) : 'bg-muted-foreground'}`} />
              <span className="font-medium text-sm">
                {currentStatusDetails?.name || currentStatus || 'No Status'}
              </span>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-background z-[100]">
          {availableStatuses.map((status) => (
            <DropdownMenuItem
              key={status.id}
              onClick={() => handleStatusClick(status.id, status.name, status.action)}
              className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusDotColor(status.color)}`} />
                <div>
                  <div className="font-medium text-sm">{status.name}</div>
                  {status.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">{status.description}</div>
                  )}
                  {status.action === 'requires_reason' && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                      Reason required
                    </div>
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

      <StatusReasonDialog
        isOpen={showReasonDialog}
        statusName={pendingStatusChange?.statusName || ''}
        onConfirm={handleReasonConfirm}
        onCancel={handleReasonCancel}
        isLoading={isChangingStatus}
      />
    </>
  );
};
