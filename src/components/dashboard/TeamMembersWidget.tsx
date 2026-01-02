import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Mail, MessageCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useTeamPresence } from "@/hooks/useTeamPresence";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DirectMessageDialog } from "@/components/collaboration/DirectMessageDialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getAvatarColor, getInitials } from "@/lib/avatar-utils";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";

export const TeamMembersWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: teamMembers = [], isLoading } = useTeamMembers();
  const { data: presenceData = [] } = useTeamPresence();
  const { openConversation, conversations = [] } = useDirectMessages();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [recentMessageUsers, setRecentMessageUsers] = useState<Set<string>>(new Set());

  // Permission checks - following the same pattern as jobs
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-team-widget', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[TeamMembersWidget] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  // Check if view_team_members is explicitly in user_permissions table
  const hasViewTeamMembersPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_team_members'
  ) ?? false;

  // Check if send_team_messages is explicitly in user_permissions table
  const hasSendTeamMessagesPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'send_team_messages'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  // Only allow view if user is System Owner OR (Owner/Admin *without* explicit permissions) OR (explicit permissions include view_team_members)
  const canViewTeamMembers =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasViewTeamMembersPermission
          : hasViewTeamMembersPermission;

  // Only allow send if user is System Owner OR (Owner/Admin *without* explicit permissions) OR (explicit permissions include send_team_messages)
  const canSendTeamMessages =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasSendTeamMessagesPermission
          : hasSendTeamMessagesPermission;

  const handleAddTeamMember = () => {
    console.log('Add team member clicked, navigating to settings...');
    console.log('User role:', userRoleData);
    navigate('/?tab=settings&section=users');
  };

  const getPresenceStatus = (userId: string) => {
    const presence = presenceData.find(p => p.user_id === userId);
    return presence?.status || "offline";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleSendMessage = (userId: string) => {
    // Check permission before opening message dialog
    const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;
    if (isPermissionLoaded && !canSendTeamMessages) {
      toast.error("Permission Denied", {
        description: "You don't have permission to send team messages.",
      });
      return;
    }
    // Don't allow opening while permissions are loading
    if (!isPermissionLoaded) {
      toast("Loading", {
        description: "Please wait while permissions are being checked...",
      });
      return;
    }
    setSelectedUserId(userId);
    setMessageDialogOpen(true);
    openConversation(userId);
  };

  // Subscribe to real-time messages
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('team-messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          const message = payload.new as { sender_id: string; content: string; recipient_id: string };
          
          // Find sender info
          const sender = teamMembers.find(m => m.id === message.sender_id);
          const senderName = sender?.name || 'Team member';
          
          // Mark user as recently messaged
          setRecentMessageUsers(prev => new Set([...prev, message.sender_id]));
          
          // Show notification
          toast.message(`New message from ${senderName}`, {
            description: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
            action: {
              label: 'Reply',
              onClick: () => handleSendMessage(message.sender_id)
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, teamMembers]);

  // Don't render if user doesn't have permission (after permissions are loaded)
  // This must be after all hooks to avoid "Rendered fewer hooks than expected" error
  if (explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canViewTeamMembers) {
    return null;
  }

  // Filter out current user and sort team members
  const otherTeamMembers = teamMembers.filter(member => member.id !== user?.id);
  const sortedTeamMembers = [...otherTeamMembers].sort((a, b) => {
    // Check for unread messages in conversations
    const aConversation = conversations.find(c => c.user_id === a.id);
    const bConversation = conversations.find(c => c.user_id === b.id);
    const aUnread = aConversation?.unread_count || 0;
    const bUnread = bConversation?.unread_count || 0;
    
    // First priority: users with unread messages
    if (aUnread !== bUnread) return bUnread - aUnread;
    
    // Second priority: users who recently sent messages
    const aRecent = recentMessageUsers.has(a.id);
    const bRecent = recentMessageUsers.has(b.id);
    if (aRecent !== bRecent) return aRecent ? -1 : 1;
    
    // Third priority: online status
    const aStatus = getPresenceStatus(a.id);
    const bStatus = getPresenceStatus(b.id);
    const statusOrder = { online: 0, away: 1, busy: 2, offline: 3 };
    const aOrder = statusOrder[aStatus as keyof typeof statusOrder] ?? 3;
    const bOrder = statusOrder[bStatus as keyof typeof statusOrder] ?? 3;
    
    return aOrder - bOrder;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-14 sm:h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-4 w-4" />
            Team
          </CardTitle>
          {isAdmin && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 gap-1.5 text-xs"
              onClick={handleAddTeamMember}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {sortedTeamMembers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs">No team members yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {sortedTeamMembers.map((member) => {
                const status = getPresenceStatus(member.id);
                const conversation = conversations.find(c => c.user_id === member.id);
                const hasUnread = (conversation?.unread_count || 0) > 0;
                const unreadCount = conversation?.unread_count || 0;
                const avatarColor = getAvatarColor(member.id); // Use ID for consistent colors
                
                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-lg bg-background border border-border transition-all ${
                      explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canSendTeamMessages
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:border-primary/40 hover:bg-primary/5'
                    }`}
                    onClick={() => handleSendMessage(member.id)}
                  >
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-background ring-2 ring-primary/10">
                      {member.avatar_url ? (
                        <AvatarImage src={member.avatar_url} alt={member.name} />
                      ) : null}
                      <AvatarFallback className={`text-xs sm:text-sm font-semibold ${avatarColor} text-white`}>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-background ${getStatusColor(status)}`}
                    />
                  </div>
                    
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm truncate text-foreground">
                      {member.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[160px] sm:max-w-none">
                      {member.role}
                    </p>
                  </div>
                    
                  {hasUnread ? (
                    <div className="relative shrink-0">
                      <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
                        <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[9px] sm:text-[10px] font-bold text-primary-foreground">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-1.5 sm:p-2 rounded-full bg-muted/50 hover:bg-primary/10 transition-colors">
                      <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <DirectMessageDialog 
        open={messageDialogOpen} 
        onOpenChange={setMessageDialogOpen}
        selectedUserId={selectedUserId}
      />
    </Card>
  );
};
