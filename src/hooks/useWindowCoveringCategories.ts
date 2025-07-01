import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OptionCategory, OptionSubcategory, OptionSubSubcategory, OptionExtra } from './types/windowCoveringTypes';
import { 
  fetchCategoriesFromDB,
  createCategoryInDB,
  createSubcategoryInDB,
  createSubSubcategoryInDB,
  createExtraInDB,
  deleteCategoryFromDB,
  deleteSubcategoryFromDB,
  deleteSubSubcategoryFromDB,
  deleteExtraFromDB
} from './api/windowCoveringCategoriesApi';

export type { OptionCategory, OptionSubcategory, OptionSubSubcategory, OptionExtra };

export const useWindowCoveringCategories = () => {
  const [categories, setCategories] = useState<OptionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    console.log('useWindowCoveringCategories - Fetching categories...');
    try {
      const categoriesWithHierarchy = await fetchCategoriesFromDB();
      console.log('useWindowCoveringCategories - Categories fetched:', categoriesWithHierarchy);
      setCategories(categoriesWithHierarchy);
    } catch (error) {
      console.error('useWindowCoveringCategories - Error fetching categories:', error);
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
    console.log('useWindowCoveringCategories - Creating category:', category);
    try {
      const newCategory = await createCategoryInDB(category);
      console.log('useWindowCoveringCategories - Category created:', newCategory);
      
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.sort_order - b.sort_order));
      
      toast({
        title: "Success",
        description: "Category created successfully"
      });

      return newCategory;
    } catch (error) {
      console.error('useWindowCoveringCategories - Error creating category:', error);
      toast({
        title: "Error",
        description: `Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<OptionCategory>) => {
    console.log('useWindowCoveringCategories - Updating category:', id, updates);
    try {
      const { data, error } = await supabase
        .from('window_covering_option_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => 
          cat.id === id ? { ...cat, ...data } : cat
        ).sort((a, b) => a.sort_order - b.sort_order)
      );
      
      toast({
        title: "Success",
        description: "Category updated successfully"
      });

      return data;
    } catch (error) {
      console.error('useWindowCoveringCategories - Error updating category:', error);
      toast({
        title: "Error",
        description: `Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const createSubcategory = async (subcategory: Omit<OptionSubcategory, 'id'>) => {
    console.log('useWindowCoveringCategories - Creating subcategory:', subcategory);
    try {
      const newSubcategory = await createSubcategoryInDB(subcategory);
      console.log('useWindowCoveringCategories - Subcategory created:', newSubcategory);

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

      return newSubcategory;
    } catch (error) {
      console.error('useWindowCoveringCategories - Error creating subcategory:', error);
      toast({
        title: "Error",
        description: `Failed to create subcategory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSubcategory = async (id: string, updates: Partial<OptionSubcategory>) => {
    console.log('useWindowCoveringCategories - Updating subcategory:', id, updates);
    try {
      const { data, error } = await supabase
        .from('window_covering_option_subcategories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        pricing_method: data.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage'
      };

      setCategories(prev => 
        prev.map(cat => ({
          ...cat,
          subcategories: cat.subcategories?.map(sub => 
            sub.id === id ? { ...sub, ...typedData } : sub
          ).sort((a, b) => a.sort_order - b.sort_order)
        }))
      );
      
      toast({
        title: "Success",
        description: "Subcategory updated successfully"
      });

      return typedData;
    } catch (error) {
      console.error('useWindowCoveringCategories - Error updating subcategory:', error);
      toast({
        title: "Error",
        description: `Failed to update subcategory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const createSubSubcategory = async (subSubcategory: Omit<OptionSubSubcategory, 'id' | 'extras'>) => {
    console.log('useWindowCoveringCategories - Creating sub-subcategory:', subSubcategory);
    try {
      const newSubSubcategory = await createSubSubcategoryInDB(subSubcategory);
      console.log('useWindowCoveringCategories - Sub-subcategory created:', newSubSubcategory);

      setCategories(prev => 
        prev.map(cat => ({
          ...cat,
          subcategories: cat.subcategories?.map(sub =>
            sub.id === subSubcategory.subcategory_id
              ? {
                  ...sub,
                  sub_subcategories: [...(sub.sub_subcategories || []), newSubSubcategory].sort((a, b) => a.sort_order - b.sort_order)
                }
              : sub
          )
        }))
      );
      
      toast({
        title: "Success",
        description: "Sub-subcategory created successfully"
      });

      return newSubSubcategory;
    } catch (error) {
      console.error('useWindowCoveringCategories - Error creating sub-subcategory:', error);
      toast({
        title: "Error",
        description: `Failed to create sub-subcategory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const createExtra = async (extra: Omit<OptionExtra, 'id'>) => {
    console.log('useWindowCoveringCategories - Creating extra:', extra);
    try {
      const newExtra = await createExtraInDB(extra);
      console.log('useWindowCoveringCategories - Extra created:', newExtra);

      setCategories(prev => 
        prev.map(cat => ({
          ...cat,
          subcategories: cat.subcategories?.map(sub => ({
            ...sub,
            sub_subcategories: sub.sub_subcategories?.map(subSub =>
              subSub.id === extra.sub_subcategory_id
                ? {
                    ...subSub,
                    extras: [...(subSub.extras || []), newExtra].sort((a, b) => a.sort_order - b.sort_order)
                  }
                : subSub
            )
          }))
        }))
      );
      
      toast({
        title: "Success",
        description: "Extra created successfully"
      });

      return newExtra;
    } catch (error) {
      console.error('useWindowCoveringCategories - Error creating extra:', error);
      toast({
        title: "Error",
        description: `Failed to create extra: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    console.log('useWindowCoveringCategories - Deleting category:', id);
    try {
      await deleteCategoryFromDB(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    } catch (error) {
      console.error('useWindowCoveringCategories - Error deleting category:', error);
      toast({
        title: "Error",
        description: `Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteSubcategory = async (id: string, categoryId: string) => {
    console.log('useWindowCoveringCategories - Deleting subcategory:', id, categoryId);
    try {
      await deleteSubcategoryFromDB(id);

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
      console.error('useWindowCoveringCategories - Error deleting subcategory:', error);
      toast({
        title: "Error",
        description: `Failed to delete subcategory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteSubSubcategory = async (id: string, subcategoryId: string) => {
    console.log('useWindowCoveringCategories - Deleting sub-subcategory:', id, subcategoryId);
    try {
      await deleteSubSubcategoryFromDB(id);

      setCategories(prev => 
        prev.map(cat => ({
          ...cat,
          subcategories: cat.subcategories?.map(sub =>
            sub.id === subcategoryId
              ? {
                  ...sub,
                  sub_subcategories: (sub.sub_subcategories || []).filter(subSub => subSub.id !== id)
                }
              : sub
          )
        }))
      );
      
      toast({
        title: "Success",
        description: "Sub-subcategory deleted successfully"
      });
    } catch (error) {
      console.error('useWindowCoveringCategories - Error deleting sub-subcategory:', error);
      toast({
        title: "Error",
        description: `Failed to delete sub-subcategory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteExtra = async (id: string, subSubcategoryId: string) => {
    console.log('useWindowCoveringCategories - Deleting extra:', id, subSubcategoryId);
    try {
      await deleteExtraFromDB(id);

      setCategories(prev => 
        prev.map(cat => ({
          ...cat,
          subcategories: cat.subcategories?.map(sub => ({
            ...sub,
            sub_subcategories: sub.sub_subcategories?.map(subSub =>
              subSub.id === subSubcategoryId
                ? {
                    ...subSub,
                    extras: (subSub.extras || []).filter(extra => extra.id !== id)
                  }
                : subSub
            )
          }))
        }))
      );
      
      toast({
        title: "Success",
        description: "Extra deleted successfully"
      });
    } catch (error) {
      console.error('useWindowCoveringCategories - Error deleting extra:', error);
      toast({
        title: "Error",
        description: `Failed to delete extra: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    updateCategory,
    createSubcategory,
    updateSubcategory,
    createSubSubcategory,
    createExtra,
    deleteCategory,
    deleteSubcategory,
    deleteSubSubcategory,
    deleteExtra,
    refetch: fetchCategories
  };
};
