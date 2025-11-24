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
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
import { useInventoryCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useInventoryCategories';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CategoryManagement = () => {
  const { hierarchicalCategories, isLoading } = useInventoryCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_type: 'material',
    parent_category_id: null as string | null,
    sort_order: 0,
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

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
    setFormData({ name: '', category_type: 'material', parent_category_id: null, sort_order: 0 });
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      category_type: category.category_type || 'material',
      parent_category_id: category.parent_category_id,
      sort_order: category.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      await deleteCategory.mutateAsync(id);
      setFormData({ name: '', category_type: 'material', parent_category_id: null, sort_order: 0 });
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
              setFormData({ name: '', category_type: 'material', parent_category_id: null, sort_order: 0 });
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
                  placeholder="e.g., Fabrics, Hardware, Venetian Slats"
                />
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
                  <SelectContent>
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
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-muted-foreground">Loading categories...</p>
        ) : hierarchicalCategories.length === 0 ? (
          <div className="space-y-4">
            <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-500 text-white p-2">
                    <FolderTree className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Quick Start: Build Your Inventory Structure
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <li>
                        <strong>Create Main Categories</strong> - Examples: "Fabrics", "Hard Materials", "Hardware", "Wallcoverings"
                      </li>
                      <li>
                        <strong>Add Subcategories</strong> - Under "Fabrics": "Curtain & Roman", "Roller - Blockout", "Roller - Light Filtering", "Cellular", etc.
                      </li>
                      <li>
                        <strong>Organize as needed</strong> - Add more categories as your inventory grows
                      </li>
                    </ol>
                    <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded border border-blue-300 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>💡 Pro Tip:</strong> Leave "Display Order" as 0 unless you want specific tab ordering. 
                        Categories with 0 will be sorted alphabetically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No categories yet. Click "Add Category" above to create your first category.</p>
            </Card>
          </div>
        ) : (
          hierarchicalCategories.map(category => renderCategory(category))
        )}
      </div>
    </div>
  );
};
