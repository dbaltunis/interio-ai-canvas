import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "./useEffectiveAccountOwner";

export interface UnifiedMessage {
  id: string;
  channel: 'email' | 'whatsapp';
  clientId: string | null;
  clientName: string;
  projectId: string | null;
  projectName: string | null;
  subject: string | null;
  preview: string;
  fullContent: string;
  recipientEmail?: string;
  recipientPhone?: string;
  status: string;
  sentAt: string;
  openCount?: number;
  clickCount?: number;
}

export const useUnifiedCommunications = (clientId?: string) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ["unified-communications", effectiveOwnerId, clientId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      // Fetch emails
      let emailQuery = supabase
        .from("emails")
        .select(`
          *,
          clients:client_id (name)
        `)
        .eq("user_id", effectiveOwnerId)
        .order("created_at", { ascending: false });

      if (clientId) {
        emailQuery = emailQuery.eq("client_id", clientId);
      }

      const { data: emails, error: emailError } = await emailQuery;

      if (emailError) {
        console.error("Error fetching emails:", emailError);
      }

      // Fetch WhatsApp messages
      let whatsappQuery = supabase
        .from("whatsapp_message_logs")
        .select(`
          *,
          clients:client_id (name),
          projects:project_id (name)
        `)
        .eq("account_owner_id", effectiveOwnerId)
        .order("created_at", { ascending: false });

      if (clientId) {
        whatsappQuery = whatsappQuery.eq("client_id", clientId);
      }

      const { data: whatsappMessages, error: whatsappError } = await whatsappQuery;

      if (whatsappError) {
        console.error("Error fetching WhatsApp messages:", whatsappError);
      }

      // Normalize and combine messages
      const normalizedEmails: UnifiedMessage[] = (emails || []).map((email: any) => ({
        id: email.id,
        channel: 'email' as const,
        clientId: email.client_id,
        clientName: email.clients?.name || email.recipient_email || 'Unknown',
        projectId: null,
        projectName: null,
        subject: email.subject,
        preview: email.subject || 'No subject',
        fullContent: email.content || '',
        recipientEmail: email.recipient_email,
        status: email.status || 'sent',
        sentAt: email.created_at,
        openCount: email.open_count || 0,
        clickCount: email.click_count || 0,
      }));

      const normalizedWhatsApp: UnifiedMessage[] = (whatsappMessages || []).map((msg: any) => ({
        id: msg.id,
        channel: 'whatsapp' as const,
        clientId: msg.client_id,
        clientName: msg.clients?.name || 'Unknown',
        projectId: msg.project_id,
        projectName: msg.projects?.name || null,
        subject: null,
        preview: msg.message_body?.substring(0, 100) || 'Message sent',
        fullContent: msg.message_body || '',
        recipientPhone: msg.to_number,
        status: msg.status || 'sent',
        sentAt: msg.created_at,
      }));

      // Combine and sort by date (newest first)
      const allMessages = [...normalizedEmails, ...normalizedWhatsApp].sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );

      return allMessages;
    },
    enabled: !!effectiveOwnerId,
    staleTime: 2 * 60 * 1000,
  });
};

// Group messages by client
export const groupMessagesByClient = (messages: UnifiedMessage[]) => {
  const grouped: Record<string, { clientName: string; messages: UnifiedMessage[] }> = {};

  messages.forEach((msg) => {
    const key = msg.clientId || 'unknown';
    if (!grouped[key]) {
      grouped[key] = {
        clientName: msg.clientName,
        messages: [],
      };
    }
    grouped[key].messages.push(msg);
  });

  // Convert to array and sort by most recent message
  return Object.entries(grouped)
    .map(([clientId, data]) => ({
      clientId,
      clientName: data.clientName,
      messages: data.messages,
      lastMessageAt: data.messages[0]?.sentAt,
      totalCount: data.messages.length,
    }))
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
};
