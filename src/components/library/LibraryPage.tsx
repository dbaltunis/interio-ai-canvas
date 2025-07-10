import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FabricForm } from "./FabricForm";
import { BrandForm } from "./BrandForm";
import { CollectionForm } from "./CollectionForm";
import { FilterDialog } from "./FilterDialog";
import { VendorForm } from "./VendorForm";
import { HardwareForm } from "./HardwareForm";
import { CategoryManager } from "./CategoryManager";
import { ProductDetailsDialog } from "./ProductDetailsDialog";
import { SelectedProductsPanel } from "./SelectedProductsPanel";
import { LibraryHeader } from "./LibraryHeader";
import { LibraryTabs } from "./LibraryTabs";
import { ProductCards } from "./ProductCards";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useVendors } from "@/hooks/useVendors";
import { useInventory } from "@/hooks/useInventoryManagement";
import { useHardwareInventory } from "@/hooks/useHardwareInventory";
import { useCollections } from "@/hooks/useCollections";
import { toast } from "sonner";
import { CategoryManagementDialog } from "./CategoryManagementDialog";
import { ShopifyIntegrationDialog } from "./ShopifyIntegrationDialog";
import { InventoryInsights } from "./InventoryInsights";

export const LibraryPage = () => {
  const { units } = useMeasurementUnits();
  const [activeTab, setActiveTab] = useState("insights");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addDialogType, setAddDialogType] = useState<"vendor" | "fabric" | "hardware" | "collection">("fabric");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [productDetailsDialog, setProductDetailsDialog] = useState<{
    open: boolean;
    product: any;
    type: "fabric" | "hardware" | "vendor";
  }>({ open: false, product: null, type: "fabric" });
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showShopifyDialog, setShowShopifyDialog] = useState(false);

  // Fetch real data from database
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { data: fabrics = [], isLoading: fabricsLoading } = useInventory();
  const { data: hardware = [], isLoading: hardwareLoading } = useHardwareInventory();
  const { data: collections = [], isLoading: collectionsLoading } = useCollections();

  const productCards = ProductCards({ 
    vendors, 
    fabrics, 
    hardware, 
    selectedProducts, 
    onProductSelect: handleProductSelect, 
    onProductDetails: handleProductDetails 
  });

  // Filter and search logic
  const filterProducts = (products: any[], type: string) => {
    return products.filter(product => {
      // Search filter
      if (searchTerm) {
        const searchFields = [
          product.name, 
          product.product_code, 
          product.vendor?.name, 
          product.category, 
          product.collection?.name,
          ...(product.tags || [])
        ].filter(Boolean);
        
        if (!searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        )) {
          return false;
        }
      }

      // Applied filters
      if (Object.keys(appliedFilters).length > 0) {
        // Vendor filter
        if (appliedFilters.vendor && product.vendor?.name !== appliedFilters.vendor) return false;
        
        // Category filter
        if (appliedFilters.category && product.category !== appliedFilters.category) return false;
        
        // Price range filter
        const price = product.cost_per_unit || product.retail_price || 0;
        if (appliedFilters.priceMin && price < parseFloat(appliedFilters.priceMin)) return false;
        if (appliedFilters.priceMax && price > parseFloat(appliedFilters.priceMax)) return false;
        
        // Stock status filter
        if (appliedFilters.stockStatus) {
          const stockStatus = getStockStatus(product.quantity || 0, product.reorder_point || 10);
          if (appliedFilters.stockStatus !== stockStatus.status.toLowerCase().replace(' ', '-')) return false;
        }
        
        // Tags filter
        if (appliedFilters.tags && appliedFilters.tags.length > 0) {
          const productTags = product.tags || [];
          if (!appliedFilters.tags.some((tag: string) => productTags.includes(tag))) return false;
        }
      }

      return true;
    });
  };

  const getStockStatus = (current: number, reorderPoint: number) => {
    if (current <= reorderPoint * 0.5) return { status: "Critical", color: "bg-red-500" };
    if (current <= reorderPoint) return { status: "Low Stock", color: "bg-orange-500" };
    return { status: "In Stock", color: "bg-green-500" };
  };

  const filteredVendors = filterProducts(vendors, 'vendor');
  const filteredFabrics = filterProducts(fabrics, 'fabric');
  const filteredHardware = filterProducts(hardware, 'hardware');
  const filteredCollections = filterProducts(collections, 'collection');

  function handleProductSelect(productId: string, checked: boolean) {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
      toast.success("Product added to selection");
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
      toast.success("Product removed from selection");
    }
  }

  function handleProductDetails(product: any, type: "fabric" | "hardware" | "vendor") {
    setProductDetailsDialog({ open: true, product, type });
  }

  function handleAddToProject() {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }
    
    toast.success(`${selectedProducts.length} products ready to add to project`);
    console.log("Selected products for project:", selectedProducts);
  }

  function handleCalculateUsage() {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one fabric");
      return;
    }
    
    toast.success("Opening fabric usage calculator...");
    console.log("Calculate usage for:", selectedProducts);
  }

  function handleAddNew(type: "vendor" | "fabric" | "hardware" | "collection") {
    setAddDialogType(type);
    setShowAddDialog(true);
  }

  function handleImport() {
    toast.success("Opening import dialog...");
    console.log("Import functionality");
  }

  function handleExport() {
    toast.success("Preparing export...");
    console.log("Export functionality");
  }

  function handleApplyFilters(filters: any) {
    setAppliedFilters(filters);
    toast.success("Filters applied successfully");
  }

  // Loading state
  if (vendorsLoading || fabricsLoading || hardwareLoading || collectionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LibraryHeader 
        onAddNew={handleAddNew}
        onShowFilter={() => setShowFilterDialog(true)}
        onShowCategories={() => setShowCategoryDialog(true)}
        onShowShopify={() => setShowShopifyDialog(true)}
        onImport={handleImport}
        onExport={handleExport}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className={selectedProducts.length > 0 ? "col-span-9" : "col-span-12"}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <LibraryTabs 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Tab Contents */}
            <TabsContent value="insights" className="space-y-4">
              <InventoryInsights />
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <CategoryManager />
            </TabsContent>

            <TabsContent value="vendors" className="space-y-4">
              {filteredVendors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No vendors found matching your criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVendors.map(productCards.renderVendorCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="fabrics" className="space-y-4">
              {filteredFabrics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No fabrics found matching your criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFabrics.map(productCards.renderFabricCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="hardware" className="space-y-4">
              {filteredHardware.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hardware found matching your criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHardware.map(productCards.renderHardwareCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="collections" className="space-y-4">
              {filteredCollections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No collections available. Create your first collection to organize your inventory!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCollections.map(collection => (
                    <div key={collection.id} className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold mb-2">{collection.name}</h3>
                      <p className="text-gray-600 mb-2">{collection.description}</p>
                      <div className="flex gap-2 mb-3">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {collection.season}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {collection.year}
                        </span>
                      </div>
                      {collection.vendor && (
                        <p className="text-sm text-gray-500">
                          Vendor: {collection.vendor.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Selected Products Panel */}
        {selectedProducts.length > 0 && (
          <div className="col-span-3">
            <SelectedProductsPanel
              selectedProducts={selectedProducts}
              onClearSelection={() => setSelectedProducts([])}
              onRemoveProduct={(productId) => setSelectedProducts(prev => prev.filter(id => id !== productId))}
              onAddToProject={handleAddToProject}
              onCalculateUsage={handleCalculateUsage}
            />
          </div>
        )}
      </div>

      {/* Filter Dialog */}
      <FilterDialog 
        open={showFilterDialog} 
        onOpenChange={setShowFilterDialog}
        onApplyFilters={handleApplyFilters}
      />

      {/* Add Dialog */}
      <Sheet open={showAddDialog} onOpenChange={setShowAddDialog}>
        <SheetContent className="w-[600px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>
              Add {addDialogType === "vendor" ? "Vendor/Supplier" : 
                   addDialogType === "fabric" ? "Fabric" : 
                   addDialogType === "hardware" ? "Hardware" : "Collection"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {addDialogType === "fabric" && <FabricForm onClose={() => setShowAddDialog(false)} />}
            {addDialogType === "vendor" && <VendorForm onClose={() => setShowAddDialog(false)} />}
            {addDialogType === "hardware" && <HardwareForm onClose={() => setShowAddDialog(false)} />}
            {addDialogType === "collection" && <CollectionForm onClose={() => setShowAddDialog(false)} />}
          </div>
        </SheetContent>
      </Sheet>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={productDetailsDialog.open}
        onOpenChange={(open) => setProductDetailsDialog(prev => ({ ...prev, open }))}
        product={productDetailsDialog.product}
        productType={productDetailsDialog.type}
      />

      {/* Category Management Dialog */}
      <CategoryManagementDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
      />

      {/* Shopify Integration Dialog */}
      <ShopifyIntegrationDialog
        open={showShopifyDialog}
        onOpenChange={setShowShopifyDialog}
      />
    </div>
  );
};
