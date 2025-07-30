import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SMSTemplate {
  id: string;
  user_id: string;
  name: string;
  message: string;
  template_type: string;
  variables: any[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSMSTemplates = () => {
  return useQuery({
    queryKey: ["sms-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_templates")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SMSTemplate[];
    },
  });
};

export const useCreateSMSTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<SMSTemplate, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("sms_templates")
        .insert([{ ...template, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-templates"] });
      toast.success("SMS template created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create SMS template: ${error.message}`);
    },
  });
};

export const useUpdateSMSTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SMSTemplate> }) => {
      const { data, error } = await supabase
        .from("sms_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-templates"] });
      toast.success("SMS template updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update SMS template: ${error.message}`);
    },
  });
};