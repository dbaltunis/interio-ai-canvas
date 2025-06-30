
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useWindowCoveringCategories } from "@/hooks/useWindowCoveringCategories";
import { CategoryForm } from "./category-manager/CategoryForm";
import { SubcategoryForm } from "./category-manager/SubcategoryForm";
import { CategoryList } from "./category-manager/CategoryList";

export const WindowCoveringCategoryManager = () => {
  const { 
    categories, 
    isLoading, 
    createCategory, 
    createSubcategory, 
    deleteCategory, 
    deleteSubcategory 
  } = useWindowCoveringCategories();
  
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);

  const handleCreateCategory = async (categoryData: any) => {
    try {
      await createCategory(categoryData);
      setIsCreatingCategory(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCreateSubcategory = async (subcategoryData: any) => {
    try {
      await createSubcategory(subcategoryData);
      setIsCreatingSubcategory(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-medium text-brand-primary">Option Categories</h4>
          <p className="text-sm text-brand-neutral">Manage option categories and subcategories for window coverings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreatingSubcategory(true)}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subcategory
          </Button>
          <Button 
            onClick={() => setIsCreatingCategory(true)}
            className="bg-brand-primary hover:bg-brand-accent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <CategoryForm
        isVisible={isCreatingCategory}
        onClose={() => setIsCreatingCategory(false)}
        onSubmit={handleCreateCategory}
        categoriesLength={categories.length}
      />

      <SubcategoryForm
        isVisible={isCreatingSubcategory}
        onClose={() => setIsCreatingSubcategory(false)}
        onSubmit={handleCreateSubcategory}
        categories={categories}
      />

      <CategoryList
        categories={categories}
        onDeleteCategory={deleteCategory}
        onDeleteSubcategory={deleteSubcategory}
        onCreateCategory={() => setIsCreatingCategory(true)}
      />
    </div>
  );
};
