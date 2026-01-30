import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

export type InquiryType = 
  | "demo_request"
  | "quote_request"
  | "partnership"
  | "support"
  | "general";

export interface ClientInquiry {
  id: string;
  client_id: string;
  user_id: string;
  inquiry_type: InquiryType;
  message: string;
  source: string;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Inquiry type display configuration
export const INQUIRY_TYPE_CONFIG: Record<InquiryType, { label: string; color: string; bgColor: string }> = {
  demo_request: { label: "Demo Request", color: "text-green-700", bgColor: "bg-green-100" },
  quote_request: { label: "Quote Request", color: "text-blue-700", bgColor: "bg-blue-100" },
  partnership: { label: "Partnership", color: "text-purple-700", bgColor: "bg-purple-100" },
  support: { label: "Support", color: "text-orange-700", bgColor: "bg-orange-100" },
  general: { label: "General Inquiry", color: "text-gray-700", bgColor: "bg-gray-100" },
};

/**
 * Fetch all inquiries for a specific client
 */
export const useClientInquiries = (clientId: string) => {
  return useQuery({
    queryKey: ["client-inquiries", clientId],
    queryFn: async () => {
      console.log("[useClientInquiries] Fetching inquiries for client:", clientId);
      
      const { data, error } = await supabase
        .from("client_inquiries")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[useClientInquiries] Error fetching inquiries:", error);
        throw error;
      }
      
      console.log("[useClientInquiries] Fetched", data?.length, "inquiries");
      return data as ClientInquiry[];
    },
    enabled: !!clientId,
  });
};

/**
 * Get unread inquiry count for a client
 */
export const useUnreadInquiryCount = (clientId: string) => {
  return useQuery({
    queryKey: ["client-inquiries-unread", clientId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("client_inquiries")
        .select("*", { count: "exact", head: true })
        .eq("client_id", clientId)
        .eq("is_read", false);

      if (error) {
        console.error("[useUnreadInquiryCount] Error:", error);
        throw error;
      }
      
      return count || 0;
    },
    enabled: !!clientId,
  });
};

/**
 * Get all clients with their unread inquiry counts
 */
export const useClientsWithUnreadInquiries = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["clients-unread-inquiries", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return {};
      
      const { data, error } = await supabase
        .from("client_inquiries")
        .select("client_id")
        .eq("user_id", effectiveOwnerId)
        .eq("is_read", false);

      if (error) {
        console.error("[useClientsWithUnreadInquiries] Error:", error);
        throw error;
      }
      
      // Count unread per client
      const countMap: Record<string, number> = {};
      (data || []).forEach(inquiry => {
        countMap[inquiry.client_id] = (countMap[inquiry.client_id] || 0) + 1;
      });
      
      return countMap;
    },
    enabled: !!effectiveOwnerId,
  });
};

/**
 * Mark an inquiry as read
 */
export const useMarkInquiryRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ inquiryId, clientId }: { inquiryId: string; clientId: string }) => {
      const { data, error } = await supabase
        .from("client_inquiries")
        .update({ is_read: true })
        .eq("id", inquiryId)
        .select()
        .single();

      if (error) {
        console.error("[useMarkInquiryRead] Error:", error);
        throw error;
      }

      return { data, clientId };
    },
    onSuccess: ({ clientId }) => {
      queryClient.invalidateQueries({ queryKey: ["client-inquiries", clientId] });
      queryClient.invalidateQueries({ queryKey: ["client-inquiries-unread", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients-unread-inquiries"] });
    },
    onError: (error: Error) => {
      console.error("[useMarkInquiryRead] Failed:", error);
      toast({
        title: "Error",
        description: "Failed to mark inquiry as read",
        variant: "destructive",
      });
    },
  });
};

/**
 * Mark all inquiries for a client as read
 */
export const useMarkAllInquiriesRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from("client_inquiries")
        .update({ is_read: true })
        .eq("client_id", clientId)
        .eq("is_read", false);

      if (error) {
        console.error("[useMarkAllInquiriesRead] Error:", error);
        throw error;
      }

      return clientId;
    },
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ["client-inquiries", clientId] });
      queryClient.invalidateQueries({ queryKey: ["client-inquiries-unread", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients-unread-inquiries"] });
      toast({
        title: "All inquiries marked as read",
      });
    },
    onError: (error: Error) => {
      console.error("[useMarkAllInquiriesRead] Failed:", error);
      toast({
        title: "Error",
        description: "Failed to mark inquiries as read",
        variant: "destructive",
      });
    },
  });
};

/**
 * Classify inquiry type based on message content
 */
export function classifyInquiryType(message: string, productType?: string): InquiryType {
  const lowerMessage = message.toLowerCase();
  
  // Check for product type first (indicates quote request)
  if (productType) {
    return "quote_request";
  }
  
  // Check for demo keywords
  if (lowerMessage.includes("demo") || lowerMessage.includes("demonstration") || lowerMessage.includes("trial")) {
    return "demo_request";
  }
  
  // Check for partnership keywords
  if (lowerMessage.includes("partner") || lowerMessage.includes("reseller") || lowerMessage.includes("distributor") || lowerMessage.includes("wholesale")) {
    return "partnership";
  }
  
  // Check for support keywords
  if (lowerMessage.includes("help") || lowerMessage.includes("issue") || lowerMessage.includes("problem") || lowerMessage.includes("bug") || lowerMessage.includes("support")) {
    return "support";
  }
  
  return "general";
}
