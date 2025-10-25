import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Mail, MessageSquare, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useTeamPresence } from "@/hooks/useTeamPresence";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DirectMessageDialog } from "@/components/collaboration/DirectMessageDialog";

export const TeamMembersWidget = () => {
  const { data: teamMembers = [], isLoading } = useTeamMembers();
  const { data: presenceData = [] } = useTeamPresence();
  const { openConversation } = useDirectMessages();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

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
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-2 h-8 text-xs"
            onClick={() => window.location.href = "/?tab=team"}
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {teamMembers.length === 0 ? (
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
            {teamMembers.slice(0, 5).map((member) => {
              const status = getPresenceStatus(member.id);
              
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
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
                    <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">
                      {member.name}
                    </h4>
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
            
            {teamMembers.length > 5 && (
              <Button 
                variant="link" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => window.location.href = "/?tab=team"}
              >
                View all {teamMembers.length} team members
              </Button>
            )}
          </>
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
