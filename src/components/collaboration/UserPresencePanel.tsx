import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useAuth } from '@/components/auth/AuthProvider';
import { Users, MessageCircle, ChevronRight, ChevronDown, Circle } from 'lucide-react';
import { formatDisplayName, formatLastSeen, getInitials } from '@/utils/userDisplay';

interface UserPresencePanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const UserPresencePanel = ({ isCollapsed = false, onToggleCollapse }: UserPresencePanelProps) => {
  const { user } = useAuth();
  const { activeUsers = [], isLoading } = useUserPresence();
  const { openConversation } = useDirectMessages();
  const [expandedSections, setExpandedSections] = useState({
    online: true,
    away: true,
    offline: false
  });

  // Filter out current user from main lists
  const otherUsers = activeUsers.filter(u => u.user_id !== user?.id);
  const currentUser = activeUsers.find(u => u.user_id === user?.id);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'away': return 'secondary';
      case 'busy': return 'destructive';
      default: return 'outline';
    }
  };

  const groupedUsers = {
    online: otherUsers.filter(u => u.status === 'online'),
    away: otherUsers.filter(u => u.status === 'away'),
    busy: otherUsers.filter(u => u.status === 'busy'),
    offline: otherUsers.filter(u => u.status === 'offline')
  };

  if (isCollapsed) {
    return (
      <Card className="w-16 h-fit">
        <CardContent className="p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full p-2"
          >
            <Users className="h-5 w-5" />
          </Button>
          <div className="mt-2 space-y-1">
            {/* Show current user first */}
            {currentUser && (
              <div className="relative mb-2">
                <Avatar className="h-8 w-8 ring-2 ring-primary">
                  <AvatarImage src={currentUser.user_profile?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {getInitials(currentUser.user_profile?.display_name || '')}
                  </AvatarFallback>
                </Avatar>
                <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-primary text-primary" />
              </div>
            )}
            {groupedUsers.online.slice(0, 3).map((user) => (
              <div key={user.user_id} className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_profile?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user.user_profile?.display_name || '')}
                  </AvatarFallback>
                </Avatar>
                <Circle className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current ${getStatusColor(user.status)}`} />
              </div>
            ))}
            {otherUsers.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                +{otherUsers.length - 3}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="w-70 h-fit max-h-[600px]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team ({otherUsers.length})
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="px-4 pb-4 space-y-4">
              {/* Current User Section - "You" */}
              {currentUser && (
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Avatar className="h-12 w-12 ring-2 ring-primary">
                      <AvatarImage src={currentUser.user_profile?.avatar_url} />
                      <AvatarFallback className="text-sm font-medium">
                        {getInitials(currentUser.user_profile?.display_name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-primary">You</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser.user_profile?.display_name}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {currentUser.user_profile?.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Circle className="h-2 w-2 fill-primary text-primary" />
                      <span className="text-xs text-primary font-medium">Online</span>
                    </div>
                  </div>
                </div>
              )}

              {(currentUser && otherUsers.length > 0) && <Separator />}
            {/* Online Users */}
            {groupedUsers.online.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto"
                  onClick={() => toggleSection('online')}
                >
                  <div className="flex items-center gap-2">
                    <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                    <span className="text-sm font-medium">Online ({groupedUsers.online.length})</span>
                  </div>
                  {expandedSections.online ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>

                {expandedSections.online && (
                  <div className="space-y-1 mt-2">
                    {groupedUsers.online.map((user) => (
                      <div key={user.user_id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer group" onClick={() => openConversation(user.user_id)}>
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.user_profile?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.user_profile?.display_name || '')}
                            </AvatarFallback>
                          </Avatar>
                          <Circle className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current ${getStatusColor(user.status)}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1">
                                <p className="text-sm font-medium truncate">
                                  {formatDisplayName(user.user_profile?.display_name || '')}
                                </p>
                                <Badge variant="outline" className="text-xs h-4 px-1">
                                  {user.user_profile?.role}
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">{user.user_profile?.display_name}</p>
                            </TooltipContent>
                          </Tooltip>
                          {user.current_activity && (
                            <p className="text-xs text-muted-foreground truncate">
                              {user.current_activity}
                            </p>
                          )}
                        </div>

                        <MessageCircle className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Away/Busy Users */}
            {(groupedUsers.away.length > 0 || groupedUsers.busy.length > 0) && (
              <>
                <Separator />
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-2 h-auto"
                    onClick={() => toggleSection('away')}
                  >
                    <div className="flex items-center gap-2">
                      <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-medium">
                        Away/Busy ({groupedUsers.away.length + groupedUsers.busy.length})
                      </span>
                    </div>
                    {expandedSections.away ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>

                  {expandedSections.away && (
                    <div className="space-y-1 mt-2">
                      {[...groupedUsers.away, ...groupedUsers.busy].map((user) => (
                        <div key={user.user_id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer group opacity-75" onClick={() => openConversation(user.user_id)}>
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.user_profile?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {getInitials(user.user_profile?.display_name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <Circle className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current ${getStatusColor(user.status)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1">
                                  <p className="text-sm font-medium truncate">
                                    {formatDisplayName(user.user_profile?.display_name || '')}
                                  </p>
                                  <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs h-4 px-1">
                                    {user.status}
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">{user.user_profile?.display_name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <MessageCircle className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Offline Users */}
            {groupedUsers.offline.length > 0 && (
              <>
                <Separator />
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-2 h-auto"
                    onClick={() => toggleSection('offline')}
                  >
                    <div className="flex items-center gap-2">
                      <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
                      <span className="text-sm font-medium">Offline ({groupedUsers.offline.length})</span>
                    </div>
                    {expandedSections.offline ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>

                  {expandedSections.offline && (
                    <div className="space-y-1 mt-2">
                      {groupedUsers.offline.map((user) => (
                        <div key={user.user_id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer group opacity-50" onClick={() => openConversation(user.user_id)}>
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.user_profile?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {getInitials(user.user_profile?.display_name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-muted-foreground text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm font-medium truncate">
                                  {formatDisplayName(user.user_profile?.display_name || '')}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">{user.user_profile?.display_name}</p>
                              </TooltipContent>
                            </Tooltip>
                            <p className="text-xs text-muted-foreground">
                              {formatLastSeen(user.last_seen)}
                            </p>
                          </div>

                          <MessageCircle className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};