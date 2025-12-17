import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAuth } from '@/components/auth/AuthProvider';
import { Send, MessageCircle, CheckCheck, Paperclip, X } from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { formatDisplayName, getInitials } from '@/utils/userDisplay';
import { MessageAttachment, AttachmentPreview } from './MessageAttachment';

interface DirectMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUserId?: string;
}

interface FileWithPreview {
  file: File;
  url: string;
}

export const DirectMessageDialog = ({ open, onOpenChange, selectedUserId: propSelectedUserId }: DirectMessageDialogProps) => {
  const { user } = useAuth();
  const { activeUsers = [] } = useUserPresence();
  const { data: teamMembers = [] } = useTeamMembers();
  const { 
    messages = [], 
    activeConversation, 
    sendMessage, 
    sendingMessage,
    uploadProgress,
    openConversation,
    messagesLoading 
  } = useDirectMessages();
  
  const [messageInput, setMessageInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!messageInput.trim() && selectedFiles.length === 0) return;
    if (!activeConversation) return;
    
    const files = selectedFiles.map(f => f.file);
    sendMessage(activeConversation, messageInput.trim(), files.length > 0 ? files : undefined);
    setMessageInput('');
    
    // Clean up file previews
    selectedFiles.forEach(f => URL.revokeObjectURL(f.url));
    setSelectedFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    addFiles(Array.from(files));
    e.target.value = '';
  };

  const addFiles = (files: File[]) => {
    const newFiles = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the actual drop zone
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  }, []);

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
  const rawUserData = activeConversation ? 
    activeUsers.find(u => u.user_id === activeConversation) ||
    teamMembers.find(m => m.id === activeConversation) : null;
  
  // Convert to consistent format with user_profile
  let displayUserData: { user_id: string; status: string; user_profile: { display_name: string; avatar_url?: string; role?: string } } | null = null;
  
  if (rawUserData) {
    if ('user_profile' in rawUserData) {
      displayUserData = rawUserData as { user_id: string; status: string; user_profile: { display_name: string; avatar_url?: string; role?: string } };
    } else {
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  useEffect(() => {
    if (!sendingMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sendingMessage]);

  // Handle prop changes for selected user
  useEffect(() => {
    if (open && propSelectedUserId) {
      openConversation(propSelectedUserId);
    }
  }, [open, propSelectedUserId, openConversation]);

  // Clean up file URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(f => URL.revokeObjectURL(f.url));
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-full h-[98vh] p-0 flex flex-col overflow-hidden rounded-xl sm:rounded-2xl gap-0">
        <div 
          ref={dropZoneRef}
          className="flex flex-col h-full bg-background relative"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Paperclip className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-lg font-medium text-primary">Drop files to attach</p>
              </div>
            </div>
          )}

          {activeConversation && displayUserData ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-border/30 bg-background/50 backdrop-blur-sm">
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
                    <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                      <span className={`h-2 w-2 rounded-full ${getStatusColor(('status' in displayUserData ? displayUserData.status : null) || 'offline')}`} />
                      {getStatusText(('status' in displayUserData ? displayUserData.status : null) || 'offline')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
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
                                    {message.content && (
                                      <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                                        {message.content}
                                      </p>
                                    )}
                                    
                                    {/* Attachments */}
                                    {message.attachments && message.attachments.length > 0 && (
                                      <div className={message.content ? 'mt-2' : ''}>
                                        {message.attachments.map((att: any) => (
                                          <MessageAttachment 
                                            key={att.id} 
                                            attachment={att} 
                                            isOwn={isOwn}
                                          />
                                        ))}
                                      </div>
                                    )}
                                    
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

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="px-4 py-2 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Uploading...</span>
                    <Progress value={uploadProgress} className="flex-1 h-1" />
                    <span className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</span>
                  </div>
                </div>
              )}

              {/* File Previews */}
              {selectedFiles.length > 0 && (
                <div className="px-4 py-2 border-t border-border/30 bg-muted/30">
                  <div className="flex gap-2 flex-wrap">
                    {selectedFiles.map((fileData, index) => (
                      <AttachmentPreview
                        key={index}
                        file={fileData.file}
                        url={fileData.url}
                        onRemove={() => removeFile(index)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-3 border-t border-border/30 bg-background/95 backdrop-blur-sm">
                <div className="flex gap-2 items-end">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                  
                  {/* Attachment button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sendingMessage}
                  >
                    <Paperclip className="h-5 w-5" />
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
                    disabled={(!messageInput.trim() && selectedFiles.length === 0) || sendingMessage}
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
                <p className="text-lg font-semibold text-foreground mb-2">No conversation selected</p>
                <p className="text-sm text-muted-foreground">Select a user to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
