
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TreePine, Package, Palette, Layers, Plus, Edit, Trash2, Settings } from "lucide-react";
import { useInventoryCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, InventoryCategory } from "@/hooks/useInventoryCategories";

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoryManagementDialog = ({ open, onOpenChange }: CategoryManagementDialogProps) => {
  const { data: categories = [], isLoading } = useInventoryCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [newTag, setNewTag] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category_type: "product",
    parent_id: "",
    requires_dimensions: false,
    requires_fabric_specs: false,
    requires_material_info: false,
    default_unit: "each",
    sync_with_shopify: false,
    tags: [] as string[],
    sort_order: 0,
    is_active: true,
  });

  const categoryTypes = [
    { value: "fabric", label: "Fabrics", icon: TreePine },
    { value: "hardware", label: "Hardware", icon: Settings },
    { value: "wallpaper", label: "Wallpapers", icon: Palette },
    { value: "trim", label: "Trims & Bindings", icon: Layers },
    { value: "product", label: "General Products", icon: Package },
  ];

  const units = ["each", "yard", "meter", "roll", "sheet", "box", "set"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      await updateCategory.mutateAsync({ ...formData, id: editingCategory.id });
      setEditingCategory(null);
    } else {
      await createCategory.mutateAsync(formData);
      setShowCreateForm(false);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      category_type: "product",
      parent_id: "",
      requires_dimensions: false,
      requires_fabric_specs: false,
      requires_material_info: false,
      default_unit: "each",
      sync_with_shopify: false,
      tags: [],
      sort_order: 0,
      is_active: true,
    });
  };

  const handleEdit = (category: InventoryCategory) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      category_type: category.category_type,
      parent_id: category.parent_id || "",
      requires_dimensions: category.requires_dimensions,
      requires_fabric_specs: category.requires_fabric_specs,
      requires_material_info: category.requires_material_info,
      default_unit: category.default_unit,
      sync_with_shopify: category.sync_with_shopify,
      tags: category.tags,
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
    setEditingCategory(category);
    setShowCreateForm(true);
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const renderCategoryTree = (cats: InventoryCategory[], level = 0) => {
    return cats.map((category) => (
      <div key={category.id} className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <Card className="mb-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {categoryTypes.find(t => t.value === category.category_type)?.icon && 
                  React.createElement(categoryTypes.find(t => t.value === category.category_type)!.icon, { 
                    className: "h-5 w-5 text-gray-500" 
                  })
                }
                <div>
                  <h4 className="font-semibold">{category.name}</h4>
                  <p className="text-sm text-gray-500">{category.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{category.category_type}</Badge>
                    <Badge variant="secondary">{category.default_unit}</Badge>
                    {category.sync_with_shopify && <Badge className="bg-green-100 text-green-800">Shopify</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => deleteCategory.mutate(category.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {category.children && category.children.length > 0 && renderCategoryTree(category.children, level + 1)}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">Loading categories...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Category Management</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="form">{editingCategory ? "Edit Category" : "New Category"}</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Categories</h3>
              <Button onClick={() => { setShowCreateForm(true); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="space-y-4">
              {categories.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No categories yet</h3>
                    <p className="text-gray-500 mb-4">Create your first category to organize your inventory</p>
                    <Button onClick={() => { setShowCreateForm(true); resetForm(); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Category
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                renderCategoryTree(categories)
              )}
            </div>
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        name,
                        slug: prev.slug || generateSlug(name)
                      }));
                    }}
                    placeholder="e.g., Curtain Brackets"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="curtain-brackets"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this category"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category_type">Category Type</Label>
                  <Select
                    value={formData.category_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className="h-4 w-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="default_unit">Default Unit</Label>
                  <Select
                    value={formData.default_unit}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, default_unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="parent_id">Parent Category (Optional)</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Category Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requires_dimensions">Requires Dimensions</Label>
                    <Switch
                      id="requires_dimensions"
                      checked={formData.requires_dimensions}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_dimensions: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requires_fabric_specs">Requires Fabric Specifications</Label>
                    <Switch
                      id="requires_fabric_specs"
                      checked={formData.requires_fabric_specs}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_fabric_specs: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requires_material_info">Requires Material Information</Label>
                    <Switch
                      id="requires_material_info"
                      checked={formData.requires_material_info}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_material_info: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync_with_shopify">Sync with Shopify</Label>
                    <Switch
                      id="sync_with_shopify"
                      checked={formData.sync_with_shopify}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sync_with_shopify: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => { setShowCreateForm(false); setEditingCategory(null); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
