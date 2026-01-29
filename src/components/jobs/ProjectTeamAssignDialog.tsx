import React, { useState, useMemo, useEffect } from 'react';
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
import { Search, Users, Star, Lock } from "lucide-react";
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
  const [selectedMembers, setSelectedMembers] = useState<Record<string, boolean>>({});
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { data: teamMembers = [], isLoading: isLoadingTeam } = useTeamMembers();
  const { data: currentAssignments = [], isLoading: isLoadingAssignments } = useProjectAssignments(projectId);
  const assignUser = useAssignUserToProject();
  const removeUser = useRemoveUserFromProject();
  const queryClient = useQueryClient();

  // Filter team members (exclude owner from the list since they're always assigned)
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

  // Get all non-owner member IDs
  const allMemberIds = useMemo(() => {
    return teamMembers
      .filter(member => member.id !== ownerId)
      .map(member => member.id);
  }, [teamMembers, ownerId]);

  // Get currently assigned user IDs (excluding owner)
  const assignedUserIds = useMemo(() => {
    return new Set(currentAssignments.map(a => a.user_id).filter(id => id !== ownerId));
  }, [currentAssignments, ownerId]);

  // Initialize selection state when dialog opens
  // Default: ALL members selected (full access), user unchecks to limit
  useEffect(() => {
    if (open && !isLoadingTeam && !isLoadingAssignments && !initialized) {
      const initialState: Record<string, boolean> = {};
      
      // If there are NO assignments yet, default all to selected (full access)
      // If there ARE assignments, use the current assignment state
      const hasExistingAssignments = currentAssignments.length > 0;
      
      allMemberIds.forEach(memberId => {
        if (hasExistingAssignments) {
          // Use existing assignment state
          initialState[memberId] = assignedUserIds.has(memberId);
        } else {
          // No assignments yet - default to all selected
          initialState[memberId] = true;
        }
      });
      
      setSelectedMembers(initialState);
      setInitialized(true);
    }
  }, [open, isLoadingTeam, isLoadingAssignments, initialized, allMemberIds, assignedUserIds, currentAssignments.length]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setInitialized(false);
      setSelectedMembers({});
      setSearchTerm("");
    }
  }, [open]);

  // Handle checkbox toggle
  const handleToggle = (memberId: string) => {
    setSelectedMembers(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  // Count selected members
  const selectedCount = Object.values(selectedMembers).filter(Boolean).length;
  const totalMembers = allMemberIds.length;
  const allSelected = selectedCount === totalMembers;

  // Save all changes
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const promises: Promise<any>[] = [];
      
      for (const [memberId, shouldBeAssigned] of Object.entries(selectedMembers)) {
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
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving team assignments:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    const hasExistingAssignments = currentAssignments.length > 0;
    
    return Object.entries(selectedMembers).some(([memberId, isSelected]) => {
      if (hasExistingAssignments) {
        return isSelected !== assignedUserIds.has(memberId);
      } else {
        // For new projects with no assignments, any unchecked member is a change
        return !isSelected;
      }
    });
  }, [selectedMembers, assignedUserIds, currentAssignments.length]);

  const isLoading = isLoadingTeam || isLoadingAssignments;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Limit Access
          </DialogTitle>
          <DialogDescription>
            All team members have access by default. Unselect members to restrict access to <span className="font-medium">{projectName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Access summary */}
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Team access:</span>
            <Badge variant={allSelected ? "default" : "secondary"}>
              {allSelected ? "All members" : `${selectedCount} of ${totalMembers}`}
            </Badge>
          </div>

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
            {isLoading || !initialized ? (
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
                  const checked = selectedMembers[member.id] ?? true;
                  
                  return (
                    <div
                      key={member.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                        checked 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50 hover:bg-muted/50 opacity-60"
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
              The project owner always has full access
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
            {isSaving ? "Saving..." : "Save Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
