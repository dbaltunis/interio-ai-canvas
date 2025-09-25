import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings, Edit, Trash2, Home, Layers, Cog } from "lucide-react";
import { useOptionCategories, type OptionCategory } from "@/hooks/useOptionCategories";

interface ProductType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category_types: string[];
  default_pricing_method: string;
  measurement_type: string;
}

const PRODUCT_TYPES: ProductType[] = [
  {
    id: "curtains",
    name: "Curtains",
    description: "Traditional and modern curtain configurations",
    icon: Home,
    category_types: ["heading", "lining", "operation", "hardware"],
    default_pricing_method: "per-linear-meter",
    measurement_type: "fabric-drop-required"
  },
  {
    id: "romans",
    name: "Roman Blinds",
    description: "Soft fabric roman blind configurations",
    icon: Layers,
    category_types: ["lining", "operation"],
    default_pricing_method: "per-sqm",
    measurement_type: "width-height-only"
  },
  {
    id: "rollers",
    name: "Roller Blinds",
    description: "Single and double roller configurations",
    icon: Cog,
    category_types: ["operation", "hardware"],
    default_pricing_method: "per-sqm",
    measurement_type: "width-height-only"
  },
  {
    id: "venetians",
    name: "Venetian Blinds",
    description: "Aluminium and faux wood venetians",
    icon: Layers,
    category_types: ["material", "operation"],
    default_pricing_method: "per-sqm",
    measurement_type: "width-height-only"
  },
  {
    id: "verticals",
    name: "Vertical Blinds",
    description: "Fabric vertical blind configurations",
    icon: Layers,
    category_types: ["operation", "hardware"],
    default_pricing_method: "per-sqm",
    measurement_type: "width-height-only"
  },
  {
    id: "honeycomb",
    name: "Honeycomb/Cellular",
    description: "Plated honeycomb blind configurations",
    icon: Layers,
    category_types: ["material", "operation"],
    default_pricing_method: "per-sqm",
    measurement_type: "width-height-only"
  },
  {
    id: "shutters",
    name: "Shutters",
    description: "Timber, PVC and aluminium shutters",
    icon: Home,
    category_types: ["material", "operation", "hardware"],
    default_pricing_method: "per-sqm",
    measurement_type: "custom-measurements"
  }
];

export const WindowCoveringsManagement = () => {
  const { data: optionCategories, isLoading } = useOptionCategories();
  const [activeTab, setActiveTab] = useState("products");
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  const renderProductCard = (product: ProductType) => {
    const Icon = product.icon;
    
    return (
      <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProduct(product)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pricing Method</p>
              <p className="text-sm">{product.default_pricing_method}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Measurement</p>
              <p className="text-sm">{product.measurement_type}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Option Categories:</p>
            <div className="flex flex-wrap gap-2">
              {product.category_types.map((type) => (
                <Badge key={type} variant="outline" className="text-xs capitalize">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOptionCategoryManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">Option Categories</h4>
          <p className="text-sm text-muted-foreground">
            Manage hierarchical option structures for all product types
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Category
        </Button>
      </div>

      {optionCategories && optionCategories.length > 0 ? (
        <div className="grid gap-4">
          {optionCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={category.is_required ? "default" : "secondary"}>
                      {category.is_required ? "Required" : "Optional"}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {category.category_type}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {category.subcategories?.length || 0} subcategories configured
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Option Categories</h3>
            <p className="text-muted-foreground mb-4">
              Create option categories to define hierarchical structures for your products
            </p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create First Category
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading window coverings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-brand-primary">Window Coverings Management</h3>
        <p className="text-brand-neutral">Configure product types and their option structures</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Product Types</TabsTrigger>
          <TabsTrigger value="categories">Option Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Home className="h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle className="text-green-800">Product Type Configurations</CardTitle>
                    <CardDescription className="text-green-600">
                      Pre-configured product types with their option structures and pricing methods
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                  7 TYPES
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">
                Each product type includes relevant option categories, default pricing methods, and measurement requirements.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {PRODUCT_TYPES.map(renderProductCard)}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {renderOptionCategoryManagement()}
        </TabsContent>
      </Tabs>
    </div>
  );
};