
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";
import { useWindowCoveringCategories } from "@/hooks/useWindowCoveringCategories";

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    is_required: false,
    sort_order: 0
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    category_id: '',
    name: '',
    description: '',
    pricing_method: 'per-unit' as const,
    base_price: 0,
    fullness_ratio: undefined as number | undefined,
    extra_fabric_percentage: undefined as number | undefined,
    sort_order: 0
  });

  const handleCreateCategory = async () => {
    try {
      await createCategory({
        ...categoryForm,
        sort_order: categories.length
      });
      setCategoryForm({
        name: '',
        description: '',
        is_required: false,
        sort_order: 0
      });
      setIsCreatingCategory(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCreateSubcategory = async () => {
    try {
      const category = categories.find(c => c.id === subcategoryForm.category_id);
      await createSubcategory({
        ...subcategoryForm,
        sort_order: category?.subcategories?.length || 0
      });
      setSubcategoryForm({
        category_id: '',
        name: '',
        description: '',
        pricing_method: 'per-unit',
        base_price: 0,
        fullness_ratio: undefined,
        extra_fabric_percentage: undefined,
        sort_order: 0
      });
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

      {/* Create Category Form */}
      {isCreatingCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Category</CardTitle>
            <CardDescription>Add a new option category for window coverings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category_name">Category Name</Label>
              <Input
                id="category_name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Headings, Linings, Borders"
              />
            </div>
            <div>
              <Label htmlFor="category_description">Description</Label>
              <Textarea
                id="category_description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="category_required"
                checked={categoryForm.is_required}
                onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, is_required: !!checked }))}
              />
              <Label htmlFor="category_required">Required for all window coverings</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateCategory} className="bg-brand-primary hover:bg-brand-accent">
                Create Category
              </Button>
              <Button variant="outline" onClick={() => setIsCreatingCategory(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Subcategory Form */}
      {isCreatingSubcategory && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Subcategory</CardTitle>
            <CardDescription>Add a new option subcategory to an existing category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subcategory_category">Parent Category</Label>
              <Select 
                value={subcategoryForm.category_id} 
                onValueChange={(value) => setSubcategoryForm(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subcategory_name">Subcategory Name</Label>
                <Input
                  id="subcategory_name"
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Pinch Pleat, Blackout Lining"
                />
              </div>
              <div>
                <Label htmlFor="subcategory_pricing">Pricing Method</Label>
                <Select 
                  value={subcategoryForm.pricing_method} 
                  onValueChange={(value: any) => setSubcategoryForm(prev => ({ ...prev, pricing_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-unit">Per Unit</SelectItem>
                    <SelectItem value="per-meter">Per Meter</SelectItem>
                    <SelectItem value="per-sqm">Per Square Meter</SelectItem>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="subcategory_description">Description</Label>
              <Textarea
                id="subcategory_description"
                value={subcategoryForm.description}
                onChange={(e) => setSubcategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="subcategory_price">Base Price (£)</Label>
                <Input
                  id="subcategory_price"
                  type="number"
                  step="0.01"
                  value={subcategoryForm.base_price}
                  onChange={(e) => setSubcategoryForm(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="fullness_ratio">Fullness Ratio</Label>
                <Input
                  id="fullness_ratio"
                  type="number"
                  step="0.1"
                  value={subcategoryForm.fullness_ratio || ''}
                  onChange={(e) => setSubcategoryForm(prev => ({ ...prev, fullness_ratio: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  placeholder="e.g., 2.0"
                />
              </div>
              <div>
                <Label htmlFor="extra_fabric">Extra Fabric %</Label>
                <Input
                  id="extra_fabric"
                  type="number"
                  step="1"
                  value={subcategoryForm.extra_fabric_percentage || ''}
                  onChange={(e) => setSubcategoryForm(prev => ({ ...prev, extra_fabric_percentage: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  placeholder="e.g., 10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateSubcategory} className="bg-brand-primary hover:bg-brand-accent">
                Create Subcategory
              </Button>
              <Button variant="outline" onClick={() => setIsCreatingSubcategory(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
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
                <Button variant="outline" size="sm" onClick={() => deleteCategory(category.id)}>
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
                        onClick={() => deleteSubcategory(subcategory.id, category.id)}
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

        {categories.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-brand-neutral mb-4">No option categories created yet.</p>
              <Button 
                onClick={() => setIsCreatingCategory(true)}
                className="bg-brand-primary hover:bg-brand-accent"
              >
                Create Your First Category
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
