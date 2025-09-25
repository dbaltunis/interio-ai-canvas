import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X } from "lucide-react";
import { useCreateOptionCategory, useCreateOptionSubcategory } from "@/hooks/useOptionCategories";
import { toast } from "sonner";

interface Subcategory {
  id: string;
  name: string;
  description: string;
  base_price: number;
  pricing_method: 'per_sqm' | 'per_meter' | 'fixed' | 'per_panel';
}

interface OptionCategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OptionCategoryForm = ({ open, onOpenChange }: OptionCategoryFormProps) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryType, setCategoryType] = useState<string>("");
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [currentSubcategory, setCurrentSubcategory] = useState<Subcategory>({
    id: "",
    name: "",
    description: "",
    base_price: 0,
    pricing_method: 'fixed'
  });

  const createOptionCategory = useCreateOptionCategory();
  const createOptionSubcategory = useCreateOptionSubcategory();

  const addSubcategory = () => {
    if (!currentSubcategory.name.trim()) {
      toast.error("Subcategory name is required");
      return;
    }

    const newSubcategory = {
      ...currentSubcategory,
      id: crypto.randomUUID()
    };

    setSubcategories([...subcategories, newSubcategory]);
    setCurrentSubcategory({
      id: "",
      name: "",
      description: "",
      base_price: 0,
      pricing_method: 'fixed'
    });
  };

  const removeSubcategory = (id: string) => {
    setSubcategories(subcategories.filter(sub => sub.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting option category form");

    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!categoryType) {
      toast.error("Category type is required");
      return;
    }

    try {
      // First create the category
      const categoryData = await createOptionCategory.mutateAsync({
        name: categoryName,
        description: categoryDescription,
        category_type: categoryType,
        is_required: false,
        sort_order: 0,
        active: true
      });

      // Then create subcategories if any
      if (subcategories.length > 0 && categoryData) {
        for (const sub of subcategories) {
          await createOptionSubcategory.mutateAsync({
            category_id: categoryData.id,
            name: sub.name,
            description: sub.description,
            pricing_method: sub.pricing_method,
            base_price: sub.base_price,
            sort_order: 0,
            active: true
          });
        }
      }

      // Reset form
      setCategoryName("");
      setCategoryDescription("");
      setCategoryType("");
      setSubcategories([]);
      setCurrentSubcategory({
        id: "",
        name: "",
        description: "",
        base_price: 0,
        pricing_method: 'fixed'
      });

      onOpenChange(false);
      toast.success(`Option category created successfully${subcategories.length > 0 ? ` with ${subcategories.length} subcategories` : ''}`);
    } catch (error) {
      console.error("Error creating option category:", error);
      toast.error("Failed to create option category");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Option Category</DialogTitle>
          <DialogDescription>
            Create a new option category with subcategories and pricing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., Lining Types"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryType">Category Type</Label>
                  <Select value={categoryType} onValueChange={setCategoryType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lining">Lining Options</SelectItem>
                      <SelectItem value="hardware">Hardware Options</SelectItem>
                      <SelectItem value="fabric">Fabric Categories</SelectItem>
                      <SelectItem value="heading">Heading Styles</SelectItem>
                      <SelectItem value="mounting">Mounting Options</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="custom">Custom Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Describe this category and its purpose"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Subcategory */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Subcategory</CardTitle>
              <CardDescription>
                Add options within this category with individual pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subName">Subcategory Name</Label>
                  <Input
                    id="subName"
                    value={currentSubcategory.name}
                    onChange={(e) => setCurrentSubcategory({
                      ...currentSubcategory,
                      name: e.target.value
                    })}
                    placeholder="e.g., Blockout Lining"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subPrice">Base Price</Label>
                  <Input
                    id="subPrice"
                    type="number"
                    step="0.01"
                    value={currentSubcategory.base_price}
                    onChange={(e) => setCurrentSubcategory({
                      ...currentSubcategory,
                      base_price: Number(e.target.value)
                    })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subDescription">Description</Label>
                  <Input
                    id="subDescription"
                    value={currentSubcategory.description}
                    onChange={(e) => setCurrentSubcategory({
                      ...currentSubcategory,
                      description: e.target.value
                    })}
                    placeholder="Brief description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricingMethod">Pricing Method</Label>
                  <Select 
                    value={currentSubcategory.pricing_method} 
                    onValueChange={(value: any) => setCurrentSubcategory({
                      ...currentSubcategory,
                      pricing_method: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="per_sqm">Per Square Meter</SelectItem>
                      <SelectItem value="per_meter">Per Linear Meter</SelectItem>
                      <SelectItem value="per_panel">Per Panel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                type="button" 
                onClick={addSubcategory}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subcategory
              </Button>
            </CardContent>
          </Card>

          {/* Subcategories List */}
          {subcategories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subcategories ({subcategories.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subcategories.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{sub.name}</h4>
                          <Badge variant="secondary">
                            ${sub.base_price} {sub.pricing_method}
                          </Badge>
                        </div>
                        {sub.description && (
                          <p className="text-sm text-muted-foreground">{sub.description}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubcategory(sub.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createOptionCategory.isPending}
            >
              {createOptionCategory.isPending ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};