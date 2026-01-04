import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquare, CheckCircle, CheckCheck, Clock, AlertCircle, RefreshCw, User, Phone, Users, Briefcase, ArrowRight, Plus, Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday, isYesterday } from "date-fns";
import { useNavigate } from "react-router-dom";
import { WhatsAppMessageDialog } from "./WhatsAppMessageDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface WhatsAppMessageLog {
  id: string;
  to_number: string;
  message_body: string;
  template_id: string | null;
  status: string;
  twilio_message_sid: string | null;
  created_at: string;
  client_id: string | null;
  error_message: string | null;
  client_name?: string;
}

interface ClientOption {
  id: string;
  name: string;
  phone: string | null;
}

export const WhatsAppMessageHistory = () => {
  const navigate = useNavigate();
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  const { data: messages, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['whatsapp-message-logs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('whatsapp_message_logs')
        .select(`
          *,
          clients:client_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      return (data || []).map(msg => ({
        ...msg,
        client_name: msg.clients?.name || 'Unknown'
      })) as unknown as WhatsAppMessageLog[];
    },
  });

  // Fetch clients with phone numbers for the picker
  const { data: clients } = useQuery({
    queryKey: ['clients-with-phone'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone, company_name, client_type')
        .not('phone', 'is', null)
        .order('name');

      if (error) throw error;
      return (data || []).map(c => ({
        id: c.id,
        name: c.client_type === 'B2B' ? c.company_name || c.name : c.name,
        phone: c.phone
      })) as ClientOption[];
    },
    enabled: showClientPicker,
  });

  const handleNewMessage = () => {
    setShowClientPicker(true);
  };

  const handleClientSelect = (client: ClientOption) => {
    setSelectedClient(client);
    setShowClientPicker(false);
    setShowWhatsAppDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'read':
        return <CheckCheck className={cn("h-3.5 w-3.5", status === 'read' ? "text-blue-500" : "text-muted-foreground")} />;
      case 'sent':
        return <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'pending':
      case 'queued':
        return <Clock className="h-3.5 w-3.5 text-amber-500" />;
      case 'failed':
        return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
      default:
        return <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'Unknown';
    if (phone.length >= 10) {
      return phone.replace(/(\+\d{1,2})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
    }
    return phone;
  };

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter messages by search and status
  const filteredMessages = React.useMemo(() => {
    if (!messages) return [];
    return messages.filter(msg => {
      const matchesSearch = searchQuery === "" ||
        msg.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message_body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.to_number?.includes(searchQuery);
      const matchesStatus = statusFilter === "all" || msg.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [messages, searchQuery, statusFilter]);

  const hasActiveFilters = statusFilter !== "all";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">WhatsApp Messages</h2>
            <p className="text-xs text-muted-foreground">
              Recent messages from your account
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Always-visible Search Input */}
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          
          {/* Filter Button */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`h-8 w-8 relative ${hasActiveFilters ? 'border-primary bg-primary/5' : ''}`}
              >
                <Filter className="h-3.5 w-3.5" />
                {hasActiveFilters && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Filter Messages</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={() => setStatusFilter("all")} className="text-xs h-6 px-2">
                      Clear
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            size="sm"
            onClick={handleNewMessage}
            className="bg-green-600 hover:bg-green-700 h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Client Picker Dialog */}
      <Dialog open={showClientPicker} onOpenChange={setShowClientPicker}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Client</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-1">
              {clients?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No clients with phone numbers found
                </p>
              ) : (
                clients?.map((client) => (
                  <Button
                    key={client.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.phone}</p>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Dialog */}
      {selectedClient && (
        <WhatsAppMessageDialog
          open={showWhatsAppDialog}
          onOpenChange={setShowWhatsAppDialog}
          client={{
            id: selectedClient.id,
            name: selectedClient.name,
            phone: selectedClient.phone || ''
          }}
        />
      )}

      {/* Messages List */}
      <Card variant="analytics">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredMessages && filteredMessages.length > 0 ? (
            <div className="space-y-2">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="group flex gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{message.client_name}</span>
                        <span className="text-xs text-muted-foreground">{formatPhone(message.to_number)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          {formatMessageDate(message.created_at)}
                        </span>
                        {getStatusIcon(message.status)}
                      </div>
                    </div>
                    
                    {/* Message bubble */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg rounded-tl-sm p-2.5 max-w-[90%]">
                      <p className="text-sm text-foreground line-clamp-2">
                        {message.message_body}
                      </p>
                    </div>
                    
                    {/* Meta info */}
                    <div className="flex items-center gap-2 mt-1">
                      {message.template_id && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                          Template
                        </Badge>
                      )}
                      {message.error_message && (
                        <span className="text-[10px] text-destructive">
                          Failed: {message.error_message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Send your first WhatsApp message to a client
              </p>
              
              <div className="max-w-md mx-auto space-y-3">
                <p className="text-sm font-medium text-muted-foreground mb-3">Send WhatsApp from:</p>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate('/?tab=clients')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Clients Page</p>
                      <p className="text-xs text-muted-foreground">Select a client → Quick Actions → WhatsApp</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate('/?tab=projects')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Jobs Page</p>
                      <p className="text-xs text-muted-foreground">Open any job → Contact button → WhatsApp</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-6">
                Messages are sent from the InterioApp Business Number
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
