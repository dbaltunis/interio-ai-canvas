
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface QuoteTemplate {
  id: string;
  name: string;
  status: 'active' | 'draft';
  blocks: any[];
  blockSettings?: any;
  template_type?: string;
  styling?: any;
  created_at: string;
  updated_at: string;
}

export const useQuoteTemplates = () => {
  return useQuery({
    queryKey: ["quote-templates"],
    queryFn: async () => {
      try {
        // Fetch templates ordered by: primary first, then display_order, then created_at
        const { data: dbTemplates, error } = await supabase
          .from('quote_templates')
          .select('*')
          .order('is_primary', { ascending: false, nullsFirst: false })
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching quote templates:', error);
        }

        if (dbTemplates && dbTemplates.length > 0) {
          return dbTemplates.map(template => ({
            id: template.id,
            name: template.name,
            status: 'active' as const,
            blocks: (template.blocks as any) || [],
            blockSettings: (template as any).blockSettings,
            template_type: (template as any).template_type || template.template_style,
            styling: (template as any).styling,
            is_primary: template.is_primary || false,
            display_order: template.display_order || 0,
            created_at: template.created_at,
            updated_at: template.updated_at || template.created_at,
          }));
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }

      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useActiveQuoteTemplates = () => {
  const { data: templates, ...rest } = useQuoteTemplates();
  
  return {
    data: templates?.filter(template => template.status === 'active') || [],
    ...rest
  };
};
