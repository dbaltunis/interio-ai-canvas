import { useState, useCallback, useEffect } from "react";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, Mail, Edit, Clock, Send, X } from "lucide-react";
import { EditUserDialog } from "./EditUserDialog";
import { Input } from "@/components/ui/input";
import { useDeleteUser } from "@/hooks/useUpdateUser";
import { ErrorBoundary } from "@/components/performance/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { useUserInvitations, useDeleteInvitation, useResendInvitation } from "@/hooks/useUserInvitations";
import { useAuth } from "@/components/auth/AuthProvider";
import { useHasPermission } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
}

interface UserListProps {
  users: User[];
  onInviteUser: () => void;
  isLoading?: boolean;
}

export const UserList = ({ users, onInviteUser, isLoading = false }: UserListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirmDialog();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const deleteUser = useDeleteUser();

  // Fetch pending invitations
  const { data: invitations = [] } = useUserInvitations();
  const deleteInvitation = useDeleteInvitation();
  const resendInvitation = useResendInvitation();

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  // Permission check using centralized hook
  const canManageTeam = useHasPermission('manage_team') !== false;

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Simple search filter
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = useCallback((user: User) => {
    if (!canManageTeam) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage team members.",
        variant: "destructive",
      });
      return;
    }
    setEditingUser(user);
  }, [canManageTeam, toast]);

  const handleInviteUser = () => {
    if (!canManageTeam) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to invite team members.",
        variant: "destructive",
      });
      return;
    }
    onInviteUser();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Owner': return 'default';
      case 'Admin': return 'default';
      case 'Manager': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">Team Members</CardTitle>
                <CardDescription>
                  {users.length} member{users.length !== 1 ? 's' : ''} in your team
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleInviteUser}
              size="sm"
              className="gap-2"
              disabled={!canManageTeam}
            >
              <UserPlus className="h-4 w-4" />
              Invite
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Simple Search */}
          <Input
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <div className="space-y-2 pb-4 border-b">
              <h4 className="text-sm font-medium text-amber-600 dark:text-amber-500">
                Pending Invitations ({pendingInvitations.length})
              </h4>
              <div className="space-y-2">
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50/50 dark:bg-amber-950/20"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-amber-100 dark:bg-amber-900">
                          {invitation.invited_email?.[0]?.toUpperCase() || 'I'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{invitation.invited_name || invitation.invited_email}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Badge variant="outline" className="text-xs h-5">{invitation.role}</Badge>
                          <span>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => resendInvitation.mutate(invitation)}
                        disabled={resendInvitation.isPending}
                        title="Resend invitation"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: "Cancel Invitation",
                            description: "Are you sure you want to cancel this invitation?",
                            confirmLabel: "Cancel Invitation",
                            variant: "destructive",
                          });
                          if (confirmed) {
                            deleteInvitation.mutate(invitation.id);
                          }
                        }}
                        disabled={deleteInvitation.isPending}
                        title="Cancel invitation"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Users className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'No users match your search' : 'No team members yet'}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    !canManageTeam
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:bg-muted/50'
                  }`}
                  onClick={() => handleEditUser(user)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-sm font-medium">
                        {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{user.name || 'Unknown User'}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                      {user.role}
                    </Badge>
                    <Badge
                      variant={user.status === 'Active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {user.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditUser(user);
                      }}
                      disabled={!canManageTeam}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>

        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      </Card>
    </ErrorBoundary>
  );
};
