import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, Clock, AlertCircle, RefreshCw, User, Phone, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

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

export const WhatsAppMessageHistory = () => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status === 'delivered' ? 'Delivered' : 'Sent'}
          </Badge>
        );
      case 'pending':
      case 'queued':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'Unknown';
    // Format: +1 (234) 567-8901
    if (phone.length >= 10) {
      return phone.replace(/(\+\d{1,2})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            WhatsApp Message History
          </h2>
          <p className="text-sm text-muted-foreground">
            View all WhatsApp messages sent from this account
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Messages</CardTitle>
          <CardDescription>
            Last 50 WhatsApp messages sent from your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{message.client_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {formatPhone(message.to_number)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(message.status)}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded">
                    {message.message_body}
                  </p>
                  {message.template_id && (
                    <Badge variant="outline" className="text-xs">
                      Template Message
                    </Badge>
                  )}
                  {message.error_message && (
                    <p className="text-xs text-destructive">
                      Error: {message.error_message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                WhatsApp messages you send will appear here.
              </p>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">How to send WhatsApp messages:</p>
                <ul className="space-y-1">
                  <li className="flex items-center justify-center gap-2">
                    <Send className="h-3 w-3" />
                    Go to a Client profile → Quick Actions → WhatsApp
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <Send className="h-3 w-3" />
                    Or from any Job page with a client attached
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
