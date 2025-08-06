import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AccessRequest {
  id: string;
  requester_id: string;
  approver_id: string;
  record_type: 'client' | 'project' | 'appointment' | 'quote';
  record_id: string;
  request_reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  expires_at: string;
  requester?: {
    display_name: string;
    user_id: string;
  };
}

export const useAccessRequests = () => {
  return useQuery({
    queryKey: ["accessRequests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_requests")
        .select(`
          *,
          requester:requester_id(display_name, user_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });
};

export const useCreateAccessRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: {
      approver_id: string;
      record_type: string;
      record_id: string;
      request_reason?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("access_requests")
        .insert({
          requester_id: user.id,
          ...request,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessRequests"] });
      toast({
        title: "Access request sent",
        description: "Your request has been sent to the account owner.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send access request. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating access request:", error);
    },
  });
};

export const useUpdateAccessRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { data, error } = await supabase
        .from("access_requests")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["accessRequests"] });
      toast({
        title: `Request ${status}`,
        description: `The access request has been ${status}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update access request. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating access request:", error);
    },
  });
};

export const useCanEditRecord = (recordType: string, recordId: string, recordUserId: string, recordCreatedBy: string) => {
  return useQuery({
    queryKey: ["canEditRecord", recordType, recordId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('can_edit_record', {
        record_user_id: recordUserId,
        record_created_by: recordCreatedBy,
        record_type: recordType,
        record_id: recordId
      });

      if (error) throw error;
      return data as boolean;
    },
  });
};