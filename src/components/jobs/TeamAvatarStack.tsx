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
  // If no assigned members, it means full access (everyone can see)
  const isFullAccess = assignedMembers.length === 0;
  const isRestricted = assignedMembers.length > 0;
  
  // For restricted mode, show avatars with lock indicator
  const effectiveMaxVisible = isRestricted ? Math.min(maxVisible, 3) : maxVisible;
  const visibleMembers = assignedMembers.slice(0, effectiveMaxVisible);
  const remainingCount = Math.max(0, assignedMembers.length - effectiveMaxVisible);
  
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
              isRestricted ? "h-7 w-7 ring-2 ring-primary/20" : "h-6 w-6"
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

        {/* Full access badge - shown when no restrictions */}
        {isFullAccess && (
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            All team
          </Badge>
        )}

        {/* Restricted access - show assigned team members with lock indicator */}
        {isRestricted && (
          <div className="flex -space-x-2.5">
            {visibleMembers.map((member, index) => {
              const memberInitials = getInitials(member.name);
              const memberColor = getAvatarColor(member.id);
              const isFirst = index === 0;
              
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
                      {/* Lock icon on first avatar to indicate restricted access */}
                      {isFirst && (
                        <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500 flex items-center justify-center ring-1 ring-background">
                          <Lock className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
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
