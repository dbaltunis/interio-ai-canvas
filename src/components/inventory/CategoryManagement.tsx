import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, FolderTree, Loader2 } from 'lucide-react';
import { useInventoryCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useInventoryCategories';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const CategoryManagement = () => {
  const { hierarchicalCategories, isLoading } = useInventoryCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_type: 'fabric',
    parent_category_id: null as string | null,
    sort_order: 0,
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      console.log('Category name is empty');
      return;
    }

    console.log('Creating category with data:', formData);

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          ...formData,
        });
      } else {
        await createCategory.mutateAsync(formData);
      }

    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', category_type: 'fabric', parent_category_id: null, sort_order: 0 });
    } catch (error) {
      console.error('Error creating/updating category:', error);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      category_type: category.category_type || 'fabric',
      parent_category_id: category.parent_category_id,
      sort_order: category.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      await deleteCategory.mutateAsync(id);
      setFormData({ name: '', category_type: 'fabric', parent_category_id: null, sort_order: 0 });
    }
  };

  const renderCategory = (category: any, level = 0) => (
    <div key={category.id} className="space-y-2">
      <Card className="p-4" style={{ marginLeft: `${level * 24}px` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderTree className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="font-medium">{category.name}</h4>
              {level === 0 && (
                <Badge variant="secondary" className="text-xs mt-1">
                  Main Category
                </Badge>
              )}
              {level > 0 && (
                <Badge variant="outline" className="text-xs mt-1">
                  Subcategory
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(category)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(category.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </Card>
      {category.children?.map((child: any) => renderCategory(child, level + 1))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Categories</h2>
          <p className="text-muted-foreground">Manage your inventory organization structure</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', category_type: 'fabric', parent_category_id: null, sort_order: 0 });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Flooring, Rugs, Wooden Floor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_type">Category Type</Label>
                <Select
                  value={formData.category_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="fabric">Fabric</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="wallcovering">Wallcovering</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the type of products this category will contain
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">Parent Category (Optional)</Label>
                <Select
                  value={formData.parent_category_id || 'none'}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    parent_category_id: value === 'none' ? null : value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (Main Category)" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="none">None (Main Category)</SelectItem>
                    {hierarchicalCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a parent to create a subcategory
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order" className="flex items-center gap-2">
                  Display Order
                  <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  placeholder="Leave 0 for automatic ordering"
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first in tabs. Leave as 0 to order alphabetically.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  disabled={createCategory.isPending || updateCategory.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.name.trim() || createCategory.isPending || updateCategory.isPending}
                >
                  {(createCategory.isPending || updateCategory.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading categories...</span>
          </div>
        ) : hierarchicalCategories.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No categories yet. Create your first category above.</p>
          </Card>
        ) : (
          hierarchicalCategories.map(category => renderCategory(category))
        )}
      </div>
    </div>
  );
};
