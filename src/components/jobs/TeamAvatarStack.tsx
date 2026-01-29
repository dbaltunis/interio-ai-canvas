import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  // Calculate who actually has access to this job
  const totalWithAccess = fullAccessMembers.length + assignedMembers.length;
  
  // Calculate if ALL team members who need assignment ARE assigned
  const needsAssignmentCount = totalTeamSize - fullAccessMembers.length;
  const allNeedingAssignmentAreAssigned = 
    needsAssignmentCount <= 0 || assignedMembers.length >= needsAssignmentCount;
  
  // If ALL non-owner team members have view_all_jobs
  const allTeamHasFullAccess = totalTeamSize > 0 && fullAccessMembers.length >= totalTeamSize;
  
  // Everyone has access when all have full access OR all needing assignment are assigned
  const everyoneHasAccess = allTeamHasFullAccess || 
    (needsAssignmentCount > 0 && allNeedingAssignmentAreAssigned);
  
  // Combine visible members: full access + assigned
  const visibleMembers = [...fullAccessMembers, ...assignedMembers].slice(0, maxVisible);
  const remainingCount = Math.max(0, totalWithAccess - maxVisible);
  
  const ownerInitials = getInitials(owner.name);
  const ownerColor = getAvatarColor(owner.id);

  // Determine access state
  const accessState: 'all' | 'limited' | 'private' = everyoneHasAccess 
    ? 'all' 
    : visibleMembers.length > 0 
      ? 'limited' 
      : 'private';

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "flex items-center cursor-pointer group",
          className
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        {/* Owner avatar + name */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <Avatar className="h-6 w-6 border-2 border-background transition-transform group-hover:scale-105">
                {owner.avatarUrl ? (
                  <AvatarImage src={owner.avatarUrl} alt={owner.name} />
                ) : null}
                <AvatarFallback className={cn(ownerColor, "text-primary-foreground text-xs font-medium")}>
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-foreground truncate max-w-[80px]">{owner.name}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            <p className="font-medium">{owner.name}</p>
            <p className="text-muted-foreground">Owner</p>
          </TooltipContent>
        </Tooltip>

        {/* Team members stack */}
        {visibleMembers.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex -space-x-2 ml-1">
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
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              <p className="font-medium mb-1">
                {accessState === 'all' 
                  ? "All team" 
                  : "Limited access"
                }
              </p>
              <div className="text-muted-foreground space-y-0.5">
                {visibleMembers.map(member => {
                  const isFullAccess = 'hasViewAllJobs' in member && member.hasViewAllJobs;
                  return (
                    <p key={member.id}>
                      {member.name} • {isFullAccess ? 'Full access' : 'Assigned'}
                    </p>
                  );
                })}
                {remainingCount > 0 && (
                  <p>+{remainingCount} more</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* When no team members shown but team exists - show indicator */}
        {visibleMembers.length === 0 && totalTeamSize > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[10px] text-muted-foreground ml-1">Private</span>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              <p className="font-medium">Private</p>
              <p className="text-muted-foreground">Only owner can view this job</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
