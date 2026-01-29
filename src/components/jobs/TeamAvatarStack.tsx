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

export interface TeamAvatarStackProps {
  owner: TeamMemberInfo;
  assignedMembers?: TeamMemberInfo[];
  maxVisible?: number;
  onClick?: () => void;
  className?: string;
}

export const TeamAvatarStack = ({
  owner,
  assignedMembers = [],
  maxVisible = 3,
  onClick,
  className
}: TeamAvatarStackProps) => {
  const visibleMembers = assignedMembers.slice(0, maxVisible);
  const remainingCount = Math.max(0, assignedMembers.length - maxVisible);
  const hasTeamMembers = assignedMembers.length > 0;
  
  const ownerInitials = getInitials(owner.name);
  const ownerColor = getAvatarColor(owner.id);
  const ownerFirstName = owner.name.split(' ')[0];

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
              hasTeamMembers ? "h-7 w-7 ring-2 ring-primary/20" : "h-6 w-6"
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

        {/* Owner name - only when team exists */}
        {hasTeamMembers && (
          <span className="text-xs font-medium text-muted-foreground max-w-[60px] truncate">
            {ownerFirstName}
          </span>
        )}

        {/* Assigned team members - stacked, only when team exists */}
        {hasTeamMembers && (
          <div className="flex -space-x-2">
            {visibleMembers.map((member, index) => {
              const memberInitials = getInitials(member.name);
              const memberColor = getAvatarColor(member.id);
              
              return (
                <Tooltip key={member.id}>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">{member.name}</p>
                    {member.role && <p className="text-muted-foreground">{member.role}</p>}
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
      </div>
    </TooltipProvider>
  );
};
