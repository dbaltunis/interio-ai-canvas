import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Plus, AlertTriangle, Wand2 } from "lucide-react";
import { useStoreProductCatalog } from "@/hooks/useStoreProductCatalog";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { ProductCatalogItem } from "./ProductCatalogItem";
import { AddProductsDialog } from "./AddProductsDialog";
import { BulkActionsBar } from "./BulkActionsBar";
import { TemplateAssignmentManager } from "./TemplateAssignmentManager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface ProductCatalogManagerProps {
  storeId: string;
}

export const ProductCatalogManager = ({ storeId }: ProductCatalogManagerProps) => {
  const { products, isLoading, bulkUpdateVisibility, bulkUpdateTemplates } = useStoreProductCatalog(storeId);
  const { data: templates = [] } = useCurtainTemplates();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  // Check for products missing templates
  const productsNeedingTemplates = useMemo(() => {
    return products.filter(p => {
      const category = p.inventory_item?.category?.toLowerCase() || '';
      const isFabric = category === 'fabric' || category.includes('fabric');
      return isFabric && !p.template_id;
    });
  }, [products]);

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.inventory_item?.category).filter(Boolean)));
  
  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const item = product.inventory_item;
    const matchesCategory = selectedCategory === "all" || item?.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  const handleBulkVisibility = async (isVisible: boolean) => {
    await bulkUpdateVisibility.mutateAsync({ ids: selectedIds, isVisible });
    setSelectedIds([]);
  };

  const handleAutoAssignTemplates = async () => {
    // Find the most appropriate templates for each category
    const curtainTemplate = templates.find(t => t.treatment_category === 'curtains');
    const rollerBlindTemplate = templates.find(t => t.treatment_category === 'roller_blinds');
    const romanBlindTemplate = templates.find(t => t.treatment_category === 'roman_blinds');

    if (!curtainTemplate && !rollerBlindTemplate && !romanBlindTemplate) {
      toast.error("No templates available. Please create templates first.");
      return;
    }

    // Group selected products by category
    const selectedProducts = products.filter(p => selectedIds.includes(p.id));
    const assignments: { productIds: string[], templateId: string }[] = [];

    // Group by category
    const fabricProducts = selectedProducts.filter(p => 
      p.inventory_item?.category?.toLowerCase() === 'fabric' && !p.template_id
    );
    const rollerFabricProducts = selectedProducts.filter(p => 
      p.inventory_item?.category?.toLowerCase() === 'roller_fabric' && !p.template_id
    );
    const headingProducts = selectedProducts.filter(p => 
      p.inventory_item?.category?.toLowerCase() === 'heading' && !p.template_id
    );

    // Assign appropriate templates
    if (fabricProducts.length > 0 && curtainTemplate) {
      assignments.push({
        productIds: fabricProducts.map(p => p.id),
        templateId: curtainTemplate.id
      });
    }

    if (rollerFabricProducts.length > 0 && rollerBlindTemplate) {
      assignments.push({
        productIds: rollerFabricProducts.map(p => p.id),
        templateId: rollerBlindTemplate.id
      });
    }

    if (headingProducts.length > 0 && curtainTemplate) {
      assignments.push({
        productIds: headingProducts.map(p => p.id),
        templateId: curtainTemplate.id
      });
    }

    if (assignments.length === 0) {
      toast.info("No products need template assignment");
      return;
    }

    // Execute all assignments
    try {
      for (const assignment of assignments) {
        await bulkUpdateTemplates.mutateAsync(assignment);
      }
      toast.success(`Successfully assigned templates to ${assignments.reduce((sum, a) => sum + a.productIds.length, 0)} products!`);
      setSelectedIds([]);
    } catch (error) {
      toast.error("Failed to assign templates");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Template Warning */}
      {productsNeedingTemplates.length > 0 && !showTemplateManager && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900 dark:text-amber-100">
            {productsNeedingTemplates.length} Product{productsNeedingTemplates.length !== 1 ? 's' : ''} Need Template Assignment
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200 flex items-center justify-between gap-4">
            <span>
              Fabric products without templates won't display as finished treatments in your store. Assign templates now to show them properly.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateManager(true)}
              className="shrink-0"
            >
              Assign Templates
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Template Assignment Manager */}
      {showTemplateManager && (
        <TemplateAssignmentManager
          storeId={storeId}
          productIds={productsNeedingTemplates.map(p => p.id)}
          onComplete={() => setShowTemplateManager(false)}
        />
      )}

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Product Catalog</CardTitle>
              <Badge variant="secondary">{products.length} total products</Badge>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Products
            </Button>
          </div>
          
          {products.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search products by name, SKU, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {filteredProducts.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select All Visible ({filteredProducts.length})
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {selectedIds.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedIds.length}
              onMakeVisible={() => handleBulkVisibility(true)}
              onMakeHidden={() => handleBulkVisibility(false)}
              onClearSelection={() => setSelectedIds([])}
              onAutoAssignTemplates={handleAutoAssignTemplates}
              showTemplateAssign={products.some(p => 
                selectedIds.includes(p.id) && 
                !p.template_id && 
                ['fabric', 'roller_fabric', 'heading'].includes(p.inventory_item?.category?.toLowerCase())
              )}
            />
          )}

          {filteredProducts.length === 0 && products.length > 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No products match your filters.</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}>
                Clear Filters
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No products in your catalog yet.</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map(product => (
                <ProductCatalogItem
                  key={product.id}
                  product={product}
                  isSelected={selectedIds.includes(product.id)}
                  onSelect={(checked) => handleSelectProduct(product.id, checked)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddProductsDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        storeId={storeId}
      />
    </>
  );
};
