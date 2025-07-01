
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WindowCoveringOption {
  id: string;
  window_covering_id: string;
  option_type: string;
  name: string;
  description?: string;
  cost_type: string;
  base_cost: number;
  is_required: boolean;
  is_default: boolean;
  sort_order: number;
  image_url?: string;
  specifications?: any;
}

// New interface for hierarchical options
export interface HierarchicalOption {
  id: string;
  name: string;
  description?: string;
  option_type: string;
  base_cost: number;
  is_required: boolean;
  is_default: boolean;
  sort_order: number;
  image_url?: string;
  cost_type: string;
  pricing_method?: string;
  subcategories?: {
    id: string;
    name: string;
    description?: string;
    base_price: number;
    pricing_method: string;
    image_url?: string;
    sub_subcategories?: {
      id: string;
      name: string;
      description?: string;
      base_price: number;
      pricing_method: string;
      image_url?: string;
      extras?: {
        id: string;
        name: string;
        description?: string;
        base_price: number;
        pricing_method: string;
        image_url?: string;
        is_required: boolean;
        is_default: boolean;
      }[];
    }[];
  }[];
}

export const useWindowCoveringOptions = (windowCoveringId: string) => {
  const [options, setOptions] = useState<WindowCoveringOption[]>([]);
  const [hierarchicalOptions, setHierarchicalOptions] = useState<HierarchicalOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchOptions = async () => {
    console.log('useWindowCoveringOptions - fetchOptions called with ID:', windowCoveringId);
    
    if (!windowCoveringId) {
      console.log('useWindowCoveringOptions - No window covering ID provided');
      setOptions([]);
      setHierarchicalOptions([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('useWindowCoveringOptions - Fetching options for window covering:', windowCoveringId);
      
      // Fetch traditional options
      const { data: traditionalOptions, error: traditionalError } = await supabase
        .from('window_covering_options')
        .select('*')
        .eq('window_covering_id', windowCoveringId)
        .order('sort_order', { ascending: true });

      if (traditionalError) {
        console.error('useWindowCoveringOptions - Error fetching traditional options:', traditionalError);
        throw traditionalError;
      }

      // Fetch hierarchical options through assignments - first fetch assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('window_covering_option_assignments')
        .select('category_id')
        .eq('window_covering_id', windowCoveringId);

      if (assignmentsError) {
        console.error('useWindowCoveringOptions - Error fetching assignments:', assignmentsError);
        // Don't throw here, just log and continue with empty hierarchical data
      }

      let hierarchicalData: HierarchicalOption[] = [];

      // If we have assignments, fetch the full category data
      if (assignments && assignments.length > 0) {
        const categoryIds = assignments.map(a => a.category_id);
        
        const { data: categories, error: categoriesError } = await supabase
          .from('window_covering_option_categories')
          .select(`
            id,
            name,
            description,
            is_required,
            image_url,
            sort_order,
            window_covering_option_subcategories (
              id,
              name,
              description,
              base_price,
              pricing_method,
              image_url,
              sort_order,
              window_covering_option_sub_subcategories (
                id,
                name,
                description,
                base_price,
                pricing_method,
                image_url,
                sort_order,
                window_covering_option_extras (
                  id,
                  name,
                  description,
                  base_price,
                  pricing_method,
                  image_url,
                  is_required,
                  is_default,
                  sort_order
                )
              )
            )
          `)
          .in('id', categoryIds)
          .order('sort_order', { ascending: true });

        if (categoriesError) {
          console.error('useWindowCoveringOptions - Error fetching categories:', categoriesError);
        } else if (categories) {
          // Transform the category data into hierarchical options
          hierarchicalData = categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            option_type: 'category',
            base_cost: 0,
            is_required: category.is_required,
            is_default: false,
            sort_order: category.sort_order,
            image_url: category.image_url,
            cost_type: 'fixed',
            pricing_method: 'fixed',
            subcategories: category.window_covering_option_subcategories?.map(sub => ({
              id: sub.id,
              name: sub.name,
              description: sub.description,
              base_price: sub.base_price,
              pricing_method: sub.pricing_method,
              image_url: sub.image_url,
              sub_subcategories: sub.window_covering_option_sub_subcategories?.map(subSub => ({
                id: subSub.id,
                name: subSub.name,
                description: subSub.description,
                base_price: subSub.base_price,
                pricing_method: subSub.pricing_method,
                image_url: subSub.image_url,
                extras: subSub.window_covering_option_extras?.map(extra => ({
                  id: extra.id,
                  name: extra.name,
                  description: extra.description,
                  base_price: extra.base_price,
                  pricing_method: extra.pricing_method,
                  image_url: extra.image_url,
                  is_required: extra.is_required,
                  is_default: extra.is_default
                })) || []
              })) || []
            })) || []
          }));
        }
      }
      
      console.log('useWindowCoveringOptions - Found traditional options:', traditionalOptions?.length || 0);
      console.log('useWindowCoveringOptions - Found hierarchical options:', hierarchicalData.length);
      
      setOptions(traditionalOptions || []);
      setHierarchicalOptions(hierarchicalData);
    } catch (error) {
      console.error('useWindowCoveringOptions - Error fetching options:', error);
      toast({
        title: "Error",
        description: "Failed to fetch options",
        variant: "destructive"
      });
      setOptions([]);
      setHierarchicalOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createOption = async (option: Omit<WindowCoveringOption, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('window_covering_options')
        .insert([
          {
            ...option,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setOptions(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
      
      toast({
        title: "Success",
        description: "Option created successfully"
      });

      return data;
    } catch (error) {
      console.error('Error creating option:', error);
      toast({
        title: "Error",
        description: "Failed to create option",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateOption = async (id: string, updates: Partial<WindowCoveringOption>) => {
    try {
      const { data, error } = await supabase
        .from('window_covering_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOptions(prev => 
        prev.map(opt => opt.id === id ? { ...opt, ...data } : opt)
          .sort((a, b) => a.sort_order - b.sort_order)
      );

      toast({
        title: "Success",
        description: "Option updated successfully"
      });

      return data;
    } catch (error) {
      console.error('Error updating option:', error);
      toast({
        title: "Error",
        description: "Failed to update option",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteOption = async (id: string) => {
    try {
      const { error } = await supabase
        .from('window_covering_options')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOptions(prev => prev.filter(opt => opt.id !== id));
      
      toast({
        title: "Success",
        description: "Option deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting option:', error);
      toast({
        title: "Error",
        description: "Failed to delete option",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    console.log('useWindowCoveringOptions - useEffect triggered, windowCoveringId:', windowCoveringId);
    fetchOptions();
  }, [windowCoveringId]);

  console.log('useWindowCoveringOptions - Returning:', { 
    options: options?.length || 0, 
    hierarchicalOptions: hierarchicalOptions?.length || 0,
    isLoading, 
    windowCoveringId 
  });

  return {
    options,
    hierarchicalOptions,
    isLoading,
    createOption,
    updateOption,
    deleteOption,
    refetch: fetchOptions
  };
};
