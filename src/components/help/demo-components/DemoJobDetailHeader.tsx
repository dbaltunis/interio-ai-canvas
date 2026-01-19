/**
 * DemoJobDetailHeader - EXTRACTED from JobDetailPage.tsx header section
 * Presentation-only version for tutorial demos - 100% visual accuracy
 * No hooks, no data fetching - accepts static props
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, MoreHorizontal } from "lucide-react";
import { DemoStatusBadge } from "./DemoStatusBadge";
import { cn } from "@/lib/utils";

interface DemoJobDetailHeaderProps {
  jobNumber: string;
  createdDate: string;
  status: string;
  statusColor: string;
  onBack?: () => void;
  highlighted?: boolean;
  className?: string;
}

export const DemoJobDetailHeader = ({
  jobNumber,
  createdDate,
  status,
  statusColor,
  onBack,
  highlighted = false,
  className,
}: DemoJobDetailHeaderProps) => {
  // EXACT structure from JobDetailPage.tsx header
  return (
    <div className={cn(
      "flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card/50",
      highlighted && "ring-2 ring-primary",
      className
    )}>
      {/* Left side - Back button + Job info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 shrink-0"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="min-w-0 flex-1">
          {/* Job number + Status row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono font-semibold text-foreground">
              {jobNumber}
            </span>
            <DemoStatusBadge status={status} color={statusColor} />
          </div>
          
          {/* Created date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />
            <span>{createdDate}</span>
          </div>
        </div>
      </div>
      
      {/* Right side - Menu */}
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
};
