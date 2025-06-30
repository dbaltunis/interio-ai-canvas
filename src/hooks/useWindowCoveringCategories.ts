
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OptionCategory {
  id: string;
  name: string;
  description?: string;
  is_required: boolean;
  sort_order: number;
  subcategories?: OptionSubcategory[];
}

export interface OptionSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  pricing_method: 'per-unit' | 'per-meter' | 'per-sqm' | 'fabric-based' | 'fixed' | 'percentage';
  base_price: number;
  fullness_ratio?: number;
  extra_fabric_percentage?: number;
  sort_order: number;
}

export const useWindowCoveringCategories = () => {
  const [categories, setCategories] = useState<OptionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('window_covering_option_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('window_covering_option_subcategories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (subcategoriesError) throw subcategoriesError;

      const categoriesWithSubcategories = (categoriesData || []).map(category => ({
        id: category.id,
        name: category.name,
        description: category.description || undefined,
        is_required: category.is_required,
        sort_order: category.sort_order,
        subcategories: (subcategoriesData || [])
          .filter(sub => sub.category_id === category.id)
          .map(sub => ({
            id: sub.id,
            category_id: sub.category_id,
            name: sub.name,
            description: sub.description || undefined,
            pricing_method: sub.pricing_method as OptionSubcategory['pricing_method'],
            base_price: sub.base_price,
            fullness_ratio: sub.fullness_ratio || undefined,
            extra_fabric_percentage: sub.extra_fabric_percentage || undefined,
            sort_order: sub.sort_order
          } as OptionSubcategory))
      } as OptionCategory));

      setCategories(categoriesWithSubcategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch option categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (category: Omit<OptionCategory, 'id' | 'subcategories'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('window_covering_option_categories')
        .insert([
          {
            ...category,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newCategory: OptionCategory = {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        is_required: data.is_required,
        sort_order: data.sort_order,
        subcategories: []
      };

      setCategories(prev => [...prev, newCategory].sort((a, b) => a.sort_order - b.sort_order));
      
      toast({
        title: "Success",
        description: "Category created successfully"
      });

      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createSubcategory = async (subcategory: Omit<OptionSubcategory, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('window_covering_option_subcategories')
        .insert([
          {
            ...subcategory,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newSubcategory: OptionSubcategory = {
        id: data.id,
        category_id: data.category_id,
        name: data.name,
        description: data.description || undefined,
        pricing_method: data.pricing_method as OptionSubcategory['pricing_method'],
        base_price: data.base_price,
        fullness_ratio: data.fullness_ratio || undefined,
        extra_fabric_percentage: data.extra_fabric_percentage || undefined,
        sort_order: data.sort_order
      };

      setCategories(prev => 
        prev.map(cat => 
          cat.id === subcategory.category_id
            ? {
                ...cat,
                subcategories: [...(cat.subcategories || []), newSubcategory].sort((a, b) => a.sort_order - b.sort_order)
              }
            : cat
        )
      );
      
      toast({
        title: "Success",
        description: "Subcategory created successfully"
      });

      return data;
    } catch (error) {
      console.error('Error creating subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to create subcategory",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('window_covering_option_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteSubcategory = async (id: string, categoryId: string) => {
    try {
      const { error } = await supabase
        .from('window_covering_option_subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId
            ? {
                ...cat,
                subcategories: (cat.subcategories || []).filter(sub => sub.id !== id)
              }
            : cat
        )
      );
      
      toast({
        title: "Success",
        description: "Subcategory deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to delete subcategory",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    createCategory,
    createSubcategory,
    deleteCategory,
    deleteSubcategory,
    refetch: fetchCategories
  };
};
