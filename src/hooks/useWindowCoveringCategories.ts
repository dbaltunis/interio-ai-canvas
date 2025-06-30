
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OptionCategory, OptionSubcategory } from './types/windowCoveringTypes';
import { 
  fetchCategoriesFromDB,
  createCategoryInDB,
  createSubcategoryInDB,
  deleteCategoryFromDB,
  deleteSubcategoryFromDB
} from './api/windowCoveringCategoriesApi';

export type { OptionCategory, OptionSubcategory };

export const useWindowCoveringCategories = () => {
  const [categories, setCategories] = useState<OptionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const categoriesWithSubcategories = await fetchCategoriesFromDB();
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
      const newCategory = await createCategoryInDB(category);
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
      const newSubcategory = await createSubcategoryInDB(subcategory);

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
      await deleteCategoryFromDB(id);
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
