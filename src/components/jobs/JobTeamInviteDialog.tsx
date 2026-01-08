import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Users, Mail, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface JobTeamInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: any;
  project?: any;
}

export const JobTeamInviteDialog = ({ open, onOpenChange, quote, project }: JobTeamInviteDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { data: teamMembers = [], isLoading } = useTeamMembers();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter team members based on search
  const filteredUsers = teamMembers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Mutation to assign team members to quote via template_custom_data
  const assignMembersMutation = useMutation({
    mutationFn: async (memberIds: string[]) => {
      const quoteId = quote?.id;
      if (!quoteId) throw new Error("No quote ID provided");

      // Get current quote data
      const { data: currentQuote, error: fetchError } = await supabase
        .from('quotes')
        .select('template_custom_data')
        .eq('id', quoteId)
        .single();

      if (fetchError) throw fetchError;

      // Merge with existing custom data
      const existingData = (currentQuote?.template_custom_data as Record<string, unknown>) || {};
      const existingAssignees = (existingData.assigned_team_members as string[]) || [];
      
      // Combine and deduplicate
      const newAssignees = [...new Set([...existingAssignees, ...memberIds])];
      const newAssignmentsCount = newAssignees.length - existingAssignees.length;

      // Update quote with team assignments
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          template_custom_data: {
            ...existingData,
            assigned_team_members: newAssignees
          }
        })
        .eq('id', quoteId);

      if (updateError) throw updateError;

      return { 
        alreadyAssigned: memberIds.length - newAssignmentsCount, 
        newAssignments: newAssignmentsCount 
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      let message = `Assigned ${result.newAssignments} team member(s) to job ${quote?.quote_number}`;
      if (result.alreadyAssigned > 0) {
        message += ` (${result.alreadyAssigned} already assigned)`;
      }
      
      toast({
        title: "Team Updated",
        description: message,
      });
      
      setSelectedMembers([]);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign team members",
        variant: "destructive"
      });
    }
  });

  const handleInviteMembers = () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "No Members Selected",
        description: "Please select at least one team member to assign",
        variant: "destructive"
      });
      return;
    }

    assignMembersMutation.mutate(selectedMembers);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return "bg-primary/10 text-primary";
      case 'manager':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case 'staff':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Assign Team Members - {quote?.quote_number}</span>
          </DialogTitle>
          <DialogDescription>
            Select team members to assign to this job. They'll be able to view and work on this job.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected count */}
          {selectedMembers.length > 0 && (
            <div className="text-sm text-primary">
              {selectedMembers.length} member(s) selected
            </div>
          )}

          {/* User list */}
          <div className="flex-1 overflow-y-auto space-y-2 border rounded-lg p-2">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Loading team members...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{teamMembers.length === 0 ? "No team members found" : "No matching team members"}</p>
                {teamMembers.length === 0 && (
                  <p className="text-xs mt-2">
                    Invite team members from Settings → Team to assign them to jobs.
                  </p>
                )}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleMemberToggle(user.id)}
                >
                  <Checkbox
                    checked={selectedMembers.includes(user.id)}
                    onCheckedChange={() => handleMemberToggle(user.id)}
                  />
                  
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center truncate">
                      <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                      {user.email}
                    </div>
                  </div>
                  
                  <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                    {user.role}
                  </Badge>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInviteMembers}
              disabled={selectedMembers.length === 0 || assignMembersMutation.isPending}
            >
              {assignMembersMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign {selectedMembers.length > 0 ? `${selectedMembers.length} ` : ''}Members
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};