import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAuth } from '@/components/auth/AuthProvider';
import { useHasPermission } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
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

  // Permission check using centralized hook
  const canSendTeamMessages = useHasPermission('send_team_messages') !== false;

  const handleSendMessage = () => {
    if (!canSendTeamMessages) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to send team messages.",
        variant: "destructive",
      });
      return;
    }

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
      case 'offline': return 'bg-red-500';
      default: return 'bg-red-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      case 'never_logged_in': return 'Never logged in';
      default: return 'Offline';
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
      <DialogContent className="max-w-md w-[95vw] h-[80vh] max-h-[600px] p-0 flex flex-col overflow-hidden rounded-xl gap-0 border border-border shadow-xl [&>button]:hidden">
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
            <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <Paperclip className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-primary">Drop files to attach</p>
              </div>
            </div>
          )}

          {activeConversation && displayUserData ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3">
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 ring-2 ring-background">
                    <AvatarImage src={displayUserData.user_profile?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {getInitials(displayUserData.user_profile?.display_name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${getStatusColor(displayUserData.status || 'offline')}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {formatDisplayName(displayUserData.user_profile?.display_name || '')}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(displayUserData.status || 'offline')}`} />
                    <p className="text-xs text-muted-foreground">
                      {getStatusText(displayUserData.status || 'offline')}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 bg-muted/20">
                {messagesLoading ? (
                  <div className="flex flex-col gap-3 p-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex gap-2 max-w-[70%]">
                          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                          <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-32' : 'w-48'} rounded-lg`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="bg-primary/10 p-3 rounded-full mb-3">
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-0.5">No messages yet</p>
                    <p className="text-xs text-muted-foreground">Send a message to start chatting</p>
                  </div>
                ) : (
                  <div className="px-4 py-3">
                    {groupMessagesByDate(messages).map((group, groupIndex) => (
                      <div key={groupIndex}>
                        {/* Date Divider */}
                        <div className="flex items-center justify-center my-4">
                          <span className="bg-background text-muted-foreground text-[10px] font-medium px-3 py-1 rounded-full shadow-sm border border-border/50">
                            {formatDateDivider(group.date)}
                          </span>
                        </div>
                        
                        {/* Messages */}
                        {group.messages.map((message, msgIndex) => {
                          const isOwn = message.sender_id === user?.id;
                          const messageTime = new Date(message.created_at);
                          const isLastInGroup = msgIndex === group.messages.length - 1 || group.messages[msgIndex + 1]?.sender_id !== message.sender_id;
                          
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isLastInGroup ? 'mb-3' : 'mb-0.5'}`}
                            >
                              <div className={`max-w-[80%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                <div className={`px-3.5 py-2 ${
                                  isOwn
                                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                                    : 'bg-card text-foreground rounded-2xl rounded-bl-sm shadow-sm border border-border/60'
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
                                </div>
                                
                                {/* Time & Read status - Only on last message in group */}
                                {isLastInGroup && (
                                  <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <span className="text-[10px] text-muted-foreground/70">
                                      {format(messageTime, 'h:mm a')}
                                    </span>
                                    {isOwn && (
                                      <CheckCheck className="h-3 w-3 text-primary/60" />
                                    )}
                                  </div>
                                )}
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

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="px-4 py-2 border-t border-border bg-card/80">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Uploading</span>
                    <Progress value={uploadProgress} className="flex-1 h-1.5" />
                    <span className="text-[10px] font-medium text-primary">{Math.round(uploadProgress)}%</span>
                  </div>
                </div>
              )}

              {/* File Previews */}
              {selectedFiles.length > 0 && (
                <div className="px-4 py-2 border-t border-border bg-card/80">
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
              <div className="p-3 border-t border-border bg-card/80 backdrop-blur-sm">
                <div className="flex gap-2 items-center bg-muted/50 rounded-full px-1 py-1">
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
                    className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/60"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sendingMessage || (!canSendTeamMessages)}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1">
                    <Input
                      placeholder={!canSendTeamMessages ? "You don't have permission to send messages" : "Type a message..."}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="h-8 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                      disabled={sendingMessage || (!canSendTeamMessages)}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={(!messageInput.trim() && selectedFiles.length === 0) || sendingMessage || (!canSendTeamMessages)}
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/20">
              <div className="text-center p-6">
                <div className="bg-primary/10 p-4 rounded-full mx-auto w-fit mb-3">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">No conversation selected</p>
                <p className="text-xs text-muted-foreground">Select a user to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
