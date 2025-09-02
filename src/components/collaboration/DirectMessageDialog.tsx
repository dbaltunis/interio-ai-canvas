
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useAuth } from '@/components/auth/AuthProvider';
import { useUploadFile } from '@/hooks/useFileStorage';
import { Send, Users, MessageCircle, Circle, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  // Get active user data for current conversation
  const activeUserData = activeConversation ? 
    activeUsers.find(u => u.user_id === activeConversation) ||
    conversations.find(c => c.user_id === activeConversation) : null;

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
      <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col">
        <div className="flex h-full min-h-0">
          {/* Left Sidebar - User List */}
          <div className="w-1/3 border-r border-border flex flex-col">
            <DialogHeader className="p-4 border-b border-border">
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select a team member to start messaging
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 p-4">
              {/* Online Users */}
              {onlineUsers.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Online ({onlineUsers.length})
                    </h3>
                  </div>
                  
                  {onlineUsers.map((user) => {
                    const isActive = activeConversation === user.user_id;
                    const conversation = conversations.find(c => c.user_id === user.user_id);
                    
                    return (
                      <Button
                        key={user.user_id}
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start p-4 h-auto mb-2 rounded-lg hover:bg-accent/50 transition-all duration-200"
                        onClick={() => handleUserSelect(user.user_id)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.user_profile?.avatar_url} />
                              <AvatarFallback className="text-sm">
                                {getInitials(user.user_profile?.display_name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <Circle className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current ${getStatusColor(user.status)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium truncate text-foreground">
                                {formatDisplayName(user.user_profile?.display_name || '')}
                              </p>
                              {conversation && conversation.unread_count > 0 && (
                                <Badge variant="destructive" className="text-xs h-5 px-2">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {user.user_profile?.role}
                              </Badge>
                              {user.current_activity && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.current_activity}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Away/Busy Users */}
              {awayUsers.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Circle className="h-2 w-2 fill-yellow-500 text-yellow-500" />
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Away/Busy ({awayUsers.length})
                    </h3>
                  </div>
                  
                  {awayUsers.map((user) => {
                    const isActive = activeConversation === user.user_id;
                    const conversation = conversations.find(c => c.user_id === user.user_id);
                    
                    return (
                      <Button
                        key={user.user_id}
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start p-4 h-auto mb-2 rounded-lg hover:bg-accent/50 transition-all duration-200 opacity-75"
                        onClick={() => handleUserSelect(user.user_id)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.user_profile?.avatar_url} />
                              <AvatarFallback className="text-sm">
                                {getInitials(user.user_profile?.display_name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <Circle className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current ${getStatusColor(user.status)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium truncate text-foreground">
                                {formatDisplayName(user.user_profile?.display_name || '')}
                              </p>
                              {conversation && conversation.unread_count > 0 && (
                                <Badge variant="destructive" className="text-xs h-5 px-2">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {user.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Loading State */}
              {presenceLoading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading team members...</p>
                </div>
              )}

              {/* Offline Users */}
              {offlineUsers.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Offline ({offlineUsers.length})
                    </h3>
                  </div>
                  
                  {offlineUsers.map((user) => {
                    const isActive = activeConversation === user.user_id;
                    const conversation = conversations.find(c => c.user_id === user.user_id);
                    
                    return (
                      <Button
                        key={user.user_id}
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start p-4 h-auto mb-2 rounded-lg hover:bg-accent/50 transition-all duration-200 opacity-60"
                        onClick={() => handleUserSelect(user.user_id)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.user_profile?.avatar_url} />
                              <AvatarFallback className="text-sm">
                                {getInitials(user.user_profile?.display_name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <Circle className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current ${getStatusColor(user.status)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium truncate text-foreground">
                                {formatDisplayName(user.user_profile?.display_name || '')}
                              </p>
                              {conversation && conversation.unread_count > 0 && (
                                <Badge variant="destructive" className="text-xs h-5 px-2">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {user.status}
                              </Badge>
                              {user.last_seen && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!presenceLoading && otherUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No other team members</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Side - Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation && activeUserData ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activeUserData.user_profile?.avatar_url} />
                      <AvatarFallback>
                        {getInitials(activeUserData.user_profile?.display_name || '')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {formatDisplayName(activeUserData.user_profile?.display_name || '')}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Circle className={`h-2 w-2 fill-current ${getStatusColor(('status' in activeUserData ? activeUserData.status : null) || 'offline')}`} />
                        <p className="text-sm text-muted-foreground capitalize">
                          {('status' in activeUserData ? activeUserData.status : null) || 'offline'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 min-h-0 p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center min-h-[200px]">
                      <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-foreground mb-2">Start the conversation!</p>
                      <p className="text-muted-foreground">Send a message to begin chatting</p>
                    </div>
                  ) : (
                    <div className="space-y-4 pb-4">
                      {messages.map((message, index) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] p-3 rounded-2xl ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}>
                            <p className="text-sm break-words">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input - Fixed at bottom */}
                <div className="p-4 border-t border-border bg-background/95 backdrop-blur-sm">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                  />
                  <div className="flex gap-2 items-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="shrink-0 h-10"
                      onClick={handleFileUpload}
                      disabled={uploadFile.isPending}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder={`Message ${activeUserData ? formatDisplayName(activeUserData.user_profile?.display_name || '') : ''}...`}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sendingMessage}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendingMessage}
                      size="sm"
                      className="shrink-0 h-10"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">Select a conversation</p>
                  <p className="text-muted-foreground">Choose someone to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
