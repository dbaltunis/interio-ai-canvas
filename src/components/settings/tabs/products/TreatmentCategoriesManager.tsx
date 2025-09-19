import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TreatmentCategory {
  id: string;
  name: string;
  description?: string;
  template_count: number;
  color?: string;
}

export const TreatmentCategoriesManager = () => {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TreatmentCategory | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "", color: "#3b82f6" });

  // Sample categories - in real app, this would come from a hook
  const [categories, setCategories] = useState<TreatmentCategory[]>([
    {
      id: "1",
      name: "Curtains",
      description: "Traditional curtain treatments with various heading styles",
      template_count: 8,
      color: "#3b82f6"
    },
    {
      id: "2", 
      name: "Roman Blinds",
      description: "Classic roman blind treatments with fold configurations",
      template_count: 3,
      color: "#8b5cf6"
    },
    {
      id: "3",
      name: "Roller Blinds", 
      description: "Modern roller blind solutions",
      template_count: 2,
      color: "#10b981"
    }
  ]);

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    const category: TreatmentCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      description: newCategory.description,
      template_count: 0,
      color: newCategory.color
    };

    setCategories(prev => [...prev, category]);
    setNewCategory({ name: "", description: "", color: "#3b82f6" });
    setIsCreateOpen(false);
    
    toast({
      title: "Category Created",
      description: `Treatment category "${category.name}" has been created successfully.`
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category?.template_count > 0) {
      toast({
        title: "Cannot Delete",
        description: "Category contains templates. Move or delete templates first.",
        variant: "destructive"
      });
      return;
    }

    setCategories(prev => prev.filter(c => c.id !== categoryId));
    toast({
      title: "Category Deleted",
      description: "Treatment category has been deleted successfully."
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Treatment Categories</CardTitle>
            <CardDescription>
              Organize your treatment templates into categories for better management
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Treatment Category</DialogTitle>
                <DialogDescription>
                  Add a new category to organize your treatment templates
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Premium Curtains"
                  />
                </div>
                <div>
                  <Label htmlFor="category-description">Description (Optional)</Label>
                  <Input
                    id="category-description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this category"
                  />
                </div>
                <div>
                  <Label htmlFor="category-color">Category Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="category-color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 rounded border border-input cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">Used for visual organization</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCategory}>
                  Create Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{category.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {category.template_count} templates
                    </Badge>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2">
                  <FolderOpen className="h-4 w-4" />
                  View Templates
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Category</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this category? This action cannot be undone.
                        {category.template_count > 0 && (
                          <span className="block mt-2 text-destructive font-medium">
                            Warning: This category contains {category.template_count} templates.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={category.template_count > 0}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          
          {categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No treatment categories yet</p>
              <p className="text-sm">Create your first category to organize templates</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};