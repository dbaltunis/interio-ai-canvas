import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, Phone, ExternalLink, Send, Paperclip, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { UnifiedMessage, useUnifiedCommunications } from "@/hooks/useUnifiedCommunications";
import { WhatsAppStatusIcon } from "./WhatsAppStatusIcon";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSendWhatsApp } from "@/hooks/useSendWhatsApp";
import { useQueryClient } from "@tanstack/react-query";

interface MessagePreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: UnifiedMessage | null;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  channelFilter?: 'all' | 'email' | 'whatsapp';
  onComposeWhatsApp?: (clientId?: string) => void;
  onComposeEmail?: (clientId?: string) => void;
}

export const MessagePreviewDrawer = ({ 
  open, 
  onOpenChange, 
  message,
  clientId: propClientId,
  clientName: propClientName,
  clientPhone: propClientPhone,
  channelFilter = 'all',
  onComposeWhatsApp,
  onComposeEmail
}: MessagePreviewDrawerProps) => {
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState("");
  const [selectedEmailIndex, setSelectedEmailIndex] = useState(0);
  const sendWhatsApp = useSendWhatsApp();
  const queryClient = useQueryClient();

  // Use prop clientId or fall back to message's clientId
  const clientId = propClientId || message?.clientId || undefined;
  const { data: allMessages, refetch } = useUnifiedCommunications(clientId);
  
  // Local optimistic messages for instant UI feedback
  const [optimisticMessages, setOptimisticMessages] = useState<UnifiedMessage[]>([]);

  // Combine real messages with optimistic messages
  const combinedMessages = [...(allMessages || []), ...optimisticMessages];
  
  // Filter messages by channel if specified
  const filteredMessages = combinedMessages.filter(msg => {
    if (channelFilter === 'all') return true;
    return msg.channel === channelFilter;
  });

  // Reset selected email index when drawer opens or messages change
  useEffect(() => {
    setSelectedEmailIndex(0);
  }, [open, clientId]);

  // Auto-scroll to bottom when drawer opens or messages change (for WhatsApp)
  useEffect(() => {
    if (open && channelFilter === 'whatsapp' && scrollAreaRef.current) {
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [open, filteredMessages?.length, channelFilter]);

  // Get client info from first message if no message prop provided
  const clientInfo = message || filteredMessages?.[0];
  const displayName = propClientName || clientInfo?.clientName || 'Unknown';
  const displayPhone = propClientPhone || clientInfo?.recipientPhone;

  if (!clientId) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/jobs/${projectId}`);
    onOpenChange(false);
  };

  const handleCall = () => {
    if (displayPhone) {
      window.open(`tel:${displayPhone}`, '_self');
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !clientId) return;
    
    const messageContent = messageText.trim();
    
    // For WhatsApp channel, send directly
    if (channelFilter === 'whatsapp' && displayPhone) {
      const optimisticMsg: UnifiedMessage = {
        id: `optimistic-${Date.now()}`,
        channel: 'whatsapp',
        clientId: clientId,
        clientName: displayName,
        subject: null,
        preview: messageContent,
        fullContent: messageContent,
        sentAt: new Date().toISOString(),
        status: 'sending',
        recipientEmail: null,
        recipientPhone: displayPhone,
        projectId: null,
        projectName: null,
      };
      
      setOptimisticMessages(prev => [...prev, optimisticMsg]);
      setMessageText("");
      
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 50);
      
      try {
        await sendWhatsApp.mutateAsync({
          to: displayPhone,
          message: messageContent,
          clientId: clientId,
        });
        
        await queryClient.invalidateQueries({ queryKey: ['unified-communications'] });
        await queryClient.invalidateQueries({ queryKey: ['client-whatsapp-messages'] });
        await queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
        await refetch();
        setOptimisticMessages([]);
      } catch (error) {
        console.error('Failed to send WhatsApp:', error);
        setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      }
      return;
    }
    
    if (channelFilter === 'whatsapp' && onComposeWhatsApp) {
      onComposeWhatsApp(clientId);
    } else if (channelFilter === 'email' && onComposeEmail) {
      onComposeEmail(clientId);
    }
    
    setMessageText("");
  };

  const formatDateSeparator = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  // Sort messages (newest first for emails, oldest first for WhatsApp chat)
  const sortedMessages = channelFilter === 'email' 
    ? [...filteredMessages].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    : [...filteredMessages].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

  const channelLabel = channelFilter === 'email' ? 'Email' : channelFilter === 'whatsapp' ? 'WhatsApp' : 'Messages';
  const isEmailView = channelFilter === 'email';

  // Email-specific: current selected email
  const selectedEmail = isEmailView ? sortedMessages[selectedEmailIndex] : null;

  // ==================== EMAIL VIEW ====================
  if (isEmailView) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
          {/* Email Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-background border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{displayName}</h3>
                <p className="text-xs text-muted-foreground">
                  {filteredMessages.length} email{filteredMessages.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {onComposeEmail && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => onComposeEmail(clientId)}
                >
                  <Send className="h-3.5 w-3.5" />
                  Compose
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No emails yet</p>
              </div>
            </div>
          ) : (
            <>
              {/* Email Navigation */}
              {filteredMessages.length > 1 && (
                <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setSelectedEmailIndex(Math.max(0, selectedEmailIndex - 1))}
                    disabled={selectedEmailIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Newer
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {selectedEmailIndex + 1} of {filteredMessages.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setSelectedEmailIndex(Math.min(filteredMessages.length - 1, selectedEmailIndex + 1))}
                    disabled={selectedEmailIndex === filteredMessages.length - 1}
                  >
                    Older
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Email Content */}
              {selectedEmail && (
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {/* Email metadata */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-semibold text-base leading-tight">
                          {selectedEmail.subject || '(No subject)'}
                        </h2>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>To: {selectedEmail.recipientEmail || displayName}</span>
                        <span>•</span>
                        <span>{format(new Date(selectedEmail.sentAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
                      </div>

                      {selectedEmail.projectName && (
                        <button
                          onClick={() => handleProjectClick(selectedEmail.projectId!)}
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {selectedEmail.projectName}
                        </button>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t" />

                    {/* Email body */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {selectedEmail.fullContent ? (
                        <div dangerouslySetInnerHTML={{ __html: selectedEmail.fullContent }} />
                      ) : (
                        <p className="text-muted-foreground italic">No content</p>
                      )}
                    </div>

                    {/* Email stats if available */}
                    {(selectedEmail.openCount !== undefined || selectedEmail.clickCount !== undefined) && (
                      <>
                        <div className="border-t" />
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {selectedEmail.openCount !== undefined && (
                            <span>Opens: {selectedEmail.openCount}</span>
                          )}
                          {selectedEmail.clickCount !== undefined && (
                            <span>Clicks: {selectedEmail.clickCount}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  // ==================== WHATSAPP VIEW ====================
  // Group messages by date for WhatsApp chat view
  const groupedMessages: { date: Date; messages: UnifiedMessage[] }[] = [];
  sortedMessages.forEach((msg) => {
    const msgDate = new Date(msg.sentAt);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    
    if (lastGroup && isSameDay(lastGroup.date, msgDate)) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: msgDate, messages: [msg] });
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        {/* WhatsApp Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54] dark:bg-[#1F2C34] text-white">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarFallback className="bg-white/20 text-white font-medium">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{displayName}</h3>
            <p className="text-xs text-white/70">
              {channelLabel} • {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {displayPhone && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/10"
                onClick={handleCall}
              >
                <Phone className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Chat area */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 bg-[#ECE5DD] dark:bg-[#0B141A]"
        >
          <div className="p-4 space-y-4">
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <div className="flex justify-center">
                  <span className="px-3 py-1 text-[11px] bg-white/80 dark:bg-[#1F2C34] rounded-lg text-muted-foreground shadow-sm">
                    {formatDateSeparator(group.date)}
                  </span>
                </div>

                {group.messages.map((msg) => (
                  <div key={`${msg.channel}-${msg.id}`} className="space-y-2">
                    {msg.projectName && (
                      <button
                        onClick={() => handleProjectClick(msg.projectId!)}
                        className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors ml-auto"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>{msg.projectName}</span>
                      </button>
                    )}

                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-lg p-3 shadow-sm bg-[#DCF8C6] dark:bg-[#005C4B] rounded-tr-none">
                        <p className="text-sm whitespace-pre-wrap break-words text-[#303030] dark:text-white">
                          {msg.fullContent || msg.preview}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1.5">
                          <span className="text-[10px] text-[#667781] dark:text-white/60">
                            {format(new Date(msg.sentAt), 'h:mm a')}
                          </span>
                          <WhatsAppStatusIcon status={msg.status} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {filteredMessages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No messages yet</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message input */}
        <div className="flex items-center gap-2 p-2 bg-[#F0F2F5] dark:bg-[#1F2C34] border-t border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => onComposeWhatsApp?.(clientId)}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 bg-white dark:bg-[#2A3942] border-0 rounded-full h-10 px-4"
          />
          
          <Button
            size="icon"
            className="h-10 w-10 flex-shrink-0 rounded-full bg-[#00A884] hover:bg-[#00A884]/90 text-white"
            onClick={handleSend}
            disabled={!messageText.trim() || sendWhatsApp.isPending}
          >
            {sendWhatsApp.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
