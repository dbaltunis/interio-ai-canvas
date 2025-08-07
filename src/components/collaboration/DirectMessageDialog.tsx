import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { Send, Circle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DirectMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectMessageDialog = ({ isOpen, onClose }: DirectMessageDialogProps) => {
  const { conversations = [], messages = [], activeConversation, sendMessage, sendingMessage, closeConversation } = useDirectMessages();
  const { activeUsers = [] } = useUserPresence();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeUserPresence = activeConversation ? 
    activeUsers.find(u => u.user_id === activeConversation) : null;
  
  const activeConversationData = activeConversation ? 
    conversations.find(c => c.user_id === activeConversation) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleClose = () => {
    closeConversation();
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-border">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="text-lg">Messages</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="h-[calc(600px-73px)]">
              <div className="p-2">
                {conversations.map((conversation) => {
                  const user = conversation.user_profile;
                  const isActive = activeConversation === conversation.user_id;
                  
                  return (
                    <Button
                      key={conversation.user_id}
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start p-3 h-auto mb-1"
                      onClick={() => {
                        // This would be handled by useDirectMessages hook
                        console.log('Opening conversation with', conversation.user_id);
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {user.display_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <Circle className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current ${getStatusColor(user.status)}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{user.display_name}</p>
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                          
                          {conversation.last_message && (
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.last_message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                  );
                })}

                {conversations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No conversations yet</p>
                    <p className="text-sm">Start chatting with your team members</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation && (activeUserPresence || activeConversationData) ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={
                          activeUserPresence?.user_profile?.avatar_url || 
                          activeConversationData?.user_profile?.avatar_url
                        } />
                        <AvatarFallback>
                          {(activeUserPresence?.user_profile?.display_name || 
                            activeConversationData?.user_profile?.display_name)?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <Circle className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current ${getStatusColor(
                        activeUserPresence?.status || 
                        activeConversationData?.user_profile?.status || 
                        'offline'
                      )}`} />
                    </div>
                    
                    <div>
                      <h3 className="font-medium">
                        {activeUserPresence?.user_profile?.display_name || 
                         activeConversationData?.user_profile?.display_name}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {activeUserPresence?.status || activeConversationData?.user_profile?.status || 'offline'}
                        {activeUserPresence?.current_activity && ` • ${activeUserPresence.current_activity}`}
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === activeConversation ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender_id === activeConversation
                                ? 'bg-muted text-foreground'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_id === activeConversation 
                                ? 'text-muted-foreground' 
                                : 'text-primary-foreground/70'
                            }`}>
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sendingMessage}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendingMessage}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p>Select a conversation to start messaging</p>
                  <p className="text-sm">Choose a team member from the left panel</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};