import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, Star } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useProjectAssignments, useAssignUserToProject, useRemoveUserFromProject } from "@/hooks/useProjectAssignments";
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

interface ProjectTeamAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  ownerId: string;
}

export const ProjectTeamAssignDialog = ({
  open,
  onOpenChange,
  projectId,
  projectName,
  ownerId
}: ProjectTeamAssignDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const { data: teamMembers = [], isLoading: isLoadingTeam } = useTeamMembers();
  const { data: currentAssignments = [], isLoading: isLoadingAssignments } = useProjectAssignments(projectId);
  const assignUser = useAssignUserToProject();
  const removeUser = useRemoveUserFromProject();
  const queryClient = useQueryClient();

  // Get currently assigned user IDs
  const assignedUserIds = useMemo(() => {
    return new Set(currentAssignments.map(a => a.user_id));
  }, [currentAssignments]);

  // Filter team members (exclude owner from the list since they're always shown)
  const filteredMembers = useMemo(() => {
    return teamMembers
      .filter(member => member.id !== ownerId) // Exclude owner
      .filter(member => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          member.name?.toLowerCase().includes(search) ||
          member.email?.toLowerCase().includes(search) ||
          member.role?.toLowerCase().includes(search)
        );
      });
  }, [teamMembers, ownerId, searchTerm]);

  // Determine if a member is checked (considering pending changes)
  const isChecked = (memberId: string) => {
    if (pendingChanges[memberId] !== undefined) {
      return pendingChanges[memberId];
    }
    return assignedUserIds.has(memberId);
  };

  // Handle checkbox toggle
  const handleToggle = (memberId: string) => {
    const currentState = isChecked(memberId);
    setPendingChanges(prev => ({
      ...prev,
      [memberId]: !currentState
    }));
  };

  // Save all pending changes
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const promises: Promise<any>[] = [];
      
      for (const [memberId, shouldBeAssigned] of Object.entries(pendingChanges)) {
        const isCurrentlyAssigned = assignedUserIds.has(memberId);
        
        if (shouldBeAssigned && !isCurrentlyAssigned) {
          // Add assignment
          promises.push(
            assignUser.mutateAsync({ projectId, userId: memberId, role: "member" })
          );
        } else if (!shouldBeAssigned && isCurrentlyAssigned) {
          // Remove assignment
          promises.push(
            removeUser.mutateAsync({ projectId, userId: memberId })
          );
        }
      }
      
      await Promise.all(promises);
      
      // Invalidate bulk assignments query
      queryClient.invalidateQueries({ queryKey: ["projects-assignments-bulk"] });
      
      setPendingChanges({});
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving team assignments:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if there are unsaved changes
  const hasChanges = Object.keys(pendingChanges).some(memberId => {
    const originalState = assignedUserIds.has(memberId);
    return pendingChanges[memberId] !== originalState;
  });

  const isLoading = isLoadingTeam || isLoadingAssignments;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Team Members
          </DialogTitle>
          <DialogDescription>
            Select team members to assign to <span className="font-medium">{projectName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Team members list */}
          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading team members...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Users className="h-8 w-8 mb-2 opacity-50" />
                <p>No team members found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMembers.map((member) => {
                  const initials = getInitials(member.name);
                  const color = getAvatarColor(member.id);
                  const checked = isChecked(member.id);
                  
                  return (
                    <div
                      key={member.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                        checked 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                      onClick={() => handleToggle(member.id)}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => handleToggle(member.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <Avatar className="h-9 w-9">
                        {member.avatar_url ? (
                          <AvatarImage src={member.avatar_url} alt={member.name} />
                        ) : null}
                        <AvatarFallback className={cn(color, "text-primary-foreground text-sm font-medium")}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        {member.email && member.email !== "Hidden" && (
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        )}
                      </div>
                      
                      {member.role && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {member.role}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Owner info */}
          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">
              The project owner is always assigned and cannot be removed
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? "Saving..." : "Save Assignments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
