import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useAuth } from '@/components/auth/AuthProvider';
import { Users, MessageCircle, Zap, Circle, Send, X } from 'lucide-react';
import { DirectMessageDialog } from './DirectMessageDialog';
import { cn } from '@/lib/utils';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TeamCollaborationCenterProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const TeamCollaborationCenter = ({ isOpen, onToggle }: TeamCollaborationCenterProps) => {
  const { user } = useAuth();
  const { activeUsers = [] } = useUserPresence();
  const { openConversation, totalUnreadCount = 0, conversations = [] } = useDirectMessages();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const { data: teamMembers = [] } = useTeamMembers();
  const queryClient = useQueryClient();
  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active })
        .eq('user_id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['user-presence'] });
      queryClient.invalidateQueries({ queryKey: ['team-presence'] });
    },
  });

  // Lock background scroll when panel is open
  useEffect(() => {
    const html = document.documentElement;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyTouch = document.body.style.touchAction as string;
    const originalHtmlOverflow = html.style.overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      html.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalBodyOverflow || '';
      document.body.style.touchAction = originalBodyTouch || '';
      html.style.overflow = originalHtmlOverflow || '';
    }
    return () => {
      document.body.style.overflow = originalBodyOverflow || '';
      document.body.style.touchAction = originalBodyTouch || '';
      html.style.overflow = originalHtmlOverflow || '';
    };
  }, [isOpen]);

  // Separate current user and others
  const currentUser = activeUsers.find(u => u.user_id === user?.id);
  const otherUsers = activeUsers.filter(u => u.user_id !== user?.id);
  const onlineUsers = otherUsers.filter(u => u.status === 'online');
  const offlineUsers = otherUsers.filter(u => u.status !== 'online');
  const totalUsers = activeUsers.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'away': return 'text-yellow-400';
      case 'busy': return 'text-red-400';
      case 'never_logged_in': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'online': return 'from-green-400 to-emerald-500';
      case 'away': return 'from-yellow-400 to-orange-500';
      case 'busy': return 'from-red-400 to-red-600';
      case 'never_logged_in': return 'from-gray-300 to-gray-500';
      default: return 'from-gray-300 to-gray-400';
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={onToggle}
          className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary shadow-2xl overflow-hidden group border-2 border-white/20"
          variant="ghost"
        >
          {/* Icon with proper contrast */}
          <div className="relative z-10 flex items-center justify-center">
            <Users className="h-7 w-7 text-white drop-shadow-lg" />
            {(onlineUsers.length > 0 || totalUnreadCount > 0) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                style={{
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              >
                {totalUnreadCount > 0 ? totalUnreadCount : onlineUsers.length}
              </motion.div>
            )}
          </div>
          
          {/* Improved gradient background with better contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90 group-hover:from-primary group-hover:to-secondary transition-all duration-300" />
        </Button>
      </motion.div>

      {/* Sliding Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (disabled when message dialog is open) */}
            {!messageDialogOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-background/70 dark:bg-background/60 backdrop-blur-[2px]"
                onClick={onToggle}
              />
            )}
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn("fixed right-0 top-0 h-full w-96 z-[101] liquid-glass panel shadow-2xl overflow-hidden border-l border-border", messageDialogOpen ? "pointer-events-none" : "pointer-events-auto")}
            >
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="p-6 glass-morphism border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                        <Zap className="h-6 w-6 text-yellow-400" />
                        Team Hub
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        {onlineUsers.length} of {totalUsers} online
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggle}
                      className="text-muted-foreground hover:text-foreground hover:bg-accent/30"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Tabs for Team & Messages */}
                <div className="flex-1 overflow-hidden">
                  <Tabs defaultValue="team" className="h-full flex flex-col">
                    <TabsList className="mx-4 mt-4 glass-morphism rounded-xl border">
                      <TabsTrigger value="team" className="rounded-full text-foreground data-[state=active]:bg-accent data-[state=active]:text-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        Team ({totalUsers})
                      </TabsTrigger>
                      <TabsTrigger value="messages" className="rounded-full text-foreground data-[state=active]:bg-accent data-[state=active]:text-foreground">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Messages
                        {totalUnreadCount > 0 && (
                          <Badge className="ml-2 bg-red-500 text-white text-xs">
                            {totalUnreadCount}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="team" className="flex-1 overflow-y-auto p-4 space-y-3 mt-0 glass-morphism rounded-lg border">
                      {/* Current User */}
                      {currentUser && (
                        <div>
                          <p className="text-muted-foreground text-sm mb-3 font-medium flex items-center gap-2">
                            You <span className="text-xs bg-accent/30 text-foreground border border-border px-2 py-1 rounded-full">Currently Active</span>
                          </p>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative"
                          >
                            <div className="glass-morphism rounded-xl p-4 border border-border">
                              
                              {/* Status indicator gradient line */}
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-emerald-500 rounded-l-xl" />
                              
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <Avatar className="h-12 w-12 ring-2 ring-white/30">
                                    <AvatarImage src={currentUser.user_profile?.avatar_url} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                                      {currentUser.user_profile?.display_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  {/* Animated status dot */}
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -bottom-1 -right-1 h-4 w-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white/30"
                                  />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-foreground truncate">
                                      {currentUser.user_profile?.display_name}
                                    </p>
                                      <Badge 
                                      variant="secondary" 
                                      className="text-xs bg-accent/30 text-foreground border border-border"
                                    >
                                      {currentUser.user_profile?.role}
                                    </Badge>
                                  </div>
                                  
                                    {currentUser.current_activity && (
                                      <p className="text-sm text-muted-foreground truncate">
                                      🎯 {currentUser.current_activity}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}

                      {/* Online Users */}
                      {onlineUsers.length > 0 && (
                        <div>
                          <p className="text-white/80 text-sm mb-3 font-medium">Online Now</p>
                          {onlineUsers.map((user, index) => (
                            <motion.div
                              key={user.user_id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="group relative"
                            >
                               <div className="glass-morphism rounded-xl p-4 hover:bg-accent/30 transition-all duration-300 cursor-pointer border border-border"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openConversation(user.user_id);
                                      setMessageDialogOpen(true);
                                    }}>
                                
                                {/* Status indicator gradient line */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getStatusBgColor(user.status)} rounded-l-xl`} />
                                
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <Avatar className="h-12 w-12 ring-2 ring-white/20">
                                      <AvatarImage src={user.user_profile?.avatar_url} />
                                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                                        {user.user_profile?.display_name?.charAt(0) || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    
                                    {/* Animated status dot */}
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                      className={`absolute -bottom-1 -right-1 h-4 w-4 bg-gradient-to-r ${getStatusBgColor(user.status)} rounded-full border-2 border-white/30`}
                                    />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-semibold text-white truncate">
                                        {user.user_profile?.display_name}
                                      </p>
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs bg-accent/30 text-foreground border border-border"
                                      >
                                        {user.user_profile?.role}
                                      </Badge>
                                    </div>
                                    
                                    {user.current_activity && (
                                      <p className="text-sm text-muted-foreground truncate">
                                        🎯 {user.current_activity}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-muted-foreground hover:text-foreground hover:bg-accent/30 rounded-full h-10 w-10 p-0"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Offline/Away Users */}
                      {offlineUsers.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: onlineUsers.length * 0.1 + 0.3 }}
                        >
                          <div className="pt-4 border-t border-border">
                            <p className="text-muted-foreground text-sm mb-3 font-medium">Offline/Away</p>
                            <div className="space-y-2">
                              {offlineUsers.map((user) => (
                                 <div key={user.user_id} 
                                      className="flex items-center gap-3 p-3 rounded-lg glass-morphism border border-border cursor-pointer hover:bg-accent/30 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openConversation(user.user_id);
                                        setMessageDialogOpen(true);
                                      }}>
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.user_profile?.avatar_url} />
                                    <AvatarFallback className="bg-muted text-foreground text-sm">
                                      {user.user_profile?.display_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-sm text-foreground truncate">
                                        {user.user_profile?.display_name}
                                      </p>
                                      <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                                        {user.user_profile?.role}
                                      </Badge>
                                    </div>
                                     <p className="text-xs text-muted-foreground capitalize">
                                       {user.status === 'never_logged_in' ? 'Never signed up' : 
                                        user.status === 'away' ? 'Away' : 'Offline'}
                                       {user.last_seen && user.status !== 'never_logged_in' && (
                                         <span className="ml-2">
                                           • Last seen {new Date(user.last_seen).toLocaleDateString('en-US', { 
                                             day: 'numeric', 
                                             month: 'short', 
                                             year: 'numeric' 
                                           })}
                                         </span>
                                       )}
                                     </p>
                                  </div>
                                  <Circle className={`h-3 w-3 fill-current ${getStatusColor(user.status)} opacity-70`} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Account Users - manage status */}
                      <div className="pt-4 border-t border-border">
                        <p className="text-muted-foreground text-sm mb-3 font-medium">Account Users</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {teamMembers.map((m) => (
                            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg glass-morphism border border-border">
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-muted text-foreground text-xs">
                                    {m.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={m.active ? 'default' : 'outline'} className="text-xs">
                                  {m.active ? 'Active' : 'Inactive'}
                                </Badge>
                                <Switch
                                  checked={!!m.active}
                                  onCheckedChange={(checked) => toggleActive.mutate({ id: m.id, is_active: checked })}
                                  aria-label={`Set ${m.name} ${m.active ? 'inactive' : 'active'}`}
                                />
                              </div>
                            </div>
                          ))}
                          {teamMembers.length === 0 && (
                            <p className="text-xs text-muted-foreground">No users found.</p>
                          )}
                        </div>
                      </div>

                      {/* Team Members Directory */}
                      <div className="pt-4 border-t border-border">
                        <p className="text-muted-foreground text-sm mb-3 font-medium">Team Members</p>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                          {teamMembers.map((m) => (
                            <div key={`dir-${m.id}`} className="flex items-center gap-3 p-3 rounded-lg glass-morphism border border-border">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-muted text-foreground text-xs">
                                  {m.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm text-foreground truncate">{m.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                              </div>
                              <div className="ml-auto">
                                <Badge variant="outline" className="text-xs">{m.role}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="messages" className="flex-1 overflow-y-auto p-4 mt-0">
                      {conversations.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-white/80 text-sm mb-3 font-medium">Active Conversations ({conversations.length})</p>
                          {conversations.map((conversation, index) => (
                            <motion.div
                              key={conversation.user_id || index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="glass-morphism rounded-xl p-4 hover:bg-accent/30 transition-all duration-300 cursor-pointer border border-border"
                              onClick={() => {
                                openConversation(conversation.user_id);
                                setMessageDialogOpen(true);
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={conversation.user_profile?.avatar_url} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm">
                                    {conversation.user_profile?.display_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-foreground truncate">
                                      {conversation.user_profile?.display_name || 'Unknown User'}
                                    </p>
                                    {conversation.unread_count > 0 && (
                                      <Badge className="bg-red-500 text-white text-xs">
                                        {conversation.unread_count}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {conversation.last_message?.content || 'No messages yet'}
                                  </p>
                                  {conversation.last_message?.created_at && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(conversation.last_message.created_at).toLocaleDateString('en-US', { 
                                        day: 'numeric', 
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  )}
                                </div>
                                
                                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 space-y-4">
                            <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold text-foreground">No Conversations Yet</h3>
                              <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
                              You haven't started any conversations yet. 
                            </p>
                          </div>
                          
                          <div className="glass-morphism rounded-lg p-4 border border-border max-w-sm mx-auto">
                            <p className="text-foreground text-sm mb-3 font-medium">💡 How to start a conversation:</p>
                            <p className="text-muted-foreground text-xs text-left">
                              1. Go to the <strong>Team</strong> tab above<br/>
                              2. Click on any team member's profile<br/>
                              3. Start messaging them directly
                            </p>
                          </div>
                          
                          <Button 
                            onClick={() => setMessageDialogOpen(true)}
                            className="bg-accent/30 hover:bg-accent/50 text-foreground border border-border"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Open Message Center
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Message Dialog */}
      <DirectMessageDialog 
        isOpen={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
      />
    </>
  );
};