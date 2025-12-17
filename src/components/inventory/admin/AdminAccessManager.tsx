import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  user_id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
  hasAdminAccess: boolean;
}

export const AdminAccessManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Fetch team members with their inventory admin permission
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members-admin-access', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get team members
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, first_name, last_name, avatar_url')
        .eq('parent_account_id', user.id);

      if (error) throw error;

      // Get permissions for each member
      const membersWithAccess: TeamMember[] = [];

      for (const profile of profiles || []) {
        // Get role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.user_id)
          .single();

        // Check if has manage_inventory_admin permission
        const { data: permData } = await supabase
          .from('user_permissions')
          .select('permission_name')
          .eq('user_id', profile.user_id)
          .eq('permission_name', 'manage_inventory_admin')
          .single();

        membersWithAccess.push({
          ...profile,
          role: roleData?.role || 'User',
          hasAdminAccess: !!permData
        });
      }

      return membersWithAccess;
    },
    enabled: !!user && open
  });

  // Toggle admin access mutation
  const toggleAccessMutation = useMutation({
    mutationFn: async ({ userId, grant }: { userId: string; grant: boolean }) => {
      if (grant) {
        // Grant permission
        const { error } = await supabase
          .from('user_permissions')
          .insert({ user_id: userId, permission_name: 'manage_inventory_admin' });
        if (error && error.code !== '23505') throw error; // Ignore duplicate key error
      } else {
        // Revoke permission
        const { error } = await supabase
          .from('user_permissions')
          .delete()
          .eq('user_id', userId)
          .eq('permission_name', 'manage_inventory_admin');
        if (error) throw error;
      }
    },
    onSuccess: (_, { grant }) => {
      queryClient.invalidateQueries({ queryKey: ['team-members-admin-access'] });
      toast.success(grant ? 'Access granted' : 'Access revoked');
    },
    onError: (error) => {
      console.error('Failed to update access:', error);
      toast.error('Failed to update access');
    }
  });

  const getDisplayName = (member: TeamMember) => {
    if (member.display_name) return member.display_name;
    if (member.first_name || member.last_name) {
      return `${member.first_name || ''} ${member.last_name || ''}`.trim();
    }
    return 'Unknown User';
  };

  const getInitials = (member: TeamMember) => {
    const name = getDisplayName(member);
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const membersWithAccess = teamMembers?.filter(m => m.hasAdminAccess) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Share Access</span>
          {membersWithAccess.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {membersWithAccess.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Manage Admin Access
          </DialogTitle>
          <DialogDescription>
            Grant team members access to inventory administration and financial data.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : teamMembers && teamMembers.length > 0 ? (
          <ScrollArea className="max-h-[300px] pr-4">
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`access-${member.user_id}`}
                    checked={member.hasAdminAccess}
                    onCheckedChange={(checked) => {
                      toggleAccessMutation.mutate({
                        userId: member.user_id,
                        grant: !!checked
                      });
                    }}
                    disabled={toggleAccessMutation.isPending}
                  />
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{getDisplayName(member)}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No team members found</p>
            <p className="text-sm">Invite team members to share access</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <Shield className="h-3 w-3 inline mr-1" />
            Users with access can view financial data, export reports, and manage inventory valuations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
