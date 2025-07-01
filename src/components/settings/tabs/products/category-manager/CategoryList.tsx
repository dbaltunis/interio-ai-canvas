
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { type OptionCategory } from "@/hooks/useWindowCoveringCategories";
import { SubcategoryForm } from "./SubcategoryForm";
import { CategoryForm } from "./CategoryForm";

interface CategoryListProps {
  categories: OptionCategory[];
  onDeleteCategory: (id: string) => void;
  onDeleteSubcategory: (id: string, categoryId: string) => void;
  onCreateSubcategory: (subcategory: any) => void;
  onUpdateCategory: (id: string, updates: any) => void;
  onUpdateSubcategory: (id: string, updates: any) => void;
}

export const CategoryList = ({ 
  categories, 
  onDeleteCategory, 
  onDeleteSubcategory, 
  onCreateSubcategory,
  onUpdateCategory,
  onUpdateSubcategory
}: CategoryListProps) => {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [addingSubcategoryToCategoryId, setAddingSubcategoryToCategoryId] = useState<string | null>(null);

  const handleCategoryEdit = (category: OptionCategory) => {
    setEditingCategoryId(category.id);
  };

  const handleCategoryUpdate = async (updates: any) => {
    if (editingCategoryId) {
      await onUpdateCategory(editingCategoryId, updates);
      setEditingCategoryId(null);
    }
  };

  const handleSubcategoryEdit = (subcategoryId: string) => {
    setEditingSubcategoryId(subcategoryId);
  };

  const handleSubcategoryUpdate = async (updates: any) => {
    if (editingSubcategoryId) {
      await onUpdateSubcategory(editingSubcategoryId, updates);
      setEditingSubcategoryId(null);
    }
  };

  const handleSubcategoryCreate = async (subcategory: any) => {
    await onCreateSubcategory(subcategory);
    setAddingSubcategoryToCategoryId(null);
  };

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-brand-neutral">No option categories created yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id} className="overflow-hidden">
          {editingCategoryId === category.id ? (
            <CardContent className="p-4">
              <CategoryForm
                category={category}
                onSave={handleCategoryUpdate}
                onCancel={() => setEditingCategoryId(null)}
                isEditing={true}
              />
            </CardContent>
          ) : (
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {category.image_url && (
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-brand-primary">{category.name}</h4>
                      {category.is_required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-brand-neutral">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAddingSubcategoryToCategoryId(category.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Subcategory
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCategoryEdit(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Subcategories */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="space-y-2 ml-6">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id}>
                      {editingSubcategoryId === subcategory.id ? (
                        <SubcategoryForm
                          subcategory={subcategory}
                          categoryId={category.id}
                          onSave={handleSubcategoryUpdate}
                          onCancel={() => setEditingSubcategoryId(null)}
                          isEditing={true}
                        />
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {subcategory.image_url && (
                              <img 
                                src={subcategory.image_url} 
                                alt={subcategory.name}
                                className="w-12 h-12 object-cover rounded border"
                              />
                            )}
                            <div>
                              <span className="font-medium">{subcategory.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                £{subcategory.base_price} {subcategory.pricing_method}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSubcategoryEdit(subcategory.id)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onDeleteSubcategory(subcategory.id, category.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Subcategory Form */}
              {addingSubcategoryToCategoryId === category.id && (
                <div className="mt-4 ml-6">
                  <SubcategoryForm
                    categoryId={category.id}
                    onSave={handleSubcategoryCreate}
                    onCancel={() => setAddingSubcategoryToCategoryId(null)}
                    isEditing={false}
                  />
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
