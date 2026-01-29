import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
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
  
  const ownerInitials = getInitials(owner.name);
  const ownerColor = getAvatarColor(owner.id);

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
        {/* Owner avatar with star badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Avatar className="h-7 w-7 border-2 border-background transition-transform group-hover:scale-105">
                {owner.avatarUrl ? (
                  <AvatarImage src={owner.avatarUrl} alt={owner.name} />
                ) : null}
                <AvatarFallback className={cn(ownerColor, "text-primary-foreground text-xs font-medium")}>
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              {/* Gold star badge */}
              <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                <Star className="h-2 w-2 text-amber-900 fill-amber-900" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p className="font-medium">{owner.name}</p>
            <p className="text-muted-foreground">Owner</p>
          </TooltipContent>
        </Tooltip>

        {/* Assigned team members - stacked */}
        {visibleMembers.length > 0 && (
          <div className="flex -space-x-2 ml-1">
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
