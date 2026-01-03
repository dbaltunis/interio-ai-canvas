import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, MessageSquare, Search, CheckCircle, Clock, AlertCircle, 
  Eye, MousePointer, Phone, MessageCircle, Plus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUnifiedCommunications, UnifiedMessage } from "@/hooks/useUnifiedCommunications";
import { MessagePreviewDrawer } from "@/components/messaging/MessagePreviewDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ClientCommunicationsTabProps {
  clientId: string;
  clientEmail?: string | null;
  onComposeEmail?: () => void;
  onComposeWhatsApp?: () => void;
}

export const ClientCommunicationsTab = ({ 
  clientId, 
  clientEmail,
  onComposeEmail,
  onComposeWhatsApp 
}: ClientCommunicationsTabProps) => {
  const { data: messages, isLoading } = useUnifiedCommunications(clientId);
  const [selectedMessage, setSelectedMessage] = useState<UnifiedMessage | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = (messages || []).filter((msg) => {
    if (channelFilter !== 'all' && msg.channel !== channelFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        msg.preview.toLowerCase().includes(query) ||
        msg.subject?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const emailCount = messages?.filter(m => m.channel === 'email').length || 0;
  const whatsappCount = messages?.filter(m => m.channel === 'whatsapp').length || 0;

  const handleMessageClick = (message: UnifiedMessage) => {
    setSelectedMessage(message);
    setDrawerOpen(true);
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (['sent', 'delivered'].includes(s)) return <CheckCircle className="h-3 w-3 text-green-600" />;
    if (['pending', 'queued'].includes(s)) return <Clock className="h-3 w-3 text-amber-500" />;
    if (s === 'failed') return <AlertCircle className="h-3 w-3 text-destructive" />;
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Communications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const totalMessages = messages?.length || 0;

  return (
    <>
      <Card>
        <CardHeader className="py-3 pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Communications
              {totalMessages > 0 && (
                <span className="text-xs text-muted-foreground font-normal">({totalMessages})</span>
              )}
            </CardTitle>
            <div className="flex items-center gap-1">
              {/* Channel filter buttons - minimal */}
              <Button
                variant={channelFilter === 'all' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setChannelFilter('all')}
                className="h-6 px-2 text-xs"
              >
                All
              </Button>
              <Button
                variant={channelFilter === 'email' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setChannelFilter('email')}
                className="h-6 px-2 text-xs gap-1"
              >
                <Mail className="h-3 w-3" />
                {emailCount}
              </Button>
              <Button
                variant={channelFilter === 'whatsapp' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setChannelFilter('whatsapp')}
                className="h-6 px-2 text-xs gap-1 text-green-700"
              >
                <MessageSquare className="h-3 w-3" />
                {whatsappCount}
              </Button>
            </div>
          </div>
          
          {/* Search - compact */}
          {totalMessages > 5 && (
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 pl-7 text-xs"
              />
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-2">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {totalMessages === 0 ? 'No messages yet' : 'No matches'}
              </p>
              {totalMessages === 0 && (
                <div className="flex justify-center gap-2">
                  {onComposeEmail && (
                    <Button variant="outline" size="sm" onClick={onComposeEmail} className="h-7 text-xs">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                  )}
                  {onComposeWhatsApp && (
                    <Button variant="outline" size="sm" onClick={onComposeWhatsApp} className="h-7 text-xs text-green-700">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[320px]">
              <div className="space-y-1">
                {filteredMessages.map((message) => {
                  const isEmail = message.channel === 'email';
                  const status = message.status.toLowerCase();
                  const isDelivered = ['delivered', 'read', 'opened'].includes(status);
                  const isRead = ['read', 'opened'].includes(status) || (message.openCount ?? 0) > 0;
                  
                  return (
                    <div
                      key={`${message.channel}-${message.id}`}
                      className="group flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleMessageClick(message)}
                    >
                      {/* Channel indicator - minimal */}
                      <div className={cn(
                        "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5",
                        isEmail ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                      )}>
                        {isEmail ? <Mail className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                      </div>

                      {/* Content as chat bubble */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-xs font-medium truncate">
                            {isEmail ? (message.subject || 'No Subject') : 'WhatsApp'}
                          </span>
                        </div>
                        <div className={cn(
                          "rounded-lg rounded-tl-sm p-2 max-w-full",
                          isEmail ? "bg-blue-50 dark:bg-blue-900/20" : "bg-green-50 dark:bg-green-900/20"
                        )}>
                          <p className="text-xs text-foreground line-clamp-2">
                            {message.preview}
                          </p>
                        </div>
                        
                        {/* Status row */}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(message.sentAt), { addSuffix: false })}
                          </span>
                          <div className="flex items-center gap-1">
                            {isEmail && ((message.openCount ?? 0) > 0 || (message.clickCount ?? 0) > 0) && (
                              <>
                                {(message.openCount ?? 0) > 0 && (
                                  <span className="flex items-center text-[10px] text-blue-600">
                                    <Eye className="h-2.5 w-2.5 mr-0.5" />
                                    {message.openCount}
                                  </span>
                                )}
                                {(message.clickCount ?? 0) > 0 && (
                                  <span className="flex items-center text-[10px] text-blue-600">
                                    <MousePointer className="h-2.5 w-2.5 mr-0.5" />
                                    {message.clickCount}
                                  </span>
                                )}
                              </>
                            )}
                            {/* WhatsApp-style double checkmarks */}
                            {!isEmail && (
                              <div className="flex items-center">
                                {isRead ? (
                                  <span className="text-blue-500">✓✓</span>
                                ) : isDelivered ? (
                                  <span className="text-muted-foreground">✓✓</span>
                                ) : (
                                  <span className="text-muted-foreground">✓</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <MessagePreviewDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        message={selectedMessage}
        onComposeWhatsApp={onComposeWhatsApp ? () => onComposeWhatsApp() : undefined}
        onComposeEmail={onComposeEmail ? () => onComposeEmail() : undefined}
      />
    </>
  );
};
