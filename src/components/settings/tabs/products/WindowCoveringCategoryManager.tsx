
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useWindowCoveringCategories } from "@/hooks/useWindowCoveringCategories";
import { CategoryForm } from "./category-manager/CategoryForm";
import { CategoryList } from "./category-manager/CategoryList";

export const WindowCoveringCategoryManager = () => {
  const { 
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
    deleteExtra
  } = useWindowCoveringCategories();
  
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = async (categoryData: any) => {
    try {
      await createCategory(categoryData);
      setIsCreating(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading option categories...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Option Categories</CardTitle>
          <CardDescription>
            Manage option categories and subcategories for window coverings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-brand-neutral">
              Create categories like "Heading", "Lining", or "Services" with their respective options
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Create Category Form */}
          {isCreating && (
            <div className="mb-6">
              <CategoryForm
                onSave={handleSave}
                onCancel={() => setIsCreating(false)}
                isEditing={false}
              />
            </div>
          )}

          {/* Categories List */}
          <CategoryList
            categories={categories}
            onDeleteCategory={deleteCategory}
            onDeleteSubcategory={deleteSubcategory}
            onDeleteSubSubcategory={deleteSubSubcategory}
            onDeleteExtra={deleteExtra}
            onCreateSubcategory={createSubcategory}
            onCreateSubSubcategory={createSubSubcategory}
            onCreateExtra={createExtra}
            onUpdateCategory={updateCategory}
            onUpdateSubcategory={updateSubcategory}
          />
        </CardContent>
      </Card>
    </div>
  );
};
