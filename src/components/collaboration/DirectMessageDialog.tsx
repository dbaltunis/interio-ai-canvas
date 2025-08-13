import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useToast } from '@/hooks/use-toast';
import { Send, Circle, X, Paperclip, Image, File, Download, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';

interface DirectMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectMessageDialog = ({ isOpen, onClose }: DirectMessageDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { conversations = [], messages = [], activeConversation, sendMessage, sendingMessage, closeConversation, openConversation } = useDirectMessages();
  const { activeUsers = [] } = useUserPresence();
  const [messageInput, setMessageInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeConversation || !user) return;

    setUploading(true);
    
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `messages/${user.id}/${fileName}`;

      console.log('Uploading file:', fileName, 'to path:', filePath);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-documents')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Create file message content
      const fileMessage = `📎 **${file.name}**\n\n[View File](${publicUrl})`;
      
      // Use the existing sendMessage function instead of manual local state
      sendMessage(activeConversation, fileMessage);

      toast({
        title: "File uploaded",
        description: `${file.name} has been shared successfully.`,
      });

    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed", 
        description: error.message || "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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

  const renderMessageContent = (content: string) => {
    // Check if message contains file attachment
    const fileRegex = /📎 \*\*(.*?)\*\*\n\n\[View File\]\((.*?)\)/;
    const match = content.match(fileRegex);
    
    if (match) {
      const [, fileName, fileUrl] = match;
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
      
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {isImage ? <Image className="h-4 w-4" /> : <File className="h-4 w-4" />}
            <span className="font-medium">{fileName}</span>
          </div>
          
          {isImage ? (
            <div className="rounded-lg overflow-hidden border max-w-xs">
              <img 
                src={fileUrl} 
                alt={fileName}
                className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(fileUrl, '_blank')}
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(fileUrl, '_blank')}
                className="h-8 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = fileUrl;
                  link.download = fileName;
                  link.click();
                }}
                className="h-8 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          )}
        </div>
      );
    }
    
    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="z-[200] max-w-5xl h-[700px] p-0 overflow-hidden">
        <div className="flex h-full bg-background">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="*/*"
          />
          {/* Conversations List */}
          <div className="w-80 border-r border-border bg-muted/30">
            <DialogHeader className="p-4 border-b bg-background/50">
              <DialogTitle className="text-lg font-semibold">Messages</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="h-[calc(700px-73px)]">
              <div className="p-3">
                {conversations.map((conversation) => {
                  const user = conversation.user_profile;
                  const isActive = activeConversation === conversation.user_id;
                  
                  return (
                     <Button
                       key={conversation.user_id}
                       variant={isActive ? "secondary" : "ghost"}
                       className="w-full justify-start p-4 h-auto mb-2 rounded-lg hover:bg-accent/50 transition-all duration-200"
                       onClick={() => {
                         openConversation(conversation.user_id);
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
                 <ScrollArea className="flex-1 p-4 bg-background">
                   <div className="space-y-4">
                     {messages.length === 0 ? (
                       <div className="text-center py-12 text-muted-foreground">
                         <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                           <Send className="h-8 w-8" />
                         </div>
                         <p className="text-lg font-medium">No messages yet</p>
                         <p className="text-sm">Start the conversation!</p>
                       </div>
                     ) : (
                       messages.map((message) => (
                         <div
                           key={message.id}
                           className={`flex ${message.sender_id === activeConversation ? 'justify-start' : 'justify-end'} animate-fade-in`}
                         >
                           <div className="flex items-start gap-2 max-w-[75%]">
                             {message.sender_id === activeConversation && (
                               <Avatar className="h-8 w-8 mt-1">
                                 <AvatarImage src={
                                   activeUserPresence?.user_profile?.avatar_url || 
                                   activeConversationData?.user_profile?.avatar_url
                                 } />
                                 <AvatarFallback className="text-xs">
                                   {(activeUserPresence?.user_profile?.display_name || 
                                     activeConversationData?.user_profile?.display_name)?.charAt(0) || 'U'}
                                 </AvatarFallback>
                               </Avatar>
                             )}
                             
                             <div
                               className={`rounded-2xl px-4 py-3 shadow-sm ${
                                 message.sender_id === activeConversation
                                   ? 'bg-muted text-foreground rounded-tl-md'
                                   : 'bg-primary text-primary-foreground rounded-tr-md'
                               }`}
                             >
                               {renderMessageContent(message.content)}
                               <p className={`text-xs mt-2 ${
                                 message.sender_id === activeConversation 
                                   ? 'text-muted-foreground' 
                                   : 'text-primary-foreground/70'
                               }`}>
                                 {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                               </p>
                             </div>
                           </div>
                         </div>
                       ))
                     )}
                     <div ref={messagesEndRef} />
                   </div>
                 </ScrollArea>

                 {/* Enhanced Message Input */}
                 <div className="p-4 border-t bg-background/50">
                   <div className="flex items-end gap-3">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => fileInputRef.current?.click()}
                       disabled={uploading || sendingMessage}
                       className="h-10 w-10 p-0 shrink-0"
                     >
                       {uploading ? (
                         <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                       ) : (
                         <Paperclip className="h-4 w-4" />
                       )}
                     </Button>
                     
                     <div className="flex-1 min-w-0">
                       <Input
                         placeholder="Type a message..."
                         value={messageInput}
                         onChange={(e) => setMessageInput(e.target.value)}
                         onKeyPress={handleKeyPress}
                         disabled={sendingMessage || uploading}
                         className="resize-none border-2 focus:border-primary/50 rounded-xl"
                       />
                     </div>
                     
                     <Button
                       onClick={handleSendMessage}
                       disabled={!messageInput.trim() || sendingMessage || uploading}
                       size="sm"
                       className="h-10 px-4 rounded-xl"
                     >
                       {sendingMessage ? (
                         <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                       ) : (
                         <Send className="h-4 w-4" />
                       )}
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