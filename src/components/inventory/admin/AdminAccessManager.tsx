import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Users, Shield, Loader2, UserPlus } from "lucide-react";
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

      // First, get the current user's profile to check if they're an owner or team member
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('parent_account_id')
        .eq('user_id', user.id)
        .single();

      // Determine the account owner ID
      const accountOwnerId = currentProfile?.parent_account_id || user.id;
      
      // Get all team members under this account (excluding the owner)
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, first_name, last_name, avatar_url')
        .eq('parent_account_id', accountOwnerId);

      if (error) throw error;

      // Get permissions for each member
      const membersWithAccess: TeamMember[] = [];

      for (const profile of profiles || []) {
        // Skip the owner (they always have access)
        if (profile.user_id === accountOwnerId) continue;

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
          .maybeSingle();

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
    return 'Team Member';
  };

  const getInitials = (member: TeamMember) => {
    const name = getDisplayName(member);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const membersWithAccess = teamMembers?.filter(m => m.hasAdminAccess) || [];
  const totalMembers = teamMembers?.length || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Share Access</span>
          {membersWithAccess.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
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
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : teamMembers && teamMembers.length > 0 ? (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>{membersWithAccess.length} of {totalMembers} team members have access</span>
            </div>
            <ScrollArea className="max-h-[300px] pr-4">
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <label
                    key={member.user_id}
                    htmlFor={`access-${member.user_id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
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
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(member)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{getDisplayName(member)}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    {member.hasAdminAccess && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Has Access
                      </Badge>
                    )}
                  </label>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No team members yet</p>
            <p className="text-sm mt-1">
              Invite team members from Settings to share access to this section.
            </p>
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
