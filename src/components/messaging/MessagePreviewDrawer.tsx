import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, MessageSquare, Phone, ExternalLink, Reply, X } from "lucide-react";
import { format } from "date-fns";
import { UnifiedMessage } from "@/hooks/useUnifiedCommunications";
import { WhatsAppStatusIcon } from "./WhatsAppStatusIcon";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MessagePreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: UnifiedMessage | null;
  onReply?: (message: UnifiedMessage) => void;
}

export const MessagePreviewDrawer = ({ 
  open, 
  onOpenChange, 
  message,
  onReply 
}: MessagePreviewDrawerProps) => {
  const navigate = useNavigate();

  if (!message) return null;

  const isWhatsApp = message.channel === 'whatsapp';
  const ChannelIcon = isWhatsApp ? MessageSquare : Mail;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProjectClick = () => {
    if (message.projectId) {
      navigate(`/jobs/${message.projectId}`);
      onOpenChange(false);
    }
  };

  const handleCall = () => {
    if (message.recipientPhone) {
      window.open(`tel:${message.recipientPhone}`, '_self');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-3",
          isWhatsApp 
            ? "bg-[#075E54] dark:bg-[#1F2C34] text-white" 
            : "bg-blue-600 dark:bg-blue-800 text-white"
        )}>
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarFallback className="bg-white/20 text-white font-medium">
              {getInitials(message.clientName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{message.clientName}</h3>
            <p className="text-xs text-white/70 flex items-center gap-2">
              {message.recipientPhone || message.recipientEmail}
              <span>•</span>
              {format(new Date(message.sentAt), 'MMM d, yyyy')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Project link */}
        {message.projectName && (
          <button
            onClick={handleProjectClick}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-muted/50 hover:bg-muted transition-colors text-left"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate text-muted-foreground">
              Project: <span className="text-foreground font-medium">{message.projectName}</span>
            </span>
          </button>
        )}

        {/* Chat area */}
        <ScrollArea className="flex-1 p-4">
          <div className={cn(
            "min-h-[200px] rounded-lg p-4",
            isWhatsApp 
              ? "bg-[#ECE5DD] dark:bg-[#0B141A]" 
              : "bg-blue-50 dark:bg-blue-950/20"
          )}>
            {/* Subject for emails */}
            {!isWhatsApp && message.subject && (
              <div className="mb-4 pb-3 border-b border-border">
                <p className="text-sm font-medium">{message.subject}</p>
              </div>
            )}

            {/* Message bubble */}
            <div className="flex justify-end">
              <div className={cn(
                "max-w-[90%] rounded-lg p-3 shadow-sm",
                isWhatsApp 
                  ? "bg-[#DCF8C6] dark:bg-[#005C4B] rounded-tr-none" 
                  : "bg-white dark:bg-muted rounded-tr-none"
              )}>
                {/* Email HTML content */}
                {!isWhatsApp && message.fullContent ? (
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert text-sm"
                    dangerouslySetInnerHTML={{ __html: message.fullContent }}
                  />
                ) : (
                  <p className={cn(
                    "text-sm whitespace-pre-wrap break-words",
                    isWhatsApp ? "text-[#303030] dark:text-white" : "text-foreground"
                  )}>
                    {message.fullContent || message.preview}
                  </p>
                )}

                {/* Timestamp and status */}
                <div className="flex items-center justify-end gap-1 mt-2">
                  <span className={cn(
                    "text-[10px]",
                    isWhatsApp ? "text-[#667781] dark:text-white/60" : "text-muted-foreground"
                  )}>
                    {format(new Date(message.sentAt), 'h:mm a')}
                  </span>
                  {isWhatsApp && <WhatsAppStatusIcon status={message.status} />}
                </div>
              </div>
            </div>

            {/* Email engagement stats */}
            {!isWhatsApp && ((message.openCount ?? 0) > 0 || (message.clickCount ?? 0) > 0) && (
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                {(message.openCount ?? 0) > 0 && (
                  <span>👁 Opened {message.openCount}x</span>
                )}
                {(message.clickCount ?? 0) > 0 && (
                  <span>🖱 Clicked {message.clickCount}x</span>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Action bar */}
        <div className="flex items-center gap-2 p-3 border-t border-border bg-background">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => onReply?.(message)}
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          {message.recipientPhone && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCall}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              onReply?.(message);
              onOpenChange(false);
            }}
          >
            <ChannelIcon className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
