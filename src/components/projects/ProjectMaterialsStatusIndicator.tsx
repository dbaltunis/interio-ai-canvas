import { Badge } from "@/components/ui/badge";
import { Package, Clock, ShoppingCart, CheckCircle, Loader2 } from "lucide-react";
import { useProjectMaterialsStatus } from "@/hooks/useProjectMaterialsStatus";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectMaterialsStatusIndicatorProps {
  projectId: string;
  variant?: 'full' | 'compact';
}

export const ProjectMaterialsStatusIndicator = ({ 
  projectId, 
  variant = 'compact' 
}: ProjectMaterialsStatusIndicatorProps) => {
  const { data: status, isLoading } = useProjectMaterialsStatus(projectId);

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (!status || !status.hasAnyActivity) {
    return variant === 'full' ? (
      <span className="text-xs text-muted-foreground">No materials ordered</span>
    ) : null;
  }

  if (variant === 'compact') {
    // Compact view for table cells - show the most relevant status
    if (status.ordered > 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                <ShoppingCart className="h-3 w-3" />
                {status.ordered}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{status.ordered} material{status.ordered !== 1 ? 's' : ''} ordered from suppliers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (status.inBatch > 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                <Package className="h-3 w-3" />
                {status.inBatch}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{status.inBatch} material{status.inBatch !== 1 ? 's' : ''} in batch order</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (status.inQueue > 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Clock className="h-3 w-3" />
                {status.inQueue}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{status.inQueue} material{status.inQueue !== 1 ? 's' : ''} in purchasing queue</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (status.received > 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <CheckCircle className="h-3 w-3" />
                {status.received}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{status.received} material{status.received !== 1 ? 's' : ''} received</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  }

  // Full view - show all statuses
  return (
    <div className="flex flex-wrap gap-1">
      {status.inQueue > 0 && (
        <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          <Clock className="h-3 w-3" />
          {status.inQueue} queued
        </Badge>
      )}
      {status.inBatch > 0 && (
        <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
          <Package className="h-3 w-3" />
          {status.inBatch} batched
        </Badge>
      )}
      {status.ordered > 0 && (
        <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
          <ShoppingCart className="h-3 w-3" />
          {status.ordered} ordered
        </Badge>
      )}
      {status.received > 0 && (
        <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="h-3 w-3" />
          {status.received} received
        </Badge>
      )}
    </div>
  );
};
