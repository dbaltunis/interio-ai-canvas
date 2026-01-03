import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, MessageSquare, Search, Filter, CheckCircle, Clock, AlertCircle, 
  Eye, MousePointer, Phone, Calendar, MessageCircle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useUnifiedCommunications, UnifiedMessage } from "@/hooks/useUnifiedCommunications";
import { MessagePreviewDrawer } from "@/components/messaging/MessagePreviewDrawer";
import { Skeleton } from "@/components/ui/skeleton";

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
        msg.subject?.toLowerCase().includes(query) ||
        msg.clientName.toLowerCase().includes(query)
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Communications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Communications
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Mail className="h-3 w-3" />
                {emailCount}
              </Badge>
              <Badge variant="outline" className="gap-1 text-green-700 border-green-200">
                <MessageSquare className="h-3 w-3" />
                {whatsappCount}
              </Badge>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={channelFilter} onValueChange={(v) => setChannelFilter(v as any)}>
              <TabsList className="h-9">
                <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                <TabsTrigger value="email" className="text-xs px-3 gap-1">
                  <Mail className="h-3 w-3" /> Email
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="text-xs px-3 gap-1">
                  <MessageSquare className="h-3 w-3" /> WhatsApp
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {channelFilter === 'all' 
                  ? 'Start a conversation with this client'
                  : `No ${channelFilter === 'email' ? 'emails' : 'WhatsApp messages'} found`}
              </p>
              <div className="flex justify-center gap-2">
                {onComposeEmail && (
                  <Button variant="outline" size="sm" onClick={onComposeEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                )}
                {onComposeWhatsApp && (
                  <Button variant="outline" size="sm" onClick={onComposeWhatsApp} className="text-green-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send WhatsApp
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredMessages.map((message) => {
                  const ChannelIcon = message.channel === 'email' ? Mail : MessageSquare;
                  const iconColor = message.channel === 'email' ? 'text-blue-600' : 'text-green-600';
                  const bgColor = message.channel === 'email' ? 'bg-blue-50' : 'bg-green-50';

                  return (
                    <div
                      key={`${message.channel}-${message.id}`}
                      className="group relative flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-card/50 hover:border-border hover:bg-card hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => handleMessageClick(message)}
                    >
                      {/* Channel Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-lg ${bgColor}`}>
                        <ChannelIcon className={`h-4 w-4 ${iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {message.channel === 'email' 
                              ? message.subject || 'No Subject'
                              : 'WhatsApp Message'}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            {getStatusIcon(message.status)}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {message.preview}
                        </p>

                        {/* Engagement indicators for email */}
                        {message.channel === 'email' && ((message.openCount ?? 0) > 0 || (message.clickCount ?? 0) > 0) && (
                          <div className="flex items-center gap-2 pt-1">
                            {(message.openCount ?? 0) > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                {message.openCount}
                              </span>
                            )}
                            {(message.clickCount ?? 0) > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MousePointer className="h-3 w-3" />
                                {message.clickCount}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Recipient info */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                          {message.recipientEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {message.recipientEmail}
                            </span>
                          )}
                          {message.recipientPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {message.recipientPhone}
                            </span>
                          )}
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
      />
    </>
  );
};
