/**
 * DemoJobCard - EXTRACTED from MobileJobsView.tsx lines 306-400
 * Presentation-only version for tutorial demos - 100% visual accuracy
 * No hooks, no data fetching - accepts static props
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoStatusBadge } from "./DemoStatusBadge";

interface DemoJobCardProps {
  jobNumber: string;
  clientName: string;
  projectName?: string;
  status: string;
  statusColor: string;
  totalAmount: string;
  notesCount?: number;
  highlighted?: boolean;
  onClick?: () => void;
  className?: string;
}

// EXACT color logic from MobileJobsView.tsx getClientAvatarColor
const getAvatarColor = (clientName: string) => {
  const colors = [
    'bg-info',
    'bg-success', 
    'bg-primary',
    'bg-warning',
    'bg-secondary',
    'bg-accent'
  ];
  const index = clientName.length % colors.length;
  return colors[index];
};

// EXACT initials logic from MobileJobsView.tsx getClientInitials
const getInitials = (clientName: string) => {
  if (clientName === 'No Client') return 'NC';
  const names = clientName.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return clientName.substring(0, 2).toUpperCase();
};

export const DemoJobCard = ({
  jobNumber,
  clientName,
  projectName,
  status,
  statusColor,
  totalAmount,
  notesCount = 0,
  highlighted = false,
  onClick,
  className,
}: DemoJobCardProps) => {
  const initials = getInitials(clientName);
  const avatarColor = getAvatarColor(clientName);

  // EXACT JSX from MobileJobsView.tsx lines 306-400
  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer hover:shadow-md transition-all rounded-xl border-border/40 bg-card",
        highlighted && "ring-2 ring-primary",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar - EXACT from MobileJobsView */}
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className={`${avatarColor} text-primary-foreground text-xs font-semibold`}>
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Main Content - EXACT structure */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">
                    {jobNumber}
                  </span>
                  <DemoStatusBadge status={status} color={statusColor} />
                </div>
                <h4 className="font-semibold text-sm line-clamp-1">
                  {clientName.length > 14 ? clientName.substring(0, 14) + '...' : clientName}
                </h4>
              </div>
              
              {/* Menu button with notes badge - EXACT */}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 relative">
                {notesCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {notesCount}
                  </span>
                )}
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Details Row - EXACT */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {projectName && (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{projectName}</span>
                </div>
              )}
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-semibold">
                  {totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
