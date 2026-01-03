import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Mail, MessageSquare, User, Phone, Calendar, Eye, MousePointer, CheckCircle, Clock, AlertCircle, Reply, Forward, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { UnifiedMessage } from "@/hooks/useUnifiedCommunications";

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
  if (!message) return null;

  const getStatusBadge = (status: string, channel: 'email' | 'whatsapp') => {
    const statusLower = status.toLowerCase();
    if (['sent', 'delivered'].includes(statusLower)) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          {statusLower === 'delivered' ? 'Delivered' : 'Sent'}
        </Badge>
      );
    }
    if (['pending', 'queued'].includes(statusLower)) {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
    if (statusLower === 'failed') {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const ChannelIcon = message.channel === 'email' ? Mail : MessageSquare;
  const channelColor = message.channel === 'email' ? 'text-blue-600' : 'text-green-600';
  const channelBgColor = message.channel === 'email' ? 'bg-blue-50' : 'bg-green-50';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${channelBgColor}`}>
              <ChannelIcon className={`h-5 w-5 ${channelColor}`} />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-left">
                {message.channel === 'email' ? message.subject || 'No Subject' : 'WhatsApp Message'}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                {message.channel === 'email' ? 'Email' : 'WhatsApp'} • {format(new Date(message.sentAt), 'PPp')}
              </p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] mt-6">
          <div className="space-y-6">
            {/* Metadata */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium">{message.clientName}</span>
              </div>
              
              {message.recipientEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span>{message.recipientEmail}</span>
                </div>
              )}
              
              {message.recipientPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{message.recipientPhone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sent:</span>
                <span>{format(new Date(message.sentAt), 'PPpp')}</span>
              </div>

              {message.projectName && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Project:</span>
                  <span>{message.projectName}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Status & Engagement */}
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(message.status, message.channel)}
              
              {message.channel === 'email' && (
                <>
                  {(message.openCount ?? 0) > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Eye className="h-3 w-3" />
                      Opened {message.openCount}x
                    </Badge>
                  )}
                  {(message.clickCount ?? 0) > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <MousePointer className="h-3 w-3" />
                      Clicked {message.clickCount}x
                    </Badge>
                  )}
                </>
              )}
            </div>

            <Separator />

            {/* Message Content */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Message Content</h4>
              <div className="p-4 bg-muted/50 rounded-lg">
                {message.channel === 'email' && message.fullContent ? (
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: message.fullContent }}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.fullContent || message.preview}</p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onReply?.(message)}
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button variant="outline" className="flex-1">
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
