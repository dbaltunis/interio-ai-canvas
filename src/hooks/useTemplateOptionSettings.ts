import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

interface TemplateOptionSetting {
  id: string;
  template_id: string;
  treatment_option_id: string;
  is_enabled: boolean;
  order_index: number | null;
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
        .eq('template_id', templateId)
        .order('order_index', { ascending: true, nullsFirst: false });

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
        // Create new setting
        const { error } = await supabase
          .from('template_option_settings')
          .insert({
            template_id: templateId,
            treatment_option_id: treatmentOptionId,
            is_enabled: isEnabled,
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

export const useUpdateTemplateOptionOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      templateId,
      orderedOptions,
    }: {
      templateId: string;
      orderedOptions: { treatmentOptionId: string; orderIndex: number }[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Update each option's order
      for (const opt of orderedOptions) {
        // Check if setting exists
        const { data: existing } = await supabase
          .from('template_option_settings')
          .select('id')
          .eq('template_id', templateId)
          .eq('treatment_option_id', opt.treatmentOptionId)
          .maybeSingle();

        if (existing) {
          // Update existing setting with order
          const { error } = await supabase
            .from('template_option_settings')
            .update({ order_index: opt.orderIndex })
            .eq('id', existing.id);

          if (error) {
            console.error('Error updating option order:', error);
            throw error;
          }
        } else {
          // Create new setting with order
          const { error } = await supabase
            .from('template_option_settings')
            .insert({
              template_id: templateId,
              treatment_option_id: opt.treatmentOptionId,
              is_enabled: true,
              order_index: opt.orderIndex,
            });

          if (error) {
            console.error('Error creating option order:', error);
            throw error;
          }
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['template-option-settings', variables.templateId] 
      });
      toast.success("Option order saved");
    },
    onError: (error) => {
      console.error("Error updating option order:", error);
      toast.error("Failed to update option order");
    },
  });
};
