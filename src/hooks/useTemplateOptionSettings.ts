import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

interface TemplateOptionSetting {
  id: string;
  template_id: string;
  treatment_option_id: string;
  is_enabled: boolean;
}

export const useTemplateOptionSettings = (templateId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['template-option-settings', templateId],
    queryFn: async () => {
      if (!templateId || !user) return [];

      const { data, error } = await supabase
        .from('template_option_settings')
        .select('*')
        .eq('template_id', templateId);

      if (error) throw error;
      return data as TemplateOptionSetting[];
    },
    enabled: !!templateId && !!user,
  });
};

export const useToggleTemplateOption = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      templateId,
      treatmentOptionId,
      isEnabled,
    }: {
      templateId: string;
      treatmentOptionId: string;
      isEnabled: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Get user's org_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get org_id (account owner id)
      const { data: orgIdResult, error: orgError } = await supabase
        .rpc('get_user_account_id', { p_user_id: user.id });

      if (orgError) throw orgError;
      const orgId = orgIdResult;

      // Check if setting exists
      const { data: existing } = await supabase
        .from('template_option_settings')
        .select('id')
        .eq('template_id', templateId)
        .eq('treatment_option_id', treatmentOptionId)
        .maybeSingle();

      if (existing) {
        // Update existing setting
        const { error } = await supabase
          .from('template_option_settings')
          .update({ is_enabled: isEnabled })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating template option setting:', error);
          throw error;
        }
      } else {
        // Create new setting with org_id
        const { error } = await supabase
          .from('template_option_settings')
          .insert({
            template_id: templateId,
            treatment_option_id: treatmentOptionId,
            is_enabled: isEnabled,
            org_id: orgId,
          });

        if (error) {
          console.error('Error creating template option setting:', error);
          throw error;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['template-option-settings', variables.templateId] 
      });
      toast.success(
        variables.isEnabled 
          ? "Option enabled for this template" 
          : "Option disabled for this template"
      );
    },
    onError: (error) => {
      console.error("Error toggling template option:", error);
      toast.error("Failed to update template option");
    },
  });
};
