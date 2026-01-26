
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, FolderTree, Tag, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCollections, useCreateCollection, useDeleteCollection, useUpdateCollection } from "@/hooks/useCollections";
import { useVendors } from "@/hooks/useVendors";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Category {
  id: string;
  name: string;
  type: "fabric" | "hardware";
  description?: string;
  parent_id?: string;
  color?: string;
  sort_order?: number;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  vendor_id?: string;
  season?: string;
  year?: number;
  tags: string[];
  vendor?: { id: string; name: string };
}

export const CategoryManager = () => {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null);

  // ✅ REAL DATABASE CONNECTIONS - No more mock data!
  const { data: collections = [], isLoading: collectionsLoading } = useCollections();
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();
  const { data: vendors = [] } = useVendors();

  // Mock categories for now - can be connected to DB later
  const categories: Category[] = [
    { id: "1", name: "Upholstery Fabrics", type: "fabric", description: "High-quality fabrics for furniture", color: "#3B82F6" },
    { id: "2", name: "Drapery Fabrics", type: "fabric", description: "Window treatment fabrics", color: "#10B981" },
    { id: "3", name: "Blackout Fabrics", type: "fabric", description: "Light-blocking fabrics", color: "#6366F1" },
    { id: "4", name: "Curtain Tracks", type: "hardware", description: "Track systems for curtains", color: "#F59E0B" },
    { id: "5", name: "Motorized Systems", type: "hardware", description: "Automated window covering systems", color: "#EF4444" },
  ];

  const handleCreateCategory = (data: Partial<Category>) => {
    console.log("Creating category:", data);
    toast.success("Category created successfully");
    setShowCategoryDialog(false);
    setEditingCategory(null);
  };

  const handleCreateCollection = async (data: Partial<Collection>) => {
    try {
      if (editingCollection) {
        // Update existing collection
        await updateCollection.mutateAsync({
          id: editingCollection.id,
          name: data.name,
          description: data.description,
          vendor_id: data.vendor_id || null,
          season: data.season,
          year: data.year,
          tags: data.tags || [],
        });
        toast.success("Collection updated successfully");
      } else {
        // Create new collection
        await createCollection.mutateAsync({
          name: data.name,
          description: data.description,
          vendor_id: data.vendor_id || null,
          season: data.season,
          year: data.year,
          tags: data.tags || [],
          active: true,
        });
        toast.success("Collection created successfully");
      }
      setShowCollectionDialog(false);
      setEditingCollection(null);
    } catch (error: any) {
      console.error("Error saving collection:", error);
      toast.error(error.message || "Failed to save collection");
    }
  };

  const handleDeleteCategory = (id: string) => {
    console.log("Deleting category:", id);
    toast.success("Category deleted successfully");
  };

  const handleDeleteCollection = async () => {
    if (!deleteCollectionId) return;
    
    try {
      await deleteCollection.mutateAsync(deleteCollectionId);
      toast.success("Collection deleted successfully");
      setDeleteCollectionId(null);
    } catch (error: any) {
      console.error("Error deleting collection:", error);
      toast.error(error.message || "Failed to delete collection");
    }
  };

  // Map DB collections to component format
  const mappedCollections: Collection[] = collections.map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    vendor_id: c.vendor_id,
    season: c.season || "All Season",
    year: c.year || new Date().getFullYear(),
    tags: c.tags || [],
    vendor: c.vendor,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Category & Collection Management</h2>
          <p className="text-muted-foreground">Organize your inventory with categories and collections</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="brand">
                <Plus className="h-4 w-4 mr-2" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </DialogTitle>
              </DialogHeader>
              <CategoryForm
                category={editingCategory}
                onSubmit={handleCreateCategory}
                onCancel={() => {
                  setShowCategoryDialog(false);
                  setEditingCategory(null);
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
            <DialogTrigger asChild>
              <Button variant="success">
                <Plus className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCollection ? "Edit Collection" : "Create New Collection"}
                </DialogTitle>
              </DialogHeader>
              <CollectionForm
                collection={editingCollection}
                vendors={vendors}
                onSubmit={handleCreateCollection}
                onCancel={() => {
                  setShowCollectionDialog(false);
                  setEditingCollection(null);
                }}
                isLoading={createCollection.isPending || updateCollection.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">
            <FolderTree className="h-4 w-4 mr-2" />
            Categories ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="collections">
            <Package className="h-4 w-4 mr-2" />
            Collections ({collectionsLoading ? "..." : mappedCollections.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="relative group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <Badge variant={category.type === "fabric" ? "default" : "secondary"}>
                      {category.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description || "No description"}
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category);
                        setShowCategoryDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          {collectionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="relative">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : mappedCollections.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Collections Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create collections to organize your inventory by vendor ranges, seasons, or styles.
              </p>
              <Button onClick={() => setShowCollectionDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Collection
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mappedCollections.map((collection) => (
                <Card key={collection.id} className="relative group hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <Badge variant="outline">{collection.season}</Badge>
                      <Badge variant="secondary">{collection.year}</Badge>
                      {collection.vendor && (
                        <Badge variant="outline" className="bg-primary/10">
                          {collection.vendor.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {collection.description || "No description"}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {collection.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCollection(collection);
                          setShowCollectionDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCollectionId(collection.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCollectionId} onOpenChange={() => setDeleteCollectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this collection. Items linked to this collection will be unlinked but not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCollection.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Category Form Component
const CategoryForm = ({ 
  category, 
  onSubmit, 
  onCancel 
}: {
  category: Category | null;
  onSubmit: (data: Partial<Category>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    type: category?.type || "fabric" as "fabric" | "hardware",
    description: category?.description || "",
    color: category?.color || "#3B82F6"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter category name"
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value: "fabric" | "hardware") => 
            setFormData(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fabric">Fabric</SelectItem>
            <SelectItem value="hardware">Hardware</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter category description"
        />
      </div>

      <div>
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          type="color"
          value={formData.color}
          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {category ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

// Collection Form Component - now connected to real database
const CollectionForm = ({ 
  collection, 
  vendors = [],
  onSubmit, 
  onCancel,
  isLoading = false
}: {
  collection: Collection | null;
  vendors: any[];
  onSubmit: (data: Partial<Collection>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: collection?.name || "",
    description: collection?.description || "",
    vendor_id: collection?.vendor_id || "",
    season: collection?.season || "All Season",
    year: collection?.year || new Date().getFullYear(),
    tags: collection?.tags || []
  });

  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      vendor_id: formData.vendor_id || undefined,
    });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Collection Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Heritage 2024, SKYE Range"
          required
        />
      </div>

      <div>
        <Label htmlFor="vendor">Vendor (Optional)</Label>
        <Select
          value={formData.vendor_id}
          onValueChange={(value) => setFormData(prev => ({ ...prev, vendor_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a vendor..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Vendor</SelectItem>
            {vendors.map((vendor: any) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter collection description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="season">Season</Label>
          <Select
            value={formData.season}
            onValueChange={(value) => setFormData(prev => ({ ...prev, season: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Season">All Season</SelectItem>
              <SelectItem value="Spring">Spring</SelectItem>
              <SelectItem value="Summer">Summer</SelectItem>
              <SelectItem value="Fall">Fall</SelectItem>
              <SelectItem value="Winter">Winter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
          />
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {collection ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};
