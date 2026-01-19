import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Mail, MessageSquare, Search, Archive, Star, 
  RefreshCw, MoreHorizontal, ArrowLeft, Clock,
  CheckCircle2, XCircle, Eye, MousePointerClick,
  Reply, Forward, Copy, Trash2
} from "lucide-react";
import { PixelMessageIcon } from "@/components/icons/PixelArtIcons";
import { formatDistanceToNow, format } from "date-fns";
import { useUnifiedCommunications, groupMessagesByClient, UnifiedMessage } from "@/hooks/useUnifiedCommunications";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface EmailInboxProps {
  onComposeClick?: () => void;
}

export const EmailInbox = ({ onComposeClick }: EmailInboxProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<UnifiedMessage | null>(null);
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'whatsapp'>('all');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: messages = [], isLoading, refetch } = useUnifiedCommunications();

  const handleCopyContent = () => {
    if (!selectedMessage) return;
    const textContent = (selectedMessage.fullContent || selectedMessage.preview).replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(textContent);
    toast({ title: "Copied", description: "Email content copied to clipboard" });
  };

  const handleReply = () => {
    toast({ title: "Reply", description: "Opening composer to reply..." });
    onComposeClick?.();
  };

  const handleForward = () => {
    toast({ title: "Forward", description: "Opening composer to forward..." });
    onComposeClick?.();
  };

  const handleArchive = () => {
    toast({ title: "Archived", description: "Message moved to archive" });
    setSelectedMessage(null);
  };

  const handleDelete = () => {
    toast({ title: "Deleted", description: "Message deleted", variant: "destructive" });
    setSelectedMessage(null);
  };

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const matchesSearch = 
        msg.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesChannel = channelFilter === 'all' || msg.channel === channelFilter;
      return matchesSearch && matchesChannel;
    });
  }, [messages, searchTerm, channelFilter]);

  const emailCount = messages.filter(m => m.channel === 'email').length;
  const whatsappCount = messages.filter(m => m.channel === 'whatsapp').length;

  const handleRefresh = async () => {
    await refetch();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'opened':
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
      case 'sent':
        return <Clock className="h-3.5 w-3.5 text-blue-500" />;
      case 'failed':
      case 'bounced':
        return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      default:
        return <Mail className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[500px] border rounded-xl overflow-hidden bg-card">
      {/* Left Panel - Message List */}
      <div className={cn(
        "flex flex-col border-r transition-all duration-200",
        selectedMessage ? "w-[380px]" : "w-full"
      )}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 h-9 bg-background"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Channel Filter Pills */}
        <div className="flex items-center gap-2 p-3 border-b">
          <button
            onClick={() => setChannelFilter('all')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              channelFilter === 'all' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setChannelFilter('email')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5",
              channelFilter === 'email' 
                ? "bg-blue-500 text-white" 
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            <Mail className="h-3 w-3" />
            Email ({emailCount})
          </button>
          <button
            onClick={() => setChannelFilter('whatsapp')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5",
              channelFilter === 'whatsapp' 
                ? "bg-green-500 text-white" 
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            <MessageSquare className="h-3 w-3" />
            WhatsApp ({whatsappCount})
          </button>
        </div>

        {/* Message List */}
        <ScrollArea className="flex-1">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <PixelMessageIcon size={56} />
              <h3 className="mt-4 font-semibold text-foreground">No messages yet</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-[240px]">
                {searchTerm ? "Try a different search term" : "Start a conversation with your clients"}
              </p>
              {onComposeClick && (
                <Button onClick={onComposeClick} className="mt-4" size="sm">
                  Compose Message
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors",
                    selectedMessage?.id === message.id && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-medium",
                    message.channel === 'email' 
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  )}>
                    {message.clientName.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm truncate">{message.clientName}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate text-foreground">
                      {message.subject || 'No subject'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {message.preview}
                    </p>
                    
                    {/* Status & Metrics */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(message.status)}
                        <span className="text-xs text-muted-foreground capitalize">{message.status}</span>
                      </div>
                      {message.channel === 'email' && (
                        <>
                          {(message.openCount || 0) > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              <span>{message.openCount}</span>
                            </div>
                          )}
                          {(message.clickCount || 0) > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MousePointerClick className="h-3 w-3" />
                              <span>{message.clickCount}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Channel Icon */}
                  <div className="shrink-0">
                    {message.channel === 'email' ? (
                      <Mail className="h-4 w-4 text-blue-500" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Panel - Message Detail */}
      {selectedMessage && (
        <div className="flex-1 flex flex-col bg-background">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 md:hidden"
              onClick={() => setSelectedMessage(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{selectedMessage.subject || 'No subject'}</h3>
              <p className="text-sm text-muted-foreground">
                To: {selectedMessage.recipientEmail || selectedMessage.recipientPhone || selectedMessage.clientName}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover">
                <DropdownMenuItem onClick={handleReply}>
                  <Reply className="h-4 w-4 mr-2" /> Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleForward}>
                  <Forward className="h-4 w-4 mr-2" /> Forward
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyContent}>
                  <Copy className="h-4 w-4 mr-2" /> Copy Content
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" /> Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Message Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-2xl">
              {/* Sender Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg",
                  selectedMessage.channel === 'email'
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                )}>
                  {selectedMessage.clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{selectedMessage.clientName}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(selectedMessage.sentAt), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Email Body */}
              <div 
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedMessage.fullContent || '<p>No content</p>' }}
              />

            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
