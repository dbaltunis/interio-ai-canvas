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

  // Filter statuses based on job type - show all statuses for projects
  const availableStatuses = jobStatuses.filter(status => {
    if (jobType === "quote") {
      return status.category.toLowerCase() === "quote";
    } else {
      // For projects, show all statuses (no category restriction)
      return true;
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
      'primary': 'bg-primary/10 text-primary border-primary/20',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-border';
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (jobType === "quote") {
        await updateQuote.mutateAsync({ id: jobId, status: newStatus });
      } else {
        await updateProject.mutateAsync({ id: jobId, status: newStatus });
      }
      
      onStatusChange?.(newStatus);
      setIsOpen(false);
      
      toast({
        title: "Success",
        description: `${jobType === "quote" ? "Quote" : "Project"} status updated to ${newStatus}`,
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

  // If user doesn't have permission to edit jobs, show status as read-only
  if (!canEditJobs) {
    return (
      <Badge 
        className={`${
          currentStatusDetails 
            ? getStatusColor(currentStatusDetails.color)
            : 'bg-gray-100 text-gray-800'
        }`}
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
      <DropdownMenuContent align="start" className="w-56">
        {availableStatuses.map((status) => (
          <DropdownMenuItem
            key={status.id}
            onClick={() => handleStatusChange(status.name)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full bg-${status.color}-500`} />
              <div>
                <div className="font-medium">{status.name}</div>
                {status.description && (
                  <div className="text-xs text-muted-foreground">{status.description}</div>
                )}
              </div>
            </div>
            {(status.name === currentStatus || status.name.toLowerCase() === currentStatus.toLowerCase()) && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};