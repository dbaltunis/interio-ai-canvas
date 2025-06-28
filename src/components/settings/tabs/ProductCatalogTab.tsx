import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package, Edit, Trash2, Settings } from "lucide-react";
import { useState } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useProductCategories } from "@/hooks/useProductCategories";
import { useToast } from "@/hooks/use-toast";

export const ProductCatalogTab = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  
  // Form state
  const [productName, setProductName] = useState("");
  const [productSku, setProductSku] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState("");
  const [options, setOptions] = useState("");

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useProductCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  // Filter products by selected category
  const filteredProducts = selectedCategoryId 
    ? products.filter(product => product.category_id === selectedCategoryId)
    : products;

  // Get category counts
  const categoryWithCounts = categories.map(category => ({
    ...category,
    count: products.filter(product => product.category_id === category.id).length
  }));

  const resetForm = () => {
    setProductName("");
    setProductSku("");
    setBasePrice("");
    setCostPrice("");
    setDescription("");
    setVariants("");
    setOptions("");
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !selectedCategoryId) {
      toast({
        title: "Error",
        description: "Product name and category are required",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: productName,
      sku: productSku || undefined,
      category_id: selectedCategoryId,
      base_price: parseFloat(basePrice) || 0,
      cost_price: parseFloat(costPrice) || undefined,
      description: description || undefined,
      variants: variants ? variants.split(',').map(v => v.trim()) : [],
      options: options ? options.split(',').map(o => o.trim()) : [],
    };

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct, ...productData });
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await createProduct.mutateAsync(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: any) => {
    setProductName(product.name);
    setProductSku(product.sku || "");
    setBasePrice(product.base_price?.toString() || "");
    setCostPrice(product.cost_price?.toString() || "");
    setDescription(product.description || "");
    setVariants(Array.isArray(product.variants) ? product.variants.join(', ') : "");
    setOptions(Array.isArray(product.options) ? product.options.join(', ') : "");
    setEditingProduct(product.id);
    setShowAddForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct.mutateAsync(productId);
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
      }
    }
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-brand-neutral">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Product Catalog Management</h3>
          <p className="text-sm text-brand-neutral">Manage your product categories, items, and configurations</p>
        </div>
        <Button 
          className="bg-brand-primary hover:bg-brand-accent"
          onClick={() => setShowAddForm(true)}
        >
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
            <div
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                !selectedCategoryId 
                  ? "bg-brand-primary text-white" 
                  : "hover:bg-brand-secondary/10"
              }`}
              onClick={() => setSelectedCategoryId("")}
            >
              <span className="font-medium">All Products</span>
              <Badge variant="secondary" className="text-xs">
                {products.length}
              </Badge>
            </div>
            {categoryWithCounts.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCategoryId === category.id 
                    ? "bg-brand-primary text-white" 
                    : "hover:bg-brand-secondary/10"
                }`}
                onClick={() => setSelectedCategoryId(category.id)}
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
                {selectedCategoryId 
                  ? `Products in ${categories.find(c => c.id === selectedCategoryId)?.name}`
                  : "All Products"
                }
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
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="mx-auto h-12 w-12 mb-4" />
                  <p>No products found in this category</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowAddForm(true)}
                  >
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-brand-primary">{product.name}</h4>
                        <p className="text-sm text-brand-neutral">
                          SKU: {product.sku || "N/A"} | 
                          Category: {categories.find(c => c.id === product.category_id)?.name || "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">${product.base_price || 0}</span>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {((Array.isArray(product.variants) && product.variants.length > 0) || 
                      (Array.isArray(product.options) && product.options.length > 0)) && (
                      <div className="grid grid-cols-2 gap-4">
                        {Array.isArray(product.variants) && product.variants.length > 0 && (
                          <div>
                            <Label className="text-xs font-medium text-brand-neutral">VARIANTS</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.variants.map((variant: string) => (
                                <Badge key={variant} variant="outline" className="text-xs">
                                  {variant}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {Array.isArray(product.options) && product.options.length > 0 && (
                          <div>
                            <Label className="text-xs font-medium text-brand-neutral">OPTIONS</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.options.map((option: string) => (
                                <Badge key={option} variant="secondary" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </CardTitle>
            <CardDescription>
              {editingProduct ? "Update product details" : "Add a new product to your catalog"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input 
                    id="productName" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Premium Roman Blind" 
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="productSku">SKU</Label>
                  <Input 
                    id="productSku" 
                    value={productSku}
                    onChange={(e) => setProductSku(e.target.value)}
                    placeholder="e.g., PRB-001" 
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} required>
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
                    onChange={(e) => setBasePrice(e.target.value)}
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
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00" 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="productDescription">Description</Label>
                <Textarea 
                  id="productDescription" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description and features..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="variants">Variants (comma separated)</Label>
                  <Input 
                    id="variants" 
                    value={variants}
                    onChange={(e) => setVariants(e.target.value)}
                    placeholder="e.g., Light Filtering, Blockout, Sheer" 
                  />
                </div>
                <div>
                  <Label htmlFor="options">Options (comma separated)</Label>
                  <Input 
                    id="options" 
                    value={options}
                    onChange={(e) => setOptions(e.target.value)}
                    placeholder="e.g., Motorised, Chain Control, Cord Control" 
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-brand-primary hover:bg-brand-accent">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
