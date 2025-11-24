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
import { Plus, Pencil, Trash2, FolderTree, Loader2, Sparkles } from 'lucide-react';
import { useInventoryCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useInventoryCategories';
import { useInitializeDefaultCategories } from '@/hooks/useInitializeDefaultCategories';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CategoryManagement = () => {
  const { hierarchicalCategories, isLoading } = useInventoryCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const initializeDefaults = useInitializeDefaultCategories();

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
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-3 shadow-lg">
                    <FolderTree className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">
                      🚀 Quick Setup: Industry-Standard Categories
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                      We'll automatically create a professional category structure based on your template library and industry best practices. This includes:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-white/60 dark:bg-black/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">📦 Fabrics</div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Curtains, Roller (Blockout, Light Filtering, Sunscreen), Cellular, Vertical, Panel Glide, Sheers, Linings</p>
                      </div>
                      <div className="p-3 bg-white/60 dark:bg-black/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">🪟 Hard Coverings</div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Venetian (25mm, 50mm Aluminium/Wood), Vertical Vanes, Shutters (Timber, PVC, Aluminium)</p>
                      </div>
                      <div className="p-3 bg-white/60 dark:bg-black/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">🔧 Hardware</div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Tracks & Rails, Rods & Poles, Brackets & Accessories, Motors & Controls</p>
                      </div>
                      <div className="p-3 bg-white/60 dark:bg-black/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">🎨 Wallcoverings</div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Vinyl, Fabric, Grasscloth & Natural</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white/70 dark:bg-black/40 rounded-lg border-2 border-blue-300 dark:border-blue-800 mb-4">
                      <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
                        ✅ Ready for Your Workflow:
                      </p>
                      <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                        <li>Each subcategory is optimized for either <strong>linear pricing</strong> (curtains) or <strong>grid pricing</strong> (blinds)</li>
                        <li>Upload pricing grids and link them to specific fabric/material categories</li>
                        <li>Add products with images and colors for visual selection in quotes</li>
                        <li>Start building your professional product catalog immediately</li>
                      </ul>
                    </div>
                    <Button 
                      size="lg" 
                      className="w-full shadow-lg"
                      onClick={() => initializeDefaults.mutate()}
                      disabled={initializeDefaults.isPending}
                    >
                      {initializeDefaults.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating Categories...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Initialize Industry-Standard Categories
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-blue-600 dark:text-blue-400 mt-3">
                      Don't worry! You can always add, edit, or remove categories later.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          hierarchicalCategories.map(category => renderCategory(category))
        )}
      </div>
    </div>
  );
};
