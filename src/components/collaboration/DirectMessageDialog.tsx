
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAuth } from '@/components/auth/AuthProvider';
import { useUploadFile } from '@/hooks/useFileStorage';
import { Send, Users, MessageCircle, Circle, Paperclip, Check, CheckCheck, X } from 'lucide-react';
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from 'date-fns';
import { formatDisplayName, getInitials } from '@/utils/userDisplay';
import { toast } from 'sonner';

interface DirectMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUserId?: string;
}

export const DirectMessageDialog = ({ open, onOpenChange, selectedUserId: propSelectedUserId }: DirectMessageDialogProps) => {
  const { user } = useAuth();
  const { activeUsers = [], isLoading: presenceLoading } = useUserPresence();
  const { data: teamMembers = [] } = useTeamMembers();
  const { 
    conversations = [], 
    messages = [], 
    activeConversation, 
    sendMessage, 
    sendingMessage,
    openConversation,
    messagesLoading 
  } = useDirectMessages();
  
  const [messageInput, setMessageInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const uploadFile = useUploadFile();

  // Filter out current user from active users
  const otherUsers = activeUsers.filter(u => u.user_id !== user?.id);
  const onlineUsers = otherUsers.filter(u => u.status === 'online');
  const awayUsers = otherUsers.filter(u => u.status === 'away' || u.status === 'busy');
  const offlineUsers = otherUsers.filter(u => u.status === 'offline' || u.status === 'never_logged_in');

  // Handle user selection and conversation opening
  const handleUserSelect = (userId: string) => {
    console.log('Selecting user:', userId);
    setSelectedUserId(userId);
    openConversation(userId);
    // Force refetch messages for the selected conversation
    setTimeout(() => {
      console.log('Opened conversation for:', userId);
    }, 100);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation) return;
    
    sendMessage(activeConversation, messageInput.trim());
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    try {
      const result = await uploadFile.mutateAsync({
        file,
        projectId: activeConversation,
        bucketName: 'email-attachments'
      });
      
      // Send the file as a message
      const fileMessage = `📎 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      sendMessage(activeConversation, fileMessage);
      
      toast.success('File uploaded and sent!');
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('Failed to upload file');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'online';
      case 'away': return 'away';
      case 'busy': return 'busy';
      default: return 'offline';
    }
  };

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const formatDateDivider = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Group messages by date
  const groupMessagesByDate = (messages: any[]) => {
    const groups: { date: Date; messages: any[] }[] = [];
    
    messages.forEach((message) => {
      const messageDate = new Date(message.created_at);
      const existingGroup = groups.find(g => isSameDay(g.date, messageDate));
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: messageDate, messages: [message] });
      }
    });
    
    return groups;
  };

  // Get active user data for current conversation
  // Check presence data first, then conversations, then team members
  const rawUserData = activeConversation ? 
    activeUsers.find(u => u.user_id === activeConversation) ||
    conversations.find(c => c.user_id === activeConversation) ||
    teamMembers.find(m => m.id === activeConversation) : null;
  
  // Convert to consistent format with user_profile
  let displayUserData: { user_id: string; status: string; user_profile: { display_name: string; avatar_url?: string; role?: string } } | null = null;
  
  if (rawUserData) {
    if ('user_profile' in rawUserData) {
      // Already has user_profile (UserPresence or Conversation)
      displayUserData = rawUserData as { user_id: string; status: string; user_profile: { display_name: string; avatar_url?: string; role?: string } };
    } else {
      // TeamMember - convert to user_profile format
      const teamMember = rawUserData as { id: string; name: string; avatar_url?: string; role?: string };
      displayUserData = {
        user_id: teamMember.id,
        status: 'offline',
        user_profile: {
          display_name: teamMember.name,
          avatar_url: teamMember.avatar_url,
          role: teamMember.role
        }
      };
    }
  }

  // Auto-scroll to bottom when messages change or conversation opens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  // Also scroll to bottom when sending a message completes
  useEffect(() => {
    if (!sendingMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sendingMessage]);

  // Reset selected user when dialog closes and handle prop changes
  useEffect(() => {
    if (!open) {
      setSelectedUserId(null);
    } else if (propSelectedUserId && propSelectedUserId !== selectedUserId) {
      setSelectedUserId(propSelectedUserId);
      openConversation(propSelectedUserId);
    }
  }, [open, propSelectedUserId, selectedUserId, openConversation]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col overflow-hidden rounded-2xl">
        <div className="flex h-full min-h-0">
          {/* Left Sidebar - User List */}
          <div className="w-80 border-r border-border/50 flex flex-col bg-muted/20">
            <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-lg">Chats</h2>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {/* Online Users */}
                {onlineUsers.length > 0 && (
                  <div className="mb-1">
                    {onlineUsers.map((user) => {
                      const isActive = activeConversation === user.user_id;
                      const conversation = conversations.find(c => c.user_id === user.user_id);
                      
                      return (
                        <button
                          key={user.user_id}
                          className={`w-full p-3 rounded-xl hover:bg-accent/80 transition-all duration-200 mb-1 ${
                            isActive ? 'bg-accent' : ''
                          }`}
                          onClick={() => handleUserSelect(user.user_id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={user.user_profile?.avatar_url} />
                                <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
                                  {getInitials(user.user_profile?.display_name || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold truncate text-foreground text-sm">
                                  {formatDisplayName(user.user_profile?.display_name || '')}
                                </p>
                                {conversation && conversation.unread_count > 0 && (
                                  <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                                    {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.current_activity || user.user_profile?.role || 'Available'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Away/Busy Users */}
                {awayUsers.length > 0 && (
                  <div className="mb-1">
                    {awayUsers.map((user) => {
                      const isActive = activeConversation === user.user_id;
                      const conversation = conversations.find(c => c.user_id === user.user_id);
                      
                      return (
                        <button
                          key={user.user_id}
                          className={`w-full p-3 rounded-xl hover:bg-accent/80 transition-all duration-200 mb-1 opacity-70 ${
                            isActive ? 'bg-accent' : ''
                          }`}
                          onClick={() => handleUserSelect(user.user_id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={user.user_profile?.avatar_url} />
                                <AvatarFallback className="text-sm bg-muted text-muted-foreground">
                                  {getInitials(user.user_profile?.display_name || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold truncate text-foreground text-sm">
                                  {formatDisplayName(user.user_profile?.display_name || '')}
                                </p>
                                {conversation && conversation.unread_count > 0 && (
                                  <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                                    {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate capitalize">
                                {user.status}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Offline Users */}
                {offlineUsers.length > 0 && (
                  <div className="mb-1">
                    {offlineUsers.map((user) => {
                      const isActive = activeConversation === user.user_id;
                      const conversation = conversations.find(c => c.user_id === user.user_id);
                      
                      return (
                        <button
                          key={user.user_id}
                          className={`w-full p-3 rounded-xl hover:bg-accent/80 transition-all duration-200 mb-1 opacity-50 ${
                            isActive ? 'bg-accent' : ''
                          }`}
                          onClick={() => handleUserSelect(user.user_id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12 grayscale">
                                <AvatarImage src={user.user_profile?.avatar_url} />
                                <AvatarFallback className="text-sm bg-muted text-muted-foreground">
                                  {getInitials(user.user_profile?.display_name || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold truncate text-foreground text-sm">
                                  {formatDisplayName(user.user_profile?.display_name || '')}
                                </p>
                                {conversation && conversation.unread_count > 0 && (
                                  <div className="bg-muted text-muted-foreground text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                                    {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.last_seen 
                                  ? `Last seen ${formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}`
                                  : 'Offline'
                                }
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Empty State */}
                {!presenceLoading && otherUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No team members</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Chat Area */}
          <div className="flex-1 flex flex-col bg-background">
            {activeConversation && displayUserData ? (
              <>
                {/* Chat Header - WhatsApp Style */}
                <div className="px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={displayUserData.user_profile?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(displayUserData.user_profile?.display_name || '')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {formatDisplayName(displayUserData.user_profile?.display_name || '')}
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize">
                          {getStatusText(('status' in displayUserData ? displayUserData.status : null) || 'offline')}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onOpenChange(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages - WhatsApp Style */}
                <div className="flex-1 overflow-hidden bg-muted/10" style={{ 
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(var(--muted)/0.03) 10px, hsl(var(--muted)/0.03) 20px)`
                }}>
                  <ScrollArea className="h-full">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground text-sm">Loading messages...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="bg-primary/10 p-6 rounded-full mb-4">
                          <MessageCircle className="h-12 w-12 text-primary" />
                        </div>
                        <p className="text-base font-medium text-foreground mb-2">No messages yet</p>
                        <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-1">
                        {groupMessagesByDate(messages).map((group, groupIndex) => (
                          <div key={groupIndex}>
                            {/* Date Divider */}
                            <div className="flex items-center justify-center my-4">
                              <div className="bg-muted/80 px-3 py-1 rounded-full">
                                <p className="text-xs font-medium text-muted-foreground">
                                  {formatDateDivider(group.date)}
                                </p>
                              </div>
                            </div>
                            
                            {/* Messages */}
                            {group.messages.map((message) => {
                              const isOwn = message.sender_id === user?.id;
                              const messageTime = new Date(message.created_at);
                              
                              return (
                                <div
                                  key={message.id}
                                  className={`flex items-end gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                  {!isOwn && (
                                    <Avatar className="h-8 w-8 shrink-0">
                                      <AvatarImage src={displayUserData.user_profile?.avatar_url} />
                                      <AvatarFallback className="text-xs bg-muted">
                                        {getInitials(displayUserData.user_profile?.display_name || '')}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                  
                                  <div className={`group max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className={`px-3 py-2 rounded-2xl shadow-sm ${
                                      isOwn
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-background border border-border/50 text-foreground rounded-bl-sm'
                                    }`}>
                                      <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                                        {message.content}
                                      </p>
                                      <div className="flex items-center justify-end gap-1 mt-1">
                                        <p className={`text-[10px] ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                          {format(messageTime, 'h:mm a')}
                                        </p>
                                        {isOwn && (
                                          <CheckCheck className={`h-3 w-3 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`} />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Message Input - WhatsApp Style */}
                <div className="p-3 border-t border-border/50 bg-background/95 backdrop-blur-sm">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                  />
                  <div className="flex gap-2 items-end">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-full hover:bg-primary/10"
                      onClick={handleFileUpload}
                      disabled={uploadFile.isPending}
                    >
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sendingMessage}
                        className="rounded-full bg-muted/50 border-0 pr-12 py-5 focus-visible:ring-1"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendingMessage}
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-full"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/10">
                <div className="text-center p-8">
                  <div className="bg-primary/10 p-8 rounded-full mx-auto w-fit mb-4">
                    <MessageCircle className="h-16 w-16 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-2">Select a chat</p>
                  <p className="text-sm text-muted-foreground">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
