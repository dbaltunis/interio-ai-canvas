
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, FolderTree } from "lucide-react";
import { OptionCategory } from "@/hooks/useWindowCoveringCategories";

interface CategoryListProps {
  categories: OptionCategory[];
  onDeleteCategory: (id: string) => void;
  onDeleteSubcategory: (id: string, categoryId: string) => void;
  onCreateCategory: () => void;
}

export const CategoryList = ({ 
  categories, 
  onDeleteCategory, 
  onDeleteSubcategory, 
  onCreateCategory 
}: CategoryListProps) => {
  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-brand-neutral mb-4">No option categories created yet.</p>
          <Button 
            onClick={onCreateCategory}
            className="bg-brand-primary hover:bg-brand-accent"
          >
            Create Your First Category
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <FolderTree className="h-5 w-5 text-brand-primary" />
                  <h4 className="font-semibold text-brand-primary">{category.name}</h4>
                  {category.is_required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </div>
                {category.description && (
                  <p className="text-sm text-brand-neutral mt-1">{category.description}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => onDeleteCategory(category.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Subcategories */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="grid gap-2 ml-8">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{subcategory.name}</span>
                        <Badge variant="outline" className="text-xs">
                          £{subcategory.base_price} {subcategory.pricing_method}
                        </Badge>
                      </div>
                      {subcategory.description && (
                        <p className="text-sm text-gray-600 mt-1">{subcategory.description}</p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDeleteSubcategory(subcategory.id, category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {(!category.subcategories || category.subcategories.length === 0) && (
              <div className="ml-8 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">No subcategories yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
