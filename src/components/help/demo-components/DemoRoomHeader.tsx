/**
 * DemoRoomHeader - EXTRACTED from RoomHeader.tsx lines 50-117
 * Presentation-only version for tutorial demos - 100% visual accuracy
 * No hooks, no data fetching - accepts static props
 */

import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, ChevronDown, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoRoomHeaderProps {
  roomName: string;
  roomTotal: string;
  isOpen?: boolean;
  onToggle?: () => void;
  highlighted?: boolean;
  showEditButton?: boolean;
  compact?: boolean;
  className?: string;
}

export const DemoRoomHeader = ({
  roomName,
  roomTotal,
  isOpen = true,
  onToggle,
  highlighted = false,
  showEditButton = true,
  compact = false,
  className,
}: DemoRoomHeaderProps) => {
  // EXACT JSX from RoomHeader.tsx lines 50-117
  return (
    <CardHeader 
      className={cn(
        `relative bg-muted/30 border-b border-border p-[14px]`,
        compact ? 'py-3 px-4' : 'py-4 px-6',
        onToggle && 'cursor-pointer select-none',
        highlighted && 'ring-2 ring-primary ring-offset-1',
        className
      )}
      onClick={onToggle}
    >
      {/* Simplified background - EXACT from RoomHeader */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
      </div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 flex-1">
          {/* Chevron - EXACT styling */}
          {onToggle && (
            <ChevronDown 
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                !isOpen && "-rotate-90"
              )}
            />
          )}
          
          <div className="flex-1">
            {/* Room name row - EXACT structure */}
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold text-foreground">{roomName}</CardTitle>
              {showEditButton && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {/* Total - EXACT styling from RoomHeader */}
            <p className="text-xl font-bold text-primary mt-1">{roomTotal}</p>
          </div>
        </div>
        
        {/* Actions menu placeholder */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};
