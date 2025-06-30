
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, FolderOpen, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OptionCategory {
  id: string;
  name: string;
  description?: string;
  is_required: boolean;
  sort_order: number;
  subcategories: OptionSubcategory[];
}

interface OptionSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  pricing_method: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage';
  base_price: number;
  fullness_ratio?: number;
  extra_fabric_percentage?: number;
  image_url?: string;
  sort_order: number;
  sub_subcategories: OptionSubSubcategory[];
}

interface OptionSubSubcategory {
  id: string;
  subcategory_id: string;
  name: string;
  description?: string;
  pricing_method: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage';
  base_price: number;
  color?: string;
  sort_order: number;
}

export const WindowCoveringCategoryManager = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<OptionCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState<string | null>(null);
  const [isCreatingSubSubcategory, setIsCreatingSubSubcategory] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [editingSubSubcategoryId, setEditingSubSubcategoryId] = useState<string | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    is_required: false
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    description: '',
    pricing_method: 'per-unit' as const,
    base_price: 0,
    fullness_ratio: 1.0,
    extra_fabric_percentage: 0
  });

  const [subSubcategoryForm, setSubSubcategoryForm] = useState({
    name: '',
    description: '',
    pricing_method: 'per-unit' as const,
    base_price: 0,
    color: ''
  });

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategoryExpansion = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    const newCategory: OptionCategory = {
      id: editingCategoryId || Date.now().toString(),
      name: categoryForm.name,
      description: categoryForm.description || undefined,
      is_required: categoryForm.is_required,
      sort_order: categories.length,
      subcategories: []
    };

    if (editingCategoryId) {
      setCategories(prev => prev.map(cat => cat.id === editingCategoryId ? { ...cat, ...newCategory } : cat));
      toast({ title: "Success", description: "Category updated successfully" });
    } else {
      setCategories(prev => [...prev, newCategory]);
      toast({ title: "Success", description: "Category created successfully" });
    }

    resetCategoryForm();
  };

  const handleSaveSubcategory = () => {
    if (!subcategoryForm.name.trim() || !isCreatingSubcategory) {
      toast({
        title: "Error",
        description: "Subcategory name is required",
        variant: "destructive"
      });
      return;
    }

    const newSubcategory: OptionSubcategory = {
      id: editingSubcategoryId || Date.now().toString(),
      category_id: isCreatingSubcategory,
      name: subcategoryForm.name,
      description: subcategoryForm.description || undefined,
      pricing_method: subcategoryForm.pricing_method,
      base_price: subcategoryForm.base_price,
      fullness_ratio: subcategoryForm.fullness_ratio,
      extra_fabric_percentage: subcategoryForm.extra_fabric_percentage,
      sort_order: 0,
      sub_subcategories: []
    };

    setCategories(prev => prev.map(cat => 
      cat.id === isCreatingSubcategory 
        ? {
            ...cat,
            subcategories: editingSubcategoryId 
              ? cat.subcategories.map(sub => sub.id === editingSubcategoryId ? newSubcategory : sub)
              : [...cat.subcategories, newSubcategory]
          }
        : cat
    ));

    toast({ 
      title: "Success", 
      description: editingSubcategoryId ? "Subcategory updated successfully" : "Subcategory created successfully" 
    });
    resetSubcategoryForm();
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '', is_required: false });
    setIsCreatingCategory(false);
    setEditingCategoryId(null);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({
      name: '',
      description: '',
      pricing_method: 'per-unit',
      base_price: 0,
      fullness_ratio: 1.0,
      extra_fabric_percentage: 0
    });
    setIsCreatingSubcategory(null);
    setEditingSubcategoryId(null);
  };

  const handleEditCategory = (category: OptionCategory) => {
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      is_required: category.is_required
    });
    setEditingCategoryId(category.id);
    setIsCreatingCategory(true);
  };

  const handleEditSubcategory = (subcategory: OptionSubcategory) => {
    setSubcategoryForm({
      name: subcategory.name,
      description: subcategory.description || '',
      pricing_method: subcategory.pricing_method,
      base_price: subcategory.base_price,
      fullness_ratio: subcategory.fullness_ratio || 1.0,
      extra_fabric_percentage: subcategory.extra_fabric_percentage || 0
    });
    setEditingSubcategoryId(subcategory.id);
    setIsCreatingSubcategory(subcategory.category_id);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    toast({ title: "Success", description: "Category deleted successfully" });
  };

  const handleDeleteSubcategory = (categoryId: string, subcategoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId) }
        : cat
    ));
    toast({ title: "Success", description: "Subcategory deleted successfully" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Option Categories</h3>
          <p className="text-sm text-brand-neutral">Manage reusable option categories and subcategories</p>
        </div>
        <Button 
          onClick={() => setIsCreatingCategory(true)}
          className="bg-brand-primary hover:bg-brand-accent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Tree */}
      <div className="space-y-2">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCategoryExpansion(category.id)}
                    className="p-1"
                  >
                    {expandedCategories.has(category.id) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                  <Folder className="h-4 w-4 text-brand-primary" />
                  <div>
                    <h4 className="font-semibold">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-brand-neutral">{category.description}</p>
                    )}
                    <div className="flex gap-2 mt-1">
                      {category.is_required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      <Badge variant="outline" className="text-xs">
                        {category.subcategories.length} subcategories
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsCreatingSubcategory(category.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Subcategories */}
              {expandedCategories.has(category.id) && (
                <div className="ml-6 mt-4 space-y-2">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="p-3 bg-gray-50 rounded border-l-2 border-brand-primary">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-brand-accent" />
                          <div>
                            <h5 className="font-medium">{subcategory.name}</h5>
                            {subcategory.description && (
                              <p className="text-sm text-brand-neutral">{subcategory.description}</p>
                            )}
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {subcategory.pricing_method}: £{subcategory.base_price}
                              </Badge>
                              {subcategory.fullness_ratio && subcategory.fullness_ratio !== 1 && (
                                <Badge variant="outline" className="text-xs">
                                  Fullness: {subcategory.fullness_ratio}x
                                </Badge>
                              )}
                              {subcategory.extra_fabric_percentage && subcategory.extra_fabric_percentage > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Extra: +{subcategory.extra_fabric_percentage}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditSubcategory(subcategory)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Category Form */}
      {isCreatingCategory && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCategoryId ? 'Edit Category' : 'Create New Category'}</CardTitle>
            <CardDescription>Configure the category details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Heading, Border, Track"
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="categoryRequired"
                checked={categoryForm.is_required}
                onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, is_required: checked }))}
              />
              <Label htmlFor="categoryRequired">Required Selection</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveCategory} className="bg-brand-primary hover:bg-brand-accent">
                {editingCategoryId ? 'Update Category' : 'Create Category'}
              </Button>
              <Button variant="outline" onClick={resetCategoryForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Subcategory Form */}
      {isCreatingSubcategory && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSubcategoryId ? 'Edit Subcategory' : 'Create New Subcategory'}</CardTitle>
            <CardDescription>Configure the subcategory specifications and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subcategoryName">Subcategory Name *</Label>
                <Input
                  id="subcategoryName"
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Pinch Pleat, Machine Finished"
                />
              </div>
              <div>
                <Label>Pricing Method</Label>
                <Select
                  value={subcategoryForm.pricing_method}
                  onValueChange={(value: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage') => 
                    setSubcategoryForm(prev => ({ ...prev, pricing_method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-unit">Per Unit</SelectItem>
                    <SelectItem value="per-meter">Per Meter</SelectItem>
                    <SelectItem value="per-sqm">Per Square Meter</SelectItem>
                    <SelectItem value="fixed">Fixed Cost</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="subcategoryDescription">Description</Label>
              <Textarea
                id="subcategoryDescription"
                value={subcategoryForm.description}
                onChange={(e) => setSubcategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="basePrice">Base Price (£)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={subcategoryForm.base_price}
                  onChange={(e) => setSubcategoryForm(prev => ({ ...prev, base_price: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="fullnessRatio">Fullness Ratio</Label>
                <Input
                  id="fullnessRatio"
                  type="number"
                  step="0.1"
                  value={subcategoryForm.fullness_ratio}
                  onChange={(e) => setSubcategoryForm(prev => ({ ...prev, fullness_ratio: Number(e.target.value) }))}
                  placeholder="1.0"
                />
              </div>
              <div>
                <Label htmlFor="extraFabric">Extra Fabric (%)</Label>
                <Input
                  id="extraFabric"
                  type="number"
                  step="0.1"
                  value={subcategoryForm.extra_fabric_percentage}
                  onChange={(e) => setSubcategoryForm(prev => ({ ...prev, extra_fabric_percentage: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveSubcategory} className="bg-brand-primary hover:bg-brand-accent">
                {editingSubcategoryId ? 'Update Subcategory' : 'Create Subcategory'}
              </Button>
              <Button variant="outline" onClick={resetSubcategoryForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
