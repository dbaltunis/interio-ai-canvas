
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
import { Plus, Edit, Trash2, FolderTree, Tag, Package } from "lucide-react";
import { toast } from "sonner";

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
}

export const CategoryManager = () => {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Mock data - replace with actual data fetching
  const categories: Category[] = [
    { id: "1", name: "Upholstery Fabrics", type: "fabric", description: "High-quality fabrics for furniture", color: "#3B82F6" },
    { id: "2", name: "Drapery Fabrics", type: "fabric", description: "Window treatment fabrics", color: "#10B981" },
    { id: "3", name: "Blackout Fabrics", type: "fabric", description: "Light-blocking fabrics", color: "#6366F1" },
    { id: "4", name: "Curtain Tracks", type: "hardware", description: "Track systems for curtains", color: "#F59E0B" },
    { id: "5", name: "Motorized Systems", type: "hardware", description: "Automated window covering systems", color: "#EF4444" },
  ];

  const collections: Collection[] = [
    { id: "1", name: "Heritage Collection", description: "Traditional fabrics with timeless appeal", vendor_id: "1", season: "All Season", year: 2024, tags: ["Traditional", "Premium"] },
    { id: "2", name: "Luxury Series", description: "High-end silk and premium materials", vendor_id: "2", season: "Spring", year: 2024, tags: ["Luxury", "Silk"] },
    { id: "3", name: "Functional Fabrics", description: "Performance and utility focused", vendor_id: "1", season: "All Season", year: 2024, tags: ["Functional", "Durable"] },
  ];

  const handleCreateCategory = (data: Partial<Category>) => {
    console.log("Creating category:", data);
    toast.success("Category created successfully");
    setShowCategoryDialog(false);
    setEditingCategory(null);
  };

  const handleCreateCollection = (data: Partial<Collection>) => {
    console.log("Creating collection:", data);
    toast.success("Collection created successfully");
    setShowCollectionDialog(false);
    setEditingCollection(null);
  };

  const handleDeleteCategory = (id: string) => {
    console.log("Deleting category:", id);
    toast.success("Category deleted successfully");
  };

  const handleDeleteCollection = (id: string) => {
    console.log("Deleting collection:", id);
    toast.success("Collection deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Category & Collection Management</h2>
          <p className="text-gray-600">Organize your inventory with categories and collections</p>
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
                onSubmit={handleCreateCollection}
                onCancel={() => {
                  setShowCollectionDialog(false);
                  setEditingCollection(null);
                }}
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
            Collections ({collections.length})
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
                  <p className="text-sm text-gray-600 mb-4">
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
                      className="text-red-600 hover:text-red-700"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <Card key={collection.id} className="relative group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{collection.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{collection.season}</Badge>
                    <Badge variant="secondary">{collection.year}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
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
                      onClick={() => handleDeleteCollection(collection.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
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

// Collection Form Component
const CollectionForm = ({ 
  collection, 
  onSubmit, 
  onCancel 
}: {
  collection: Collection | null;
  onSubmit: (data: Partial<Collection>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: collection?.name || "",
    description: collection?.description || "",
    season: collection?.season || "All Season",
    year: collection?.year || new Date().getFullYear(),
    tags: collection?.tags || []
  });

  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          placeholder="Enter collection name"
          required
        />
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {collection ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};
