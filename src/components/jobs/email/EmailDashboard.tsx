import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, MessageSquare, Search, ChevronRight, 
  RefreshCw, Users
} from "lucide-react";
import { PixelMessageIcon } from "@/components/icons/PixelArtIcons";
import { formatDistanceToNow, format } from "date-fns";
import { useUnifiedCommunications, groupMessagesByClient, UnifiedMessage } from "@/hooks/useUnifiedCommunications";
import { MessagePreviewDrawer } from "@/components/messaging/MessagePreviewDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { EmailDashboardSkeleton } from "./skeleton/EmailDashboardSkeleton";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCanViewEmailKPIs } from "@/hooks/useCanViewEmailKPIs";
import { useUserRole } from "@/hooks/useUserRole";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailDashboardProps {
  showFilters?: boolean;
  setShowFilters?: (show: boolean) => void;
}

export const EmailDashboard = ({
  showFilters = false,
  setShowFilters
}: EmailDashboardProps = {}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<UnifiedMessage | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { canViewEmailKPIs, isPermissionLoaded } = useCanViewEmailKPIs();
  const { data: userRoleData, isLoading: userRoleLoading } = useUserRole();
  
  // Owner/System Owner/Admin always has access - bypass permission loading
  // Also check role string directly as fallback (isAdmin uses RPC which may be slow)
  const hasOwnerAccess = userRoleData?.isOwner || userRoleData?.isSystemOwner || userRoleData?.isAdmin || userRoleData?.role === 'Admin';
  const { data: messages = [], isLoading, refetch } = useUnifiedCommunications();
  
  // Set up real-time subscriptions for email updates
  useEffect(() => {
    const channelName = `email-updates-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const emailChannel = supabase.channel(channelName).on('postgres_changes', {
      event: '*',
      // Listen to all events (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'emails'
    }, payload => {
      console.log('Email table change detected:', payload);
      // Invalidate email queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['emails']
      });
      queryClient.invalidateQueries({
        queryKey: ['email-kpis']
      });
      queryClient.invalidateQueries({
        queryKey: ['unified-communications']
      });
    }).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'email_analytics'
    }, payload => {
      console.log('Email analytics change detected:', payload);
      // Invalidate all email-related queries
      queryClient.invalidateQueries({
        queryKey: ['emails']
      });
      queryClient.invalidateQueries({
        queryKey: ['email-kpis']
      });
      queryClient.invalidateQueries({
        queryKey: ['email-analytics']
      });
      queryClient.invalidateQueries({
        queryKey: ['unified-communications']
      });
    }).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'whatsapp_message_logs'
    }, payload => {
      console.log('WhatsApp message change detected:', payload);
      queryClient.invalidateQueries({
        queryKey: ['unified-communications']
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(emailChannel);
    };
  }, [queryClient]);
  
  const handleRefresh = async () => {
    await refetch();
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesChannel = channelFilter === 'all' || msg.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  // Group by client
  const groupedMessages = groupMessagesByClient(filteredMessages);

  // Calculate stats
  const emailCount = messages.filter(m => m.channel === 'email').length;
  const whatsappCount = messages.filter(m => m.channel === 'whatsapp').length;
  const clientCount = groupedMessages.length;

  const toggleClient = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const openClientThread = (clientId: string, filter: 'all' | 'email' | 'whatsapp' = 'all') => {
    // Owner always has access - don't wait for permission loading
    const hasAccess = hasOwnerAccess || (isPermissionLoaded && canViewEmailKPIs);
    if (!hasAccess) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to view email performance metrics.",
        variant: "destructive",
      });
      return;
    }
    setSelectedClientId(clientId);
    setChannelFilter(filter);
    setDrawerOpen(true);
  };

  const handleMessageClick = (message: UnifiedMessage, clientId: string) => {
    // Owner always has access - don't wait for permission loading
    const hasAccess = hasOwnerAccess || (isPermissionLoaded && canViewEmailKPIs);
    if (!hasAccess) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to view email performance metrics.",
        variant: "destructive",
      });
      return;
    }
    setSelectedMessage(message);
    setSelectedClientId(clientId);
    setDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-16 flex-1" />
          <Skeleton className="h-16 flex-1" />
          <Skeleton className="h-16 flex-1" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setChannelFilter('all')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
            channelFilter === 'all' 
              ? "bg-primary/10 border-primary text-primary" 
              : "bg-card hover:bg-muted/50"
          )}
        >
          <Users className="h-4 w-4" />
          <span className="font-medium">{clientCount}</span>
          <span className="text-muted-foreground text-sm">Clients</span>
        </button>
        
        <button
          onClick={() => setChannelFilter('email')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
            channelFilter === 'email' 
              ? "bg-blue-500/10 border-blue-500 text-blue-600" 
              : "bg-card hover:bg-muted/50"
          )}
        >
          <Mail className="h-4 w-4" />
          <span className="font-medium">{emailCount}</span>
          <span className="text-muted-foreground text-sm">Emails</span>
        </button>
        
        <button
          onClick={() => setChannelFilter('whatsapp')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
            channelFilter === 'whatsapp' 
              ? "bg-green-500/10 border-green-500 text-green-600" 
              : "bg-card hover:bg-muted/50"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="font-medium">{whatsappCount}</span>
          <span className="text-muted-foreground text-sm">WhatsApp</span>
        </button>

        <div className="flex-1" />
        
        <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-9">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Client-Grouped Messages */}
      <Card className="rounded-xl border">
        <CardContent className="p-0">
          {groupedMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <PixelMessageIcon size={64} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Start the conversation!</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {searchTerm ? "Try a different search term" : "Great relationships begin with hello."}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-border">
                {groupedMessages.map((group) => {
                  const emailsInGroup = group.messages.filter(m => m.channel === 'email');
                  const whatsappInGroup = group.messages.filter(m => m.channel === 'whatsapp');
                  const lastMessage = group.messages[0];
                  const isExpanded = expandedClients.has(group.clientId);

                  return (
                    <Collapsible
                      key={group.clientId}
                      open={isExpanded}
                      onOpenChange={() => toggleClient(group.clientId)}
                    >
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                            {group.clientName.charAt(0).toUpperCase()}
                          </div>
                          
                          {/* Client Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{group.clientName}</span>
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {group.totalCount}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {lastMessage.subject || lastMessage.preview}
                            </p>
                          </div>

                          {/* Channel Badges */}
                          <div className="flex items-center gap-2 shrink-0">
                            {emailsInGroup.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 text-blue-500" />
                                <span>{emailsInGroup.length}</span>
                              </div>
                            )}
                            {whatsappInGroup.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageSquare className="h-3.5 w-3.5 text-green-500" />
                                <span>{whatsappInGroup.length}</span>
                              </div>
                            )}
                          </div>

                          {/* Time & Arrow */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(group.lastMessageAt), { addSuffix: true })}
                            </span>
                            <ChevronRight className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              isExpanded && "rotate-90"
                            )} />
                          </div>
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="bg-muted/20 border-t border-border/50">
                          {group.messages.slice(0, 5).map((msg) => (
                            <button
                              key={msg.id}
                              onClick={() => handleMessageClick(msg, group.clientId)}
                              disabled={!(hasOwnerAccess || (isPermissionLoaded && canViewEmailKPIs))}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 pl-14 hover:bg-muted/30 transition-colors text-left",
                                !(hasOwnerAccess || (isPermissionLoaded && canViewEmailKPIs)) && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {/* Channel Icon */}
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                                msg.channel === 'email' 
                                  ? "bg-blue-100 dark:bg-blue-900/30" 
                                  : "bg-green-100 dark:bg-green-900/30"
                              )}>
                                {msg.channel === 'email' ? (
                                  <Mail className="h-3 w-3 text-blue-600" />
                                ) : (
                                  <MessageSquare className="h-3 w-3 text-green-600" />
                                )}
                              </div>

                              {/* Message Preview */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">
                                  {msg.subject || msg.preview}
                                </p>
                              </div>

                              {/* Status */}
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs shrink-0",
                                  msg.status === 'delivered' && "bg-green-500/10 text-green-600 border-green-200",
                                  msg.status === 'sent' && "bg-blue-500/10 text-blue-600 border-blue-200",
                                  msg.status === 'failed' && "bg-red-500/10 text-red-600 border-red-200"
                                )}
                              >
                                {msg.status}
                              </Badge>

                              {/* Time */}
                              <span className="text-xs text-muted-foreground shrink-0">
                                {format(new Date(msg.sentAt), 'MMM d, HH:mm')}
                              </span>
                            </button>
                          ))}
                          
                          {group.messages.length > 5 && (
                            <button
                              onClick={() => openClientThread(group.clientId)}
                              disabled={!(hasOwnerAccess || (isPermissionLoaded && canViewEmailKPIs))}
                              className={cn(
                                "w-full px-4 py-2 pl-14 text-sm text-primary hover:bg-muted/30 transition-colors text-left",
                                !(hasOwnerAccess || (isPermissionLoaded && canViewEmailKPIs)) && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              View all {group.messages.length} messages →
                            </button>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Message Preview Drawer */}
      <MessagePreviewDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        message={selectedMessage}
        clientId={selectedClientId || undefined}
        channelFilter={channelFilter}
      />
    </div>
  );
};
