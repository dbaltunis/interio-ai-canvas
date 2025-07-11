
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Settings, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useWindowCoveringCategories } from "@/hooks/useWindowCoveringCategories";
import { blindHeadrailCategories, blindHeadrailSubcategories } from "./BlindHeadrailCategories";

interface CategoryQuickAddProps {
  onCategoriesAdded: () => void;
}

export const CategoryQuickAdd = ({ onCategoriesAdded }: CategoryQuickAddProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const { createCategory, createSubcategory } = useWindowCoveringCategories();

  const handleAddBlindCategories = async () => {
    setIsAdding(true);
    try {
      console.log('Adding blind headrail categories...');
      
      // Create categories and their subcategories
      for (const categoryData of blindHeadrailCategories) {
        const category = await createCategory(categoryData);
        console.log('Created category:', category);
        
        // Add subcategories for this category
        const subcategories = blindHeadrailSubcategories[categoryData.name];
        if (subcategories) {
          for (const subData of subcategories) {
            await createSubcategory({
              ...subData,
              category_id: category.id
            });
            console.log('Created subcategory:', subData.name);
          }
        }
      }
      
      toast.success("Blind headrail categories added successfully!");
      onCategoriesAdded();
    } catch (error) {
      console.error('Error adding blind categories:', error);
      toast.error("Failed to add blind categories");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-brand-primary" />
          Quick Add Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Blind Headrail System</h4>
                <p className="text-sm text-muted-foreground">
                  Add complete headrail categories including standard/heavy duty rails, 
                  chain controls (left/right/extended), and motorization options 
                  (battery/mains/solar with remotes and smart controls)
                </p>
              </div>
            </div>
            <Button 
              onClick={handleAddBlindCategories}
              disabled={isAdding}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              {isAdding ? 'Adding...' : 'Add Categories'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
