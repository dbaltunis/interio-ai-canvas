import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCurrentUserProfile, useUpdateUserProfile } from '@/hooks/useUserProfile';
import { Users, MessageCircle, Zap, Circle, Send, X, Edit, Check } from 'lucide-react';
import { DirectMessageDialog } from './DirectMessageDialog';
import { cn } from '@/lib/utils';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { formatDisplayName, formatLastSeen, getInitials } from '@/utils/userDisplay';

interface TeamCollaborationCenterProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const TeamCollaborationCenter = ({ isOpen, onToggle }: TeamCollaborationCenterProps) => {
  const { user } = useAuth();
  const { activeUsers = [] } = useUserPresence();
  const { openConversation, totalUnreadCount = 0, conversations = [] } = useDirectMessages();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'team' | 'messages'>('team');
  const [messageInput, setMessageInput] = useState('');
  const [showAccountUsers, setShowAccountUsers] = useState(false);
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: currentUserProfile } = useCurrentUserProfile();
  const updateUserProfile = useUpdateUserProfile();
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
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

  // Initialize status message from user profile
  useEffect(() => {
    if (currentUserProfile?.status_message) {
      setStatusMessage(currentUserProfile.status_message);
    }
  }, [currentUserProfile?.status_message]);

  const handleStatusMessageSave = async () => {
    try {
      await updateUserProfile.mutateAsync({ status_message: statusMessage.trim() || null });
      setIsEditingStatus(false);
    } catch (error) {
      console.error('Failed to update status message:', error);
    }
  };

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

  return createPortal(
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
              className={cn("!fixed inset-y-0 right-0 w-96 z-[101] liquid-glass shadow-2xl overflow-hidden border-l border-border", messageDialogOpen ? "pointer-events-none" : "pointer-events-auto")}
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
                    {!messageDialogOpen && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggle}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent/30"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Current User Section */}
                  {currentUserProfile && (
                    <div className="mt-4 flex flex-col items-center">
                      <div className="relative">
                        <Avatar className="h-16 w-16 ring-2 ring-white/30">
                          <AvatarImage src={currentUserProfile.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-lg">
                            {getInitials(currentUserProfile.display_name || '')}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Online indicator */}
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -bottom-1 -right-1 h-5 w-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white/30"
                        />
                      </div>
                      
                      <div className="mt-2 text-center">
                        <p className="text-sm text-muted-foreground">
                          {currentUserProfile.display_name}
                        </p>
                        
                        {/* Editable Status Message */}
                        <div className="mt-1 flex items-center justify-center gap-2">
                          {isEditingStatus ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={statusMessage}
                                onChange={(e) => setStatusMessage(e.target.value)}
                                placeholder="How are you feeling?"
                                className="h-7 text-xs max-w-32"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleStatusMessageSave();
                                  } else if (e.key === 'Escape') {
                                    setIsEditingStatus(false);
                                    setStatusMessage(currentUserProfile?.status_message || '');
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleStatusMessageSave}
                                className="h-7 w-7 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsEditingStatus(true)}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 max-w-40 truncate"
                            >
                              {currentUserProfile.status_message || 'Add status...'}
                              <Edit className="h-3 w-3 shrink-0" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabs for Team & Messages */}
                <div className="flex-1 overflow-hidden">
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'team' | 'messages')} className="h-full flex flex-col">
                    <TabsList className="mx-4 mt-4 glass-morphism rounded-lg border p-1 grid grid-cols-2">
                      <TabsTrigger value="team" className="rounded-md text-foreground data-[state=active]:bg-accent data-[state=active]:text-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        Team ({totalUsers})
                      </TabsTrigger>
                      <TabsTrigger value="messages" className="rounded-md text-foreground data-[state=active]:bg-accent data-[state=active]:text-foreground">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Messages
                        {totalUnreadCount > 0 && (
                          <Badge className="ml-2 bg-red-500 text-white text-xs">
                            {totalUnreadCount}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    {/* Team Tab Content */}
                    <TabsContent value="team" className="flex-1 mt-0 overflow-hidden">
                      <div className="flex flex-col h-full">
                        <ScrollArea className="flex-1">
                      <div className="p-4 space-y-3">

                          {/* Online Users */}
                          {onlineUsers.length > 0 && (
                            <div>
                              <p className="text-muted-foreground text-sm mb-3 font-medium">Online Now</p>
                              {onlineUsers.map((user, index) => (
                                <motion.div
                                  key={user.user_id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="group relative mb-3"
                                >
                                  <div className="glass-morphism rounded-xl p-4 hover:bg-accent/30 transition-all duration-300 cursor-pointer border border-border shadow-sm hover:shadow-md"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedUserId(user.user_id);
                                          setActiveTab('messages');
                                          setMessageDialogOpen(true);
                                        }}>
                                    
                                    {/* Enhanced status indicator with glow effect */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getStatusBgColor(user.status)} rounded-l-xl shadow-lg`} />
                                    
                                    <div className="flex items-center gap-4">
                                      <div className="relative">
                                        <Avatar className="h-14 w-14 ring-2 ring-white/20 shadow-lg">
                                          <AvatarImage src={user.user_profile?.avatar_url} />
                                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold text-lg">
                                            {getInitials(user.user_profile?.display_name || '')}
                                          </AvatarFallback>
                                        </Avatar>
                                        
                                        {/* Enhanced animated status dot with glow */}
                                        <motion.div
                                          animate={{ scale: [1, 1.2, 1] }}
                                          transition={{ duration: 2, repeat: Infinity }}
                                          className={`absolute -bottom-1 -right-1 h-5 w-5 bg-gradient-to-r ${getStatusBgColor(user.status)} rounded-full border-2 border-white/30 shadow-lg`}
                                        />
                                      </div>
                                      
                                       <div className="flex-1 min-w-0">
                                         <div className="flex items-start justify-between gap-2 mb-2">
                                           <div className="flex-1 min-w-0">
                                             <p className="font-semibold text-foreground text-sm leading-tight truncate" title={user.user_profile?.display_name}>
                                               {formatDisplayName(user.user_profile?.display_name || '')}
                                             </p>
                                           </div>
                                           <Badge 
                                             variant="secondary" 
                                             className="text-xs bg-accent/40 text-foreground border border-border/50 px-2 py-1 shrink-0"
                                           >
                                             {user.user_profile?.role}
                                           </Badge>
                                         </div>
                                         
                                         {user.current_activity && (
                                           <p className="text-sm text-muted-foreground truncate mb-1 flex items-center gap-1">
                                             <span className="text-yellow-400 shrink-0">🎯</span>
                                             <span className="truncate">{user.current_activity}</span>
                                           </p>
                                         )}
                                         
                                         <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                                           <Circle className={`h-2 w-2 fill-current ${getStatusColor(user.status)} shrink-0`} />
                                           {user.status}
                                         </p>
                                       </div>
                                      
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-full h-12 w-12 p-0 shadow-md"
                                        >
                                          <MessageCircle className="h-5 w-5" />
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
           setSelectedUserId(user.user_id);
           setActiveTab('messages');
           setMessageDialogOpen(true);
         }}>

                                      <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.user_profile?.avatar_url} />
                                        <AvatarFallback className="bg-muted text-foreground text-sm">
                                          {getInitials(user.user_profile?.display_name || '')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="text-sm text-foreground truncate">
                                            {formatDisplayName(user.user_profile?.display_name || '')}
                                          </p>
                                          <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                                            {user.user_profile?.role}
                                          </Badge>
                                         </div>

                                          {user.user_profile?.status_message && (
                                            <p className="text-xs text-muted-foreground truncate mb-1">
                                              {user.user_profile.status_message}
                                            </p>
                                          )}

                                          <p className="text-xs text-muted-foreground capitalize">
                                            {user.status === 'never_logged_in' ? 'Never signed up' : 
                                             user.status === 'away' ? 'Away' : 'Offline'}
                                            {user.last_seen && user.status !== 'never_logged_in' && (
                                              <span className="ml-2">
                                                • {formatLastSeen(user.last_seen)}
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

                          {/* Account Users - manage status (collapsed by default) */}
                          <div className="pt-4 border-t border-border">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-muted-foreground text-sm font-medium">Manage users</p>
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground" onClick={() => setShowAccountUsers((s) => !s)}>
                                {showAccountUsers ? 'Hide' : 'Open'}
                              </Button>
                            </div>
                            {showAccountUsers && (
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {teamMembers.map((m) => (
                                  <div key={m.id} className="flex items-center justify-between p-3 rounded-lg glass-morphism border border-border">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={m.avatar_url} />
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
                            )}
                          </div>
                          </div>
                        </ScrollArea>
                      </div>
                    </TabsContent>

                    {/* Messages Tab Content */}
                    <TabsContent value="messages" className="flex-1 mt-0 overflow-hidden">
                      <div className="flex flex-col h-full">
                        <ScrollArea className="flex-1">
                          <div className="p-4">
                            {conversations.length > 0 ? (
                              <div className="space-y-3">
                                <p className="text-muted-foreground text-sm mb-4 font-medium flex items-center gap-2">
                                  <MessageCircle className="h-4 w-4" />
                                  Recent Conversations ({conversations.length})
                                </p>
                                {conversations.map((conversation, index) => (
                                  <motion.div
                                    key={conversation.user_id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-morphism rounded-xl p-4 hover:bg-accent/30 transition-all duration-300 cursor-pointer border border-border shadow-sm hover:shadow-md"
                                     onClick={() => {
                                       setSelectedUserId(conversation.user_id);
                                       setMessageDialogOpen(true);
                                     }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="relative">
                                        <Avatar className="h-12 w-12 ring-2 ring-white/20 shadow-md">
                                          <AvatarImage src={conversation.user_profile?.avatar_url} />
                                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                                            {getInitials(conversation.user_profile?.display_name || '')}
                                          </AvatarFallback>
                                        </Avatar>
                                        
                                        {/* Status indicator */}
                                        <Circle className={`absolute -bottom-1 -right-1 h-4 w-4 fill-current ${getStatusColor(conversation.user_profile?.status || 'offline')} border-2 border-white/30 rounded-full`} />
                                        
                                        {/* Enhanced unread count badge */}
                                        {conversation.unread_count > 0 && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg border-2 border-white"
                                            style={{
                                              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                            }}
                                          >
                                            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                                          </motion.div>
                                        )}
                                      </div>
                                      
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                          <p className="font-semibold text-foreground truncate">
                                            {formatDisplayName(conversation.user_profile?.display_name || '')}
                                          </p>
                                          <Badge 
                                            variant="secondary" 
                                            className="text-xs bg-accent/40 text-foreground border border-border/50 px-2 py-1"
                                          >
                                            {conversation.user_profile?.status || 'offline'}
                                          </Badge>
                                        </div>
                                        
                                        {conversation.last_message && (
                                          <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground truncate flex-1">
                                              {conversation.last_message.content.length > 40 
                                                ? `${conversation.last_message.content.substring(0, 40)}...` 
                                                : conversation.last_message.content
                                              }
                                            </p>
                                            <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                                              {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                                            </span>
                                          </div>
                                        )}
                                      </div>
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
                          </div>
                        </ScrollArea>
                      </div>
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
        selectedUserId={selectedUserId}
      />
    </>
  , document.body);
};