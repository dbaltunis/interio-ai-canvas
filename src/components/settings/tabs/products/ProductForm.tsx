
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  isEditing: boolean;
  categories: Category[];
  selectedCategoryId: string;
  productName: string;
  productSku: string;
  basePrice: string;
  costPrice: string;
  description: string;
  variants: string;
  options: string;
  onCategoryChange: (categoryId: string) => void;
  onProductNameChange: (name: string) => void;
  onProductSkuChange: (sku: string) => void;
  onBasePriceChange: (price: string) => void;
  onCostPriceChange: (price: string) => void;
  onDescriptionChange: (description: string) => void;
  onVariantsChange: (variants: string) => void;
  onOptionsChange: (options: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ProductForm = ({
  isEditing,
  categories,
  selectedCategoryId,
  productName,
  productSku,
  basePrice,
  costPrice,
  description,
  variants,
  options,
  onCategoryChange,
  onProductNameChange,
  onProductSkuChange,
  onBasePriceChange,
  onCostPriceChange,
  onDescriptionChange,
  onVariantsChange,
  onOptionsChange,
  onSubmit,
  onCancel,
}: ProductFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Product" : "Add New Product"}
        </CardTitle>
        <CardDescription>
          {isEditing ? "Update product details" : "Add a new product to your catalog"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input 
                id="productName" 
                value={productName}
                onChange={(e) => onProductNameChange(e.target.value)}
                placeholder="e.g., Premium Roman Blind" 
                required
              />
            </div>
            <div>
              <Label htmlFor="productSku">SKU</Label>
              <Input 
                id="productSku" 
                value={productSku}
                onChange={(e) => onProductSkuChange(e.target.value)}
                placeholder="e.g., PRB-001" 
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={selectedCategoryId} onValueChange={onCategoryChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="basePrice">Base Price ($) *</Label>
              <Input 
                id="basePrice" 
                type="number" 
                step="0.01" 
                value={basePrice}
                onChange={(e) => onBasePriceChange(e.target.value)}
                placeholder="0.00" 
                required
              />
            </div>
            <div>
              <Label htmlFor="costPrice">Cost Price ($)</Label>
              <Input 
                id="costPrice" 
                type="number" 
                step="0.01" 
                value={costPrice}
                onChange={(e) => onCostPriceChange(e.target.value)}
                placeholder="0.00" 
              />
            </div>
          </div>

          <div>
            <Label htmlFor="productDescription">Description</Label>
            <Textarea 
              id="productDescription" 
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Product description and features..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="variants">Variants (comma separated)</Label>
              <Input 
                id="variants" 
                value={variants}
                onChange={(e) => onVariantsChange(e.target.value)}
                placeholder="e.g., Light Filtering, Blockout, Sheer" 
              />
            </div>
            <div>
              <Label htmlFor="options">Options (comma separated)</Label>
              <Input 
                id="options" 
                value={options}
                onChange={(e) => onOptionsChange(e.target.value)}
                placeholder="e.g., Motorised, Chain Control, Cord Control" 
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-brand-primary hover:bg-brand-accent">
              <Plus className="h-4 w-4 mr-2" />
              {isEditing ? "Update Product" : "Add Product"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
