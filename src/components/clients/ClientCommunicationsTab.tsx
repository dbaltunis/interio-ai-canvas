import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mail, MessageSquare, Paperclip, ChevronRight, 
  MessageCircle, ExternalLink
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerFilter, setDrawerFilter] = useState<'all' | 'email' | 'whatsapp'>('all');

  const emailMessages = messages?.filter(m => m.channel === 'email') || [];
  const whatsappMessages = messages?.filter(m => m.channel === 'whatsapp') || [];
  
  // Count files from WhatsApp media_url (could be enhanced later)
  const filesCount = whatsappMessages.filter(m => m.fullContent?.includes('media')).length;

  const lastMessage = messages?.[0];
  const lastContactTime = lastMessage 
    ? formatDistanceToNow(new Date(lastMessage.sentAt), { addSuffix: true })
    : null;

  const handleRowClick = (filter: 'all' | 'email' | 'whatsapp') => {
    setDrawerFilter(filter);
    setDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <Card variant="analytics">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalMessages = messages?.length || 0;

  return (
    <>
      <Card variant="analytics">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Messages
            </CardTitle>
            {totalMessages > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRowClick('all')}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                View All
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {totalMessages === 0 ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">No messages yet</p>
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
            </div>
          ) : (
            <div className="space-y-1">
              {/* Email Row */}
              <button
                onClick={() => handleRowClick('email')}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg transition-colors",
                  "hover:bg-muted/50 text-left",
                  emailMessages.length === 0 && "opacity-50"
                )}
                disabled={emailMessages.length === 0}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Emails</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{emailMessages.length}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>

              {/* WhatsApp Row */}
              <button
                onClick={() => handleRowClick('whatsapp')}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg transition-colors",
                  "hover:bg-muted/50 text-left",
                  whatsappMessages.length === 0 && "opacity-50"
                )}
                disabled={whatsappMessages.length === 0}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{whatsappMessages.length}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>

              {/* Files Row - show only if there are files */}
              {filesCount > 0 && (
                <button
                  onClick={() => {/* Navigate to files section */}}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg transition-colors hover:bg-muted/50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Paperclip className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium">Files</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{filesCount}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              )}

              {/* Last Contact */}
              {lastContactTime && (
                <div className="pt-2 mt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground px-2">
                    Last contact: {lastContactTime}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <MessagePreviewDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        message={null}
        clientId={clientId}
        channelFilter={drawerFilter}
        onComposeWhatsApp={onComposeWhatsApp}
        onComposeEmail={onComposeEmail}
      />
    </>
  );
};
