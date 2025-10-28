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
  currentStatus: string;
  jobType: "quote" | "project";
  jobId: string;
  onStatusChange?: (newStatus: string) => void;
}

export const JobStatusDropdown = ({ 
  currentStatus, 
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

  // Get current status details - exact match first, then case-insensitive
  const currentStatusDetails = jobStatuses.find(status => status.name === currentStatus) || 
                               jobStatuses.find(status => status.name.toLowerCase() === currentStatus.toLowerCase());

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
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-border';
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
      
      toast({
        title: "Success",
        description: `${jobType === "quote" ? "Quote" : "Project"} status updated to ${statusName}`,
      });
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
            : 'bg-gray-100 text-gray-800'
        } font-medium`}
      >
        {currentStatus?.charAt(0).toUpperCase() + currentStatus?.slice(1).replace('_', ' ')}
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
                : 'bg-gray-100 text-gray-800'
            } flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity`}
          >
            {currentStatus?.charAt(0).toUpperCase() + currentStatus?.slice(1).replace('_', ' ')}
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
              <div className={`w-3 h-3 rounded-full bg-${status.color}-500 ring-2 ring-${status.color}-500/20`} />
              <div>
                <div className="font-medium text-sm">{status.name}</div>
                {status.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">{status.description}</div>
                )}
              </div>
            </div>
            {(status.name === currentStatus || status.name.toLowerCase() === currentStatus.toLowerCase()) && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};