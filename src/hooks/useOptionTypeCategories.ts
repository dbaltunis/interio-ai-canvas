import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OptionTypeCategory {
  id: string;
  user_id: string | null;
  treatment_category: string;
  type_key: string;
  type_label: string;
  is_system_default: boolean;
  active: boolean;
  sort_order: number;
  hidden_by_user: boolean;
  created_at: string;
  updated_at: string;
}

export const useOptionTypeCategories = (treatmentCategory?: string) => {
  return useQuery({
    queryKey: ['option-type-categories', treatmentCategory],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('option_type_categories')
        .select('*')
        .eq('active', true)
        .eq('hidden_by_user', false) // Filter out hidden items
        .order('sort_order', { ascending: true })
        .order('type_label', { ascending: true });
      
      if (treatmentCategory) {
        query = query.eq('treatment_category', treatmentCategory);
      }
      
      // Get system defaults OR user's own option types
      if (user) {
        query = query.or(`is_system_default.eq.true,user_id.eq.${user.id}`);
      } else {
        query = query.eq('is_system_default', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as OptionTypeCategory[];
    },
    enabled: !!treatmentCategory,
  });
};

export const useCreateOptionTypeCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (category: Omit<OptionTypeCategory, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'is_system_default' | 'active' | 'sort_order' | 'hidden_by_user'>) => {
      // Use getSession() instead of getUser() to get the session with auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔐 Creating option type - Session check:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        sessionError 
      });
      
      if (sessionError || !session?.user) {
        console.error('Session check failed:', sessionError);
        throw new Error('Authentication session missing. Please sign in again.');
      }
      
      // Get the maximum sort_order for this treatment category to append at the end
      const { data: existingCategories } = await supabase
        .from('option_type_categories')
        .select('sort_order')
        .eq('treatment_category', category.treatment_category)
        .order('sort_order', { ascending: false })
        .limit(1);
      
      const maxSortOrder = existingCategories?.[0]?.sort_order ?? -1;
      
      const insertData = {
        ...category,
        user_id: session.user.id,
        is_system_default: false,
        active: true,
        sort_order: maxSortOrder + 1, // Always append at the end
        hidden_by_user: false,
      };
      
      console.log('📝 Inserting option type:', insertData);
      
      const { data, error } = await supabase
        .from('option_type_categories')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      
      console.log('✅ Option type created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-type-categories'] });
      toast({
        title: "Option type created",
        description: "You can now add values to this option type.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create option type",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useToggleOptionTypeVisibility = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, hidden }: { id: string; hidden: boolean }) => {
      const { error } = await supabase
        .from('option_type_categories')
        .update({ hidden_by_user: hidden })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['option-type-categories'] });
      toast({
        title: variables.hidden ? "Option type hidden" : "Option type shown",
        description: variables.hidden 
          ? "This option type is now hidden from your view." 
          : "This option type is now visible.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update visibility",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
