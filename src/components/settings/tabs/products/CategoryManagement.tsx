
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useCreateProductCategory, useUpdateProductCategory, useDeleteProductCategory } from "@/hooks/useProductCategories";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  description?: string;
  markup_percentage?: number;
}

interface CategoryManagementProps {
  categories: Category[];
}

export const CategoryManagement = ({ categories }: CategoryManagementProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [markupPercentage, setMarkupPercentage] = useState("");

  const createCategory = useCreateProductCategory();
  const updateCategory = useUpdateProductCategory();
  const deleteCategory = useDeleteProductCategory();
  const { toast } = useToast();

  const resetForm = () => {
    setCategoryName("");
    setCategoryDescription("");
    setMarkupPercentage("");
    setEditingCategory(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    const categoryData = {
      name: categoryName.trim(),
      description: categoryDescription.trim() || undefined,
      markup_percentage: markupPercentage ? parseFloat(markupPercentage) : undefined,
    };

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory, ...categoryData });
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        await createCategory.mutateAsync(categoryData);
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setMarkupPercentage(category.markup_percentage?.toString() || "");
    setEditingCategory(category.id);
    setShowAddForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      try {
        await deleteCategory.mutateAsync(categoryId);
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete category. It may be in use by existing products.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-brand-primary">Product Categories</h4>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                {category.markup_percentage && (
                  <Badge variant="secondary" className="text-xs">
                    {category.markup_percentage}% markup
                  </Badge>
                )}
              </div>
              {category.description && (
                <p className="text-sm text-brand-neutral mt-1">{category.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No categories created yet</p>
            <Button 
              className="mt-2" 
              onClick={() => setShowAddForm(true)}
            >
              Create Your First Category
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Curtains, Blinds, Shutters"
                  required
                />
              </div>

              <div>
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Optional description for this category"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="markupPercentage">Default Markup (%)</Label>
                <Input
                  id="markupPercentage"
                  type="number"
                  step="0.1"
                  value={markupPercentage}
                  onChange={(e) => setMarkupPercentage(e.target.value)}
                  placeholder="e.g., 40"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-brand-primary hover:bg-brand-accent">
                  <Save className="h-4 w-4 mr-2" />
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
