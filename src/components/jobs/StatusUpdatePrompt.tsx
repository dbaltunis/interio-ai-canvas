import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { useUpdateProject } from "@/hooks/useProjects";
import { toast } from "sonner";

interface StatusUpdatePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  currentStatus: string;
}

export const StatusUpdatePrompt = ({ 
  open, 
  onOpenChange, 
  projectId,
  currentStatus 
}: StatusUpdatePromptProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: jobStatuses = [] } = useJobStatuses();
  const updateProject = useUpdateProject();
  
  // Find suggested next status based on current status
  const getSuggestedStatus = () => {
    const currentStatusLower = currentStatus.toLowerCase();
    
    // If currently in quote/draft/pending, suggest "Order Accepted" or "In Production"
    if (['quote', 'draft', 'pending', 'sent'].includes(currentStatusLower)) {
      return jobStatuses.find(s => 
        s.name.toLowerCase().includes('order') || 
        s.name.toLowerCase().includes('accepted') ||
        s.name.toLowerCase().includes('production')
      ) || jobStatuses.find(s => s.name.toLowerCase().includes('active'));
    }
    
    return null;
  };
  
  const suggestedStatus = getSuggestedStatus();
  const currentStatusObj = jobStatuses.find(s => s.name.toLowerCase() === currentStatus.toLowerCase());
  
  const handleUpdateStatus = async () => {
    if (!suggestedStatus) return;
    
    setIsUpdating(true);
    try {
      await updateProject.mutateAsync({
        id: projectId,
        status: suggestedStatus.name
      });
      
      toast.success("Job status updated", {
        description: `Status changed to "${suggestedStatus.name}"`
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to update status", {
        description: error.message
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (!suggestedStatus) {
    return null;
  }
  
  const getStatusColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'gray': 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-200',
      'blue': 'bg-blue-100 text-blue-800 dark:bg-blue-600/30 dark:text-blue-200',
      'green': 'bg-green-100 text-green-800 dark:bg-green-600/30 dark:text-green-200',
      'yellow': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600/30 dark:text-yellow-200',
      'orange': 'bg-orange-100 text-orange-800 dark:bg-orange-600/30 dark:text-orange-200',
      'red': 'bg-red-100 text-red-800 dark:bg-red-600/30 dark:text-red-200',
      'primary': 'bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary',
    };
    return colorMap[color] || colorMap['gray'];
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Update Job Status?
          </DialogTitle>
          <DialogDescription>
            You've sent materials to purchasing, which typically indicates the job has moved beyond the quotation stage.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Current Status</div>
              <Badge className={getStatusColor(currentStatusObj?.color || 'gray')}>
                {currentStatus}
              </Badge>
            </div>
            
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Suggested Status</div>
              <Badge className={getStatusColor(suggestedStatus.color)}>
                {suggestedStatus.name}
              </Badge>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <strong>Why update?</strong> Sending materials to purchasing typically means:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The client has accepted your quote</li>
              <li>The job is transitioning to production</li>
              <li>You're ready to order materials and begin work</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Keep Current Status
          </Button>
          <Button 
            onClick={handleUpdateStatus}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : `Update to "${suggestedStatus.name}"`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};