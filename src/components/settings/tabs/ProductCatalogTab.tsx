
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Edit, Trash2, Settings } from "lucide-react";
import { useState } from "react";

export const ProductCatalogTab = () => {
  const [selectedCategory, setSelectedCategory] = useState("curtains");

  const productCategories = [
    { id: "curtains", name: "Curtains & Drapes", count: 45 },
    { id: "blinds", name: "Blinds", count: 32 },
    { id: "shutters", name: "Shutters", count: 18 },
    { id: "tracks", name: "Curtain Tracks", count: 28 },
    { id: "hardware", name: "Hardware", count: 67 },
    { id: "fabrics", name: "Fabrics", count: 156 },
  ];

  const sampleProducts = [
    {
      id: 1,
      name: "Motorised Curtain Track System",
      sku: "MCT-001",
      category: "tracks",
      basePrice: 450.00,
      variants: ["Standard", "Heavy Duty", "Silent Glide"],
      options: ["Remote Control", "Wall Switch", "App Control"]
    },
    {
      id: 2, 
      name: "Premium Blockout Fabric",
      sku: "PBF-205",
      category: "fabrics",
      basePrice: 35.00,
      variants: ["Light", "Medium", "Heavy Weight"],
      options: ["Flame Retardant", "Antibacterial", "Stain Resistant"]
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Product Catalog Management</h3>
          <p className="text-sm text-brand-neutral">Manage your product categories, items, and configurations</p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Product Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {productCategories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === category.id 
                    ? "bg-brand-primary text-white" 
                    : "hover:bg-brand-secondary/10"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="font-medium">{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Product List */}
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-primary" />
                Products in {productCategories.find(c => c.id === selectedCategory)?.name}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-brand-primary">{product.name}</h4>
                      <p className="text-sm text-brand-neutral">SKU: {product.sku}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">${product.basePrice}</span>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-brand-neutral">VARIANTS</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.variants.map((variant) => (
                          <Badge key={variant} variant="outline" className="text-xs">
                            {variant}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-brand-neutral">OPTIONS</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.options.map((option) => (
                          <Badge key={option} variant="secondary" className="text-xs">
                            {option}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Product Form */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Add Product</CardTitle>
          <CardDescription>Add a new product to your catalog</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input id="productName" placeholder="e.g., Premium Roman Blind" />
            </div>
            <div>
              <Label htmlFor="productSku">SKU</Label>
              <Input id="productSku" placeholder="e.g., PRB-001" />
            </div>
            <div>
              <Label htmlFor="basePrice">Base Price ($)</Label>
              <Input id="basePrice" type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>

          <div>
            <Label htmlFor="productDescription">Description</Label>
            <Textarea id="productDescription" placeholder="Product description and features..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="variants">Variants (comma separated)</Label>
              <Input id="variants" placeholder="e.g., Light Filtering, Blockout, Sheer" />
            </div>
            <div>
              <Label htmlFor="options">Options (comma separated)</Label>
              <Input id="options" placeholder="e.g., Motorised, Chain Control, Cord Control" />
            </div>
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">
            <Plus className="h-4 w-4 mr-2" />
            Add Product to Catalog
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
