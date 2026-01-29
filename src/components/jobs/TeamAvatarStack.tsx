import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface TeamMemberInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface FullAccessMemberInfo extends TeamMemberInfo {
  hasViewAllJobs: boolean;
}

export interface TeamAvatarStackProps {
  owner: TeamMemberInfo;
  assignedMembers?: TeamMemberInfo[];
  fullAccessMembers?: FullAccessMemberInfo[]; // Members with view_all_jobs permission
  totalTeamSize?: number; // Total team size for "All team" badge calculation
  maxVisible?: number;
  onClick?: () => void;
  className?: string;
}

export const TeamAvatarStack = ({
  owner,
  assignedMembers = [],
  fullAccessMembers = [],
  totalTeamSize = 0,
  maxVisible = 3,
  onClick,
  className
}: TeamAvatarStackProps) => {
  // Calculate who actually has access to this job:
  // 1. Owner always has access
  // 2. Full access members (view_all_jobs) always have access
  // 3. Assigned members (view_assigned_jobs) only have access if explicitly assigned
  
  // Total people who can see this job (excluding owner since they're always shown separately)
  const totalWithAccess = fullAccessMembers.length + assignedMembers.length;
  
  // Calculate if ALL team members who need assignment ARE assigned
  const needsAssignmentCount = totalTeamSize - fullAccessMembers.length;
  const allNeedingAssignmentAreAssigned = 
    needsAssignmentCount <= 0 || assignedMembers.length >= needsAssignmentCount;
  
  // If ALL non-owner team members have view_all_jobs, show "All team" badge
  const allTeamHasFullAccess = totalTeamSize > 0 && fullAccessMembers.length >= totalTeamSize;
  
  // Everyone has access when:
  // - All members have full access (view_all_jobs), OR
  // - All members who need assignment have been assigned
  const everyoneHasAccess = allTeamHasFullAccess || 
    (needsAssignmentCount > 0 && allNeedingAssignmentAreAssigned);
  
  // Combine visible members: full access + assigned
  const visibleMembers = [...fullAccessMembers, ...assignedMembers].slice(0, maxVisible);
  const remainingCount = Math.max(0, totalWithAccess - maxVisible);
  
  const ownerInitials = getInitials(owner.name);
  const ownerColor = getAvatarColor(owner.id);

  // Determine access state for badge display
  const accessState: 'all' | 'limited' | 'private' = everyoneHasAccess 
    ? 'all' 
    : visibleMembers.length > 0 
      ? 'limited' 
      : 'private';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex items-center cursor-pointer group gap-2",
              className
            )}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            {/* Owner avatar - always visible */}
            <Avatar className="h-6 w-6 border-2 border-background transition-transform group-hover:scale-105">
              {owner.avatarUrl ? (
                <AvatarImage src={owner.avatarUrl} alt={owner.name} />
              ) : null}
              <AvatarFallback className={cn(ownerColor, "text-primary-foreground text-xs font-medium")}>
                {ownerInitials}
              </AvatarFallback>
            </Avatar>

            {/* Show team members when there's any access info to display (not "all team") */}
            {accessState !== 'all' && visibleMembers.length > 0 && (
              <div className="flex -space-x-2.5">
                {visibleMembers.map((member, index) => {
                  const memberInitials = getInitials(member.name);
                  const memberColor = getAvatarColor(member.id);
                  
                  return (
                    <Avatar 
                      key={member.id}
                      className="h-6 w-6 border-2 border-background transition-transform group-hover:scale-105"
                      style={{ zIndex: visibleMembers.length - index }}
                    >
                      {member.avatarUrl ? (
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                      ) : null}
                      <AvatarFallback className={cn(memberColor, "text-primary-foreground text-[10px] font-medium")}>
                        {memberInitials}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
                
                {/* Overflow indicator */}
                {remainingCount > 0 && (
                  <Avatar className="h-6 w-6 border-2 border-background bg-muted">
                    <AvatarFallback className="text-[10px] font-medium text-muted-foreground bg-muted">
                      +{remainingCount}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )}

            {/* Access level badge */}
            {accessState === 'all' && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                All team
              </Badge>
            )}
            
            {accessState === 'limited' && (
              <Badge 
                variant="warning" 
                className="text-[10px] h-5 px-1.5"
              >
                Limited
              </Badge>
            )}
            
            {accessState === 'private' && totalTeamSize > 0 && (
              <Badge 
                variant="warning" 
                className="text-[10px] h-5 px-1.5"
              >
                Private
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[200px]">
          <p className="font-medium mb-1">
            {accessState === 'all' 
              ? "All team members can view" 
              : accessState === 'limited'
                ? `${visibleMembers.length + 1} team member${visibleMembers.length > 0 ? 's' : ''} can view`
                : "Only owner can view"
            }
          </p>
          <p className="text-muted-foreground">
            {accessState === 'all' 
              ? "No access restrictions on this job"
              : "Click to manage team access"
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
