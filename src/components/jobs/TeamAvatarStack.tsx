import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { Lock } from 'lucide-react';
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
  
  // If ALL non-owner team members have view_all_jobs, show "All team" badge
  // This means everyone can see the job without explicit assignment
  const allTeamHasFullAccess = totalTeamSize > 0 && fullAccessMembers.length >= totalTeamSize;
  
  // Show "All team" if everyone has full access OR if there are no restrictions at all
  // (i.e., no explicit assignments and all members can view all jobs)
  const showAllTeamBadge = allTeamHasFullAccess;
  
  // If there are members who need assignment but aren't assigned, show lock icon
  // This indicates restricted access
  const hasRestrictedAccess = assignedMembers.length > 0 || 
    (fullAccessMembers.length < totalTeamSize && totalTeamSize > 0);
  
  // Combine visible members: full access + assigned
  const visibleMembers = [...fullAccessMembers, ...assignedMembers].slice(0, maxVisible);
  const remainingCount = Math.max(0, totalWithAccess - maxVisible);
  
  const ownerInitials = getInitials(owner.name);
  const ownerColor = getAvatarColor(owner.id);

  return (
    <TooltipProvider>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className={cn(
              "border-2 border-background transition-transform group-hover:scale-105",
              hasRestrictedAccess ? "h-7 w-7 ring-2 ring-primary/20" : "h-6 w-6"
            )}>
              {owner.avatarUrl ? (
                <AvatarImage src={owner.avatarUrl} alt={owner.name} />
              ) : null}
              <AvatarFallback className={cn(ownerColor, "text-primary-foreground text-xs font-medium")}>
                {ownerInitials}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p className="font-medium">{owner.name}</p>
            <p className="text-muted-foreground">Owner</p>
          </TooltipContent>
        </Tooltip>

        {/* All team badge - shown when everyone has view_all_jobs */}
        {showAllTeamBadge && (
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            All team
          </Badge>
        )}

        {/* Show team members when there's any access info to display */}
        {!showAllTeamBadge && visibleMembers.length > 0 && (
          <div className="flex -space-x-2.5">
            {visibleMembers.map((member, index) => {
              const memberInitials = getInitials(member.name);
              const memberColor = getAvatarColor(member.id);
              const isFirst = index === 0;
              const isFullAccess = 'hasViewAllJobs' in member && member.hasViewAllJobs;
              
              return (
                <Tooltip key={member.id}>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar 
                        className={cn(
                          "h-6 w-6 border-2 border-background transition-transform group-hover:scale-105"
                        )}
                        style={{ zIndex: visibleMembers.length - index }}
                      >
                        {member.avatarUrl ? (
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                        ) : null}
                        <AvatarFallback className={cn(memberColor, "text-primary-foreground text-[10px] font-medium")}>
                          {memberInitials}
                        </AvatarFallback>
                      </Avatar>
                      {/* Lock icon on first avatar when there's restricted access */}
                      {isFirst && hasRestrictedAccess && (
                        <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500 flex items-center justify-center ring-1 ring-background">
                          <Lock className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-muted-foreground">
                      {isFullAccess ? 'Full Access' : 'Assigned'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            
            {/* Overflow indicator */}
            {remainingCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6 border-2 border-background bg-muted">
                    <AvatarFallback className="text-[10px] font-medium text-muted-foreground bg-muted">
                      +{remainingCount}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>{remainingCount} more team member{remainingCount > 1 ? 's' : ''}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* When no one else has access (only owner) and not all team badge */}
        {!showAllTeamBadge && visibleMembers.length === 0 && totalTeamSize > 0 && (
          <div className="flex items-center gap-1">
            <div className="h-3.5 w-3.5 rounded-full bg-amber-500 flex items-center justify-center">
              <Lock className="h-2 w-2 text-white" />
            </div>
            <span className="text-[10px] text-muted-foreground">Owner only</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
