import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Mail, MessageSquare, MoreHorizontal } from "lucide-react";
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

export const TeamMembersWidget = () => {
  const { user } = useAuth();
  const { data: teamMembers = [], isLoading } = useTeamMembers();
  const { data: presenceData = [] } = useTeamPresence();
  const { openConversation, conversations = [] } = useDirectMessages();
  const { data: userRole } = useUserRole();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [recentMessageUsers, setRecentMessageUsers] = useState<Set<string>>(new Set());

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
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
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Team</span>
          </CardTitle>
          {userRole?.isAdmin && (
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 h-8 text-xs"
              onClick={() => window.location.href = "/?tab=settings"}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4 sm:px-6">
          <div className="space-y-2 sm:space-y-3 py-3">
            {sortedTeamMembers.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-20" />
                <p className="text-xs sm:text-sm">No team members yet</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="mt-1 sm:mt-2 text-xs"
                  onClick={() => window.location.href = "/?tab=team"}
                >
                  Invite your first team member
                </Button>
              </div>
            ) : (
              <>
                {sortedTeamMembers.map((member) => {
              const status = getPresenceStatus(member.id);
              const conversation = conversations.find(c => c.user_id === member.id);
              const hasUnread = (conversation?.unread_count || 0) > 0;
              
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-colors ${
                    hasUnread ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' : 'bg-card hover:bg-accent/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-background">
                      {member.avatar_url ? (
                        <AvatarImage src={member.avatar_url} alt={member.name} />
                      ) : null}
                      <AvatarFallback className="text-xs sm:text-sm font-semibold bg-primary/10 text-primary">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-background ${getStatusColor(status)}`}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold text-xs sm:text-sm truncate ${hasUnread ? 'text-primary' : 'text-foreground'}`}>
                        {member.name}
                      </h4>
                      {hasUnread && (
                        <Badge variant="destructive" className="text-[10px] h-4 px-1">
                          {conversation!.unread_count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {member.role}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      onClick={() => handleSendMessage(member.id)}
                      title="Send message"
                    >
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSendMessage(member.id)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        {member.email && member.email !== "Hidden" && (
                          <DropdownMenuItem onClick={() => window.location.href = `mailto:${member.email}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => window.location.href = "/?tab=team"}>
                          <Users className="h-4 w-4 mr-2" />
                          View All Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  </div>
                );
              })}
            </>
          )}
          </div>
        </ScrollArea>
      </CardContent>

      <DirectMessageDialog 
        open={messageDialogOpen} 
        onOpenChange={setMessageDialogOpen}
        selectedUserId={selectedUserId}
      />
    </Card>
  );
};
