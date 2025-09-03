import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NotificationTemplate {
  id: string;
  user_id: string;
  name: string;
  type: 'email' | 'sms' | 'both';
  category: 'appointment_reminder' | 'follow_up' | 'project_update' | 'custom';
  subject?: string;
  message: string;
  variables: string[];
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotificationTemplates = () => {
  return useQuery({
    queryKey: ["notification-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as NotificationTemplate[];
    },
  });
};

export const useCreateNotificationTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: Partial<NotificationTemplate> & { name: string; message: string; type: string; category: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("notification_templates")
        .insert({
          user_id: user.id,
          ...template,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      toast({
        title: "Template created",
        description: "Your notification template has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating template:", error);
    },
  });
};

export const useUpdateNotificationTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NotificationTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("notification_templates")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      toast({
        title: "Template updated",
        description: "Your notification template has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating template:", error);
    },
  });
};

export const useDeleteNotificationTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notification_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      toast({
        title: "Template deleted",
        description: "The notification template has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting template:", error);
    },
  });
};