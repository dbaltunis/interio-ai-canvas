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
import { Search, Users, Star, Lock, ShieldCheck, Eye } from "lucide-react";
import { useTeamMembersWithJobPermissions } from "@/hooks/useTeamMembersWithJobPermissions";
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
  
  // Use the new permission-aware hook
  const { data: teamPermissions, isLoading: isLoadingTeam } = useTeamMembersWithJobPermissions(ownerId);
  const { data: currentAssignments = [], isLoading: isLoadingAssignments } = useProjectAssignments(projectId);
  const assignUser = useAssignUserToProject();
  const removeUser = useRemoveUserFromProject();
  const queryClient = useQueryClient();

  // Get full access members (view_all_jobs) and needs-assignment members
  const fullAccessMembers = useMemo(() => 
    teamPermissions?.fullAccessMembers ?? [], 
    [teamPermissions]
  );
  
  const needsAssignmentMembers = useMemo(() => 
    teamPermissions?.needsAssignmentMembers ?? [], 
    [teamPermissions]
  );

  // Filter members based on search
  const filteredFullAccessMembers = useMemo(() => {
    if (!searchTerm) return fullAccessMembers;
    const search = searchTerm.toLowerCase();
    return fullAccessMembers.filter(member =>
      member.name?.toLowerCase().includes(search) ||
      member.role?.toLowerCase().includes(search)
    );
  }, [fullAccessMembers, searchTerm]);

  const filteredNeedsAssignmentMembers = useMemo(() => {
    if (!searchTerm) return needsAssignmentMembers;
    const search = searchTerm.toLowerCase();
    return needsAssignmentMembers.filter(member =>
      member.name?.toLowerCase().includes(search) ||
      member.role?.toLowerCase().includes(search)
    );
  }, [needsAssignmentMembers, searchTerm]);

  // Get all needs-assignment member IDs
  const needsAssignmentIds = useMemo(() => 
    needsAssignmentMembers.map(member => member.id),
    [needsAssignmentMembers]
  );

  // Get currently assigned user IDs (only from needs-assignment members)
  const assignedUserIds = useMemo(() => {
    return new Set(
      currentAssignments
        .map(a => a.user_id)
        .filter(id => id !== ownerId && needsAssignmentIds.includes(id))
    );
  }, [currentAssignments, ownerId, needsAssignmentIds]);

  // Initialize selection state when dialog opens
  useEffect(() => {
    if (open && !isLoadingTeam && !isLoadingAssignments && !initialized) {
      const initialState: Record<string, boolean> = {};
      
      // Only initialize selection for needs-assignment members
      // Full access members don't need to be toggled
      const hasExistingAssignments = currentAssignments.length > 0;
      
      needsAssignmentIds.forEach(memberId => {
        if (hasExistingAssignments) {
          // Use existing assignment state
          initialState[memberId] = assignedUserIds.has(memberId);
        } else {
          // No assignments yet - default to unselected
          // This means they DON'T have access by default (must be assigned)
          initialState[memberId] = false;
        }
      });
      
      setSelectedMembers(initialState);
      setInitialized(true);
    }
  }, [open, isLoadingTeam, isLoadingAssignments, initialized, needsAssignmentIds, assignedUserIds, currentAssignments.length]);

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

  // Count selected members (needs-assignment only)
  const selectedCount = Object.values(selectedMembers).filter(Boolean).length;
  const totalNeedsAssignment = needsAssignmentIds.length;
  const allSelected = selectedCount === totalNeedsAssignment && totalNeedsAssignment > 0;

  // Save all changes
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const promises: Promise<any>[] = [];
      
      // Only manage assignments for needs-assignment members
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
        // For new projects with no assignments, any checked member is a change
        return isSelected;
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
            Manage Access
          </DialogTitle>
          <DialogDescription>
            Control who can see <span className="font-medium">{projectName}</span>. Team members with "View All Jobs" permission always have access.
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

          <ScrollArea className="h-[350px] pr-4">
            {isLoading || !initialized ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading team members...
              </div>
            ) : (
              <div className="space-y-4">
                {/* Full Access Section */}
                {filteredFullAccessMembers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Always have access ({fullAccessMembers.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {filteredFullAccessMembers.map((member) => {
                        const initials = getInitials(member.name);
                        const color = getAvatarColor(member.id);
                        
                        return (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-muted/30 opacity-75"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            
                            <Avatar className="h-8 w-8">
                              {member.avatar_url ? (
                                <AvatarImage src={member.avatar_url} alt={member.name} />
                              ) : null}
                              <AvatarFallback className={cn(color, "text-primary-foreground text-xs font-medium")}>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{member.name}</p>
                              <p className="text-xs text-muted-foreground">View All Jobs permission</p>
                            </div>
                            
                            {member.role && (
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {member.role}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Divider if both sections exist */}
                {filteredFullAccessMembers.length > 0 && filteredNeedsAssignmentMembers.length > 0 && (
                  <div className="border-t border-border" />
                )}

                {/* Needs Assignment Section */}
                {filteredNeedsAssignmentMembers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Requires assignment ({needsAssignmentMembers.length})</span>
                      </div>
                      {totalNeedsAssignment > 0 && (
                        <Badge variant={allSelected ? "default" : "secondary"} className="text-[10px]">
                          {selectedCount} of {totalNeedsAssignment} assigned
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {filteredNeedsAssignmentMembers.map((member) => {
                        const initials = getInitials(member.name);
                        const color = getAvatarColor(member.id);
                        const checked = selectedMembers[member.id] ?? false;
                        
                        return (
                          <div
                            key={member.id}
                            className={cn(
                              "flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer",
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
                            
                            <Avatar className="h-8 w-8">
                              {member.avatar_url ? (
                                <AvatarImage src={member.avatar_url} alt={member.name} />
                              ) : null}
                              <AvatarFallback className={cn(color, "text-primary-foreground text-xs font-medium")}>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{member.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {checked ? "Has access to this job" : "Cannot see this job"}
                              </p>
                            </div>
                            
                            {member.role && (
                              <Badge variant="secondary" className="text-[10px] shrink-0">
                                {member.role}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {filteredFullAccessMembers.length === 0 && filteredNeedsAssignmentMembers.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                    <Users className="h-8 w-8 mb-2 opacity-50" />
                    <p>No team members found</p>
                  </div>
                )}
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
