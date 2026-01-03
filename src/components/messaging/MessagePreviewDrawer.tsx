import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, Phone, ExternalLink, Send, Paperclip, X } from "lucide-react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { UnifiedMessage, useUnifiedCommunications } from "@/hooks/useUnifiedCommunications";
import { WhatsAppStatusIcon } from "./WhatsAppStatusIcon";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MessagePreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: UnifiedMessage | null;
  onComposeWhatsApp?: (clientId: string) => void;
  onComposeEmail?: (clientId: string) => void;
}

export const MessagePreviewDrawer = ({ 
  open, 
  onOpenChange, 
  message,
  onComposeWhatsApp,
  onComposeEmail
}: MessagePreviewDrawerProps) => {
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState("");

  // Fetch ALL messages for this client
  const clientId = message?.clientId || undefined;
  const { data: allMessages } = useUnifiedCommunications(clientId);

  // Auto-scroll to bottom when drawer opens or messages change
  useEffect(() => {
    if (open && scrollAreaRef.current) {
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [open, allMessages?.length]);

  if (!message) return null;

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
    if (message.recipientPhone) {
      window.open(`tel:${message.recipientPhone}`, '_self');
    }
  };

  const handleSend = () => {
    if (!messageText.trim() || !clientId) return;
    
    // Determine channel based on last message or default to WhatsApp
    const lastMessage = allMessages?.[0];
    if (lastMessage?.channel === 'whatsapp' && onComposeWhatsApp) {
      onComposeWhatsApp(clientId);
    } else if (onComposeEmail) {
      onComposeEmail(clientId);
    } else if (onComposeWhatsApp) {
      onComposeWhatsApp(clientId);
    }
    
    setMessageText("");
  };

  const formatDateSeparator = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  // Group messages by date
  const groupedMessages: { date: Date; messages: UnifiedMessage[] }[] = [];
  const sortedMessages = [...(allMessages || [])].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
  );

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
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54] dark:bg-[#1F2C34] text-white">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarFallback className="bg-white/20 text-white font-medium">
              {getInitials(message.clientName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{message.clientName}</h3>
            <p className="text-xs text-white/70">
              {message.recipientPhone || message.recipientEmail}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {message.recipientPhone && (
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

        {/* Chat area with WhatsApp-style background */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 bg-[#ECE5DD] dark:bg-[#0B141A]"
        >
          <div className="p-4 space-y-4">
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                {/* Date separator */}
                <div className="flex justify-center">
                  <span className="px-3 py-1 text-[11px] bg-white/80 dark:bg-[#1F2C34] rounded-lg text-muted-foreground shadow-sm">
                    {formatDateSeparator(group.date)}
                  </span>
                </div>

                {/* Messages for this date */}
                {group.messages.map((msg) => {
                  const isWhatsApp = msg.channel === 'whatsapp';
                  
                  return (
                    <div key={`${msg.channel}-${msg.id}`} className="space-y-2">
                      {/* Project link if different from current context */}
                      {msg.projectName && (
                        <button
                          onClick={() => handleProjectClick(msg.projectId!)}
                          className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors ml-auto"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>{msg.projectName}</span>
                        </button>
                      )}

                      {/* Message bubble - always on right (sent messages) */}
                      <div className="flex justify-end">
                        <div className={cn(
                          "max-w-[85%] rounded-lg p-3 shadow-sm relative",
                          isWhatsApp 
                            ? "bg-[#DCF8C6] dark:bg-[#005C4B] rounded-tr-none" 
                            : "bg-white dark:bg-muted rounded-tr-none"
                        )}>
                          {/* Channel indicator for emails */}
                          {!isWhatsApp && (
                            <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-border/30">
                              <Mail className="h-3 w-3 text-blue-500" />
                              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                {msg.subject || 'Email'}
                              </span>
                            </div>
                          )}

                          {/* Content */}
                          {!isWhatsApp && msg.fullContent ? (
                            <div 
                              className="prose prose-sm max-w-none dark:prose-invert text-sm"
                              dangerouslySetInnerHTML={{ __html: msg.fullContent }}
                            />
                          ) : (
                            <p className={cn(
                              "text-sm whitespace-pre-wrap break-words",
                              isWhatsApp ? "text-[#303030] dark:text-white" : "text-foreground"
                            )}>
                              {msg.fullContent || msg.preview}
                            </p>
                          )}

                          {/* Timestamp and status */}
                          <div className="flex items-center justify-end gap-1 mt-1.5">
                            <span className={cn(
                              "text-[10px]",
                              isWhatsApp ? "text-[#667781] dark:text-white/60" : "text-muted-foreground"
                            )}>
                              {format(new Date(msg.sentAt), 'h:mm a')}
                            </span>
                            <WhatsAppStatusIcon status={msg.status} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Empty state */}
            {(!allMessages || allMessages.length === 0) && (
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
            onClick={() => {
              if (clientId && onComposeWhatsApp) {
                onComposeWhatsApp(clientId);
              }
            }}
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
            disabled={!messageText.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
