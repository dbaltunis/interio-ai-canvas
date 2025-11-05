import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, FolderTree, Folder, Tag } from 'lucide-react';
import { useInventoryCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, type InventoryCategory } from '@/hooks/useInventoryCategories';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const CATEGORY_COLORS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#84cc16', label: 'Lime' },
  { value: '#22c55e', label: 'Green' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#0ea5e9', label: 'Sky' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#a855f7', label: 'Purple' },
  { value: '#d946ef', label: 'Fuchsia' },
  { value: '#ec4899', label: 'Pink' },
];

export const InventoryCategoriesManager = () => {
  const { hierarchicalCategories, categories, isLoading } = useInventoryCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_category_id: '',
    color: '#3b82f6',
    icon: 'folder',
    sort_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parent_category_id: '',
      color: '#3b82f6',
      icon: 'folder',
      sort_order: 0,
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: InventoryCategory) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_category_id: category.parent_category_id || '',
      color: category.color || '#3b82f6',
      icon: category.icon || 'folder',
      sort_order: category.sort_order || 0,
    });
    setEditingCategory(category);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          ...formData,
          parent_category_id: formData.parent_category_id || null,
        });
      } else {
        await createCategory.mutateAsync({
          ...formData,
          parent_category_id: formData.parent_category_id || null,
          active: true,
          category_type: 'product',
        });
      }
      setShowDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? Items will be unassigned.')) {
      await deleteCategory.mutateAsync(id);
    }
  };

  const renderCategoryTree = (cats: any[], level = 0) => {
    return cats.map((category) => (
      <div key={category.id} className="space-y-1">
        <div
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ backgroundColor: category.color || '#3b82f6' }}
            >
              {level > 0 ? (
                <Tag className="h-4 w-4 text-white" />
              ) : (
                <Folder className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                {category.children && category.children.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {category.children.length} sub
                  </Badge>
                )}
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(category.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {category.children && category.children.length > 0 && (
          <div className="space-y-1">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Inventory Categories
            </CardTitle>
            <CardDescription>
              Organize your inventory with hierarchical categories and subcategories
            </CardDescription>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {hierarchicalCategories.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <FolderTree className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-muted-foreground">No categories yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first category to organize your inventory
              </p>
            </div>
          ) : (
            renderCategoryTree(hierarchicalCategories)
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? 'Update category details'
                  : 'Add a new category to organize your inventory'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Motors, Fabrics, Hardware"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="parent">Parent Category (Optional)</Label>
                <Select
                  value={formData.parent_category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parent_category_id: value === 'none' ? '' : value })
                  }
                >
                  <SelectTrigger id="parent">
                    <SelectValue placeholder="Select parent category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {categories
                      .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Create subcategories by selecting a parent
                </p>
              </div>

              <div>
                <Label htmlFor="color">Category Color</Label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-md border-2 transition-all ${
                        formData.color === color.value
                          ? 'border-primary scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
