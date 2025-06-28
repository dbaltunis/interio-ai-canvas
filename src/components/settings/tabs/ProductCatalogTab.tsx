import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { useState } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useProductCategories } from "@/hooks/useProductCategories";
import { useToast } from "@/hooks/use-toast";
import { ProductCategoryFilter } from "./products/ProductCategoryFilter";
import { ProductList } from "./products/ProductList";
import { ProductForm } from "./products/ProductForm";
import { CategoryManagement } from "./products/CategoryManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  name: string;
  sku?: string;
  category_id: string;
  base_price?: number;
  variants?: string[];
  options?: string[];
}

interface Category {
  id: string;
  name: string;
}

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

  const { data: rawProducts = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useProductCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  // Transform the raw products to match our Product interface
  const products: Product[] = rawProducts.map(product => ({
    id: product.id,
    name: product.name,
    sku: product.sku || undefined,
    category_id: product.category_id || "",
    base_price: product.base_price || undefined,
    variants: Array.isArray(product.variants) ? product.variants as string[] : 
              typeof product.variants === 'string' ? [product.variants] : [],
    options: Array.isArray(product.options) ? product.options as string[] : 
             typeof product.options === 'string' ? [product.options] : [],
  }));

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

  const handleEdit = (product: Product) => {
    setProductName(product.name);
    setProductSku(product.sku || "");
    setBasePrice(product.base_price?.toString() || "");
    setCostPrice(""); // We don't have cost_price in our Product interface, so leave empty
    setDescription(""); // We don't have description in our Product interface, so leave empty
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
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-end">
            <Button 
              className="bg-brand-primary hover:bg-brand-accent"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <ProductCategoryFilter
              categories={categoryWithCounts}
              selectedCategoryId={selectedCategoryId}
              totalProducts={products.length}
              onCategorySelect={setSelectedCategoryId}
            />

            <ProductList
              products={filteredProducts}
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddProduct={() => setShowAddForm(true)}
            />
          </div>

          {showAddForm && (
            <ProductForm
              isEditing={!!editingProduct}
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              productName={productName}
              productSku={productSku}
              basePrice={basePrice}
              costPrice={costPrice}
              description={description}
              variants={variants}
              options={options}
              onCategoryChange={setSelectedCategoryId}
              onProductNameChange={setProductName}
              onProductSkuChange={setProductSku}
              onBasePriceChange={setBasePrice}
              onCostPriceChange={setCostPrice}
              onDescriptionChange={setDescription}
              onVariantsChange={setVariants}
              onOptionsChange={setOptions}
              onSubmit={handleSubmit}
              onCancel={resetForm}
            />
          )}
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          <CategoryManagement categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
