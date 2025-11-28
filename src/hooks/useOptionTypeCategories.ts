import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OptionTypeCategory {
  id: string;
  user_id: string | null;
  account_id: string | null;
  treatment_category: string;
  type_key: string;
  type_label: string;
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
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      let query = supabase
        .from('option_type_categories')
        .select('*')
        .eq('active', true)
        .eq('hidden_by_user', false) // Filter out user-created hidden items
        .order('sort_order', { ascending: true })
        .order('type_label', { ascending: true });
      
      if (treatmentCategory) {
        query = query.eq('treatment_category', treatmentCategory);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Get user's hidden system defaults
      const { data: hiddenCategories } = await supabase
        .from('hidden_option_categories' as any)
        .select('option_type_category_id')
        .eq('user_id', user.id);
      
      const hiddenIds = new Set(hiddenCategories?.map((h: any) => h.option_type_category_id) || []);
      
      // Filter out system defaults that user has hidden
      const filtered = (data as OptionTypeCategory[]).filter(cat => {
        // Hide if it's a system default (no account_id) that the user has hidden
        if (!cat.account_id && hiddenIds.has(cat.id)) {
          return false;
        }
        return true;
      });
      
      return filtered;
    },
    enabled: !!treatmentCategory,
  });
};

export const useCreateOptionTypeCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (category: Omit<OptionTypeCategory, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'account_id' | 'active' | 'sort_order' | 'hidden_by_user'>) => {
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
      
      // Get user's account_id (owner's user_id or their own if they're the owner)
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('parent_account_id, user_id')
        .eq('user_id', session.user.id)
        .single();

      const accountId = userProfile?.parent_account_id || session.user.id;
      
      const insertData = {
        ...category,
        user_id: session.user.id,
        account_id: accountId,
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
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
  
  return useMutation({
    mutationFn: async ({ id, hidden, isSystemDefault }: { id: string; hidden: boolean; isSystemDefault?: boolean }) => {
      console.log('🔄 Updating option type visibility:', { id, hidden, isSystemDefault });
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      // For system defaults (no account_id), use hidden_option_categories table
      if (isSystemDefault) {
        if (hidden) {
          // Add to hidden list
          const { error } = await supabase
            .from('hidden_option_categories' as any)
            .insert({
              user_id: session.user.id,
              option_type_category_id: id
            });
          
          if (error && error.code !== '23505') { // Ignore duplicate key errors
            console.error('❌ Failed to hide system default:', error);
            throw error;
          }
        } else {
          // Remove from hidden list
          const { error } = await supabase
            .from('hidden_option_categories' as any)
            .delete()
            .eq('user_id', session.user.id)
            .eq('option_type_category_id', id);
          
          if (error) {
            console.error('❌ Failed to unhide system default:', error);
            throw error;
          }
        }
        
        console.log('✅ System default visibility updated');
        return { id, hidden };
      }
      
      // For user-created types, update hidden_by_user field
      const { data, error } = await supabase
        .from('option_type_categories')
        .update({ hidden_by_user: hidden, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Failed to update visibility:', error);
        throw error;
      }
      
      console.log('✅ Visibility updated successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('🔄 Invalidating queries after visibility change');
      
      // Aggressively invalidate and refetch all related queries
      queryClient.invalidateQueries({ 
        queryKey: ['option-type-categories'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['hidden-option-categories'],
        refetchType: 'active'
      });
      
      // Force immediate refetch
      queryClient.refetchQueries({ 
        queryKey: ['option-type-categories']
      });
      
      toast({
        title: variables.hidden ? "Option type hidden" : "Option type shown",
        description: variables.hidden 
          ? "This option type is now hidden from your view. Click 'Hidden' button to restore it." 
          : "This option type is now visible in your options.",
      });
    },
    onError: (error) => {
      console.error('❌ Visibility update failed:', error);
      toast({
        title: "Failed to update visibility",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useGetOptionTypeDeleteInfo = () => {
  return useMutation({
    mutationFn: async ({ 
      typeKey, 
      treatmentCategory 
    }: { 
      typeKey: string; 
      treatmentCategory: string;
    }) => {
      // Get count of treatment_options and their values
      const { data: treatmentOptions, error: fetchError } = await supabase
        .from('treatment_options')
        .select('id')
        .eq('key', typeKey)
        .eq('treatment_category', treatmentCategory);

      if (fetchError) throw fetchError;

      if (!treatmentOptions || treatmentOptions.length === 0) {
        return { optionCount: 0, valueCount: 0 };
      }

      // Get count of option_values
      const optionIds = treatmentOptions.map(opt => opt.id);
      const { count: valueCount, error: countError } = await supabase
        .from('option_values')
        .select('*', { count: 'exact', head: true })
        .in('option_id', optionIds);

      if (countError) throw countError;

      return { 
        optionCount: treatmentOptions.length,
        valueCount: valueCount || 0
      };
    },
  });
};

export const useDeleteOptionTypeCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      typeKey, 
      treatmentCategory 
    }: { 
      id: string; 
      typeKey: string; 
      treatmentCategory: string;
    }) => {
      // First, get all treatment_options for this type/category combo
      const { data: treatmentOptions, error: fetchError } = await supabase
        .from('treatment_options')
        .select('id')
        .eq('key', typeKey)
        .eq('treatment_category', treatmentCategory);

      if (fetchError) throw fetchError;

      // Delete option_values first (child records)
      if (treatmentOptions && treatmentOptions.length > 0) {
        const optionIds = treatmentOptions.map(opt => opt.id);
        
        const { error: valuesError } = await supabase
          .from('option_values')
          .delete()
          .in('option_id', optionIds);

        if (valuesError) throw valuesError;

        // Delete treatment_options
        const { error: optionsError } = await supabase
          .from('treatment_options')
          .delete()
          .in('id', optionIds);

        if (optionsError) throw optionsError;
      }

      // Finally, delete the option_type_category
      const { error: categoryError } = await supabase
        .from('option_type_categories')
        .delete()
        .eq('id', id);

      if (categoryError) throw categoryError;

      return { deletedOptions: treatmentOptions?.length || 0 };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['option-type-categories'] });
      queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['option-values'] });
      
      toast({
        title: "Type deleted from your account",
        description: `Deleted option type and ${data.deletedOptions} related option(s). Other accounts are not affected.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete option type.",
        variant: "destructive",
      });
    },
  });
};
