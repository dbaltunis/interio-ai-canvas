
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
import { toast } from "sonner";

export const LibraryPage = () => {
  const { units } = useMeasurementUnits();
  const [activeTab, setActiveTab] = useState("fabrics");
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

  // Mock data with improved categorization and patterns
  const vendors = [
    { 
      id: 1, 
      name: "Fibre Naturelle", 
      type: "Fabric Supplier",
      country: "UK",
      contact: "sales@fibrenaturelle.com",
      phone: "+44 20 7123 4567",
      products: 156,
      lastOrder: "2024-01-15"
    },
    { 
      id: 2, 
      name: "KD Design", 
      type: "Fabric Manufacturer",
      country: "Germany", 
      contact: "info@kddesign.de",
      phone: "+49 30 1234 5678",
      products: 89,
      lastOrder: "2024-01-20"
    },
    { 
      id: 3, 
      name: "Hunter Douglas", 
      type: "Hardware & Systems",
      country: "Netherlands",
      contact: "orders@hunterdouglas.com", 
      phone: "+31 20 567 8900",
      products: 45,
      lastOrder: "2024-01-10"
    },
    {
      id: 4,
      name: "Silent Gliss",
      type: "Track Systems",
      country: "Switzerland",
      contact: "sales@silentgliss.com",
      phone: "+41 44 123 4567",
      products: 67,
      lastOrder: "2024-01-18"
    }
  ];

  const fabrics = [
    {
      id: 1,
      name: "Merlon Custard",
      code: "K5361/02",
      vendor: "Fibre Naturelle",
      category: "Upholstery Fabrics",
      collection: "Heritage Collection",
      pattern: "Solid",
      price: 120.00,
      unit: units.fabric,
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
      inStock: 45.5,
      reorderPoint: 10,
      location: "Warehouse A-12",
      composition: "100% Linen",
      width: "137cm",
      patternRepeat: "0cm",
      status: "In Stock"
    },
    {
      id: 2,
      name: "Silk Taffeta Royal",
      code: "ST-2401",
      vendor: "KD Design", 
      category: "Drapery Fabrics",
      collection: "Luxury Series",
      pattern: "Striped",
      price: 180.00,
      unit: units.fabric,
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
      inStock: 23.2,
      reorderPoint: 15,
      location: "Warehouse B-07",
      composition: "100% Silk",
      width: "140cm",
      patternRepeat: "32cm",
      status: "In Stock"
    },
    {
      id: 3,
      name: "Blackout Supreme",
      code: "BO-1205",
      vendor: "Fibre Naturelle",
      category: "Blackout Fabrics",
      collection: "Functional Fabrics",
      pattern: "Textured",
      price: 85.00,
      unit: units.fabric,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
      inStock: 8.5,
      reorderPoint: 20,
      location: "Warehouse A-15",
      composition: "Polyester with Acrylic Backing",
      width: "150cm",
      patternRepeat: "0cm",
      status: "Low Stock"
    }
  ];

  const hardware = [
    {
      id: 1,
      name: "Professional Track System",
      code: "HD-TRACK-001",
      vendor: "Hunter Douglas",
      category: "Curtain Tracks",
      price: 45.00,
      unit: "meter",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      inStock: 125,
      reorderPoint: 25,
      location: "Hardware Storage H-03",
      material: "Aluminum",
      maxWeight: "50kg per meter",
      status: "In Stock"
    },
    {
      id: 2,
      name: "Silent Motorized System",
      code: "SG-MOTOR-205",
      vendor: "Silent Gliss",
      category: "Motorized Systems", 
      price: 320.00,
      unit: "each",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
      inStock: 12,
      reorderPoint: 5,
      location: "Electronics Storage E-01",
      material: "Steel & Electronics",
      maxWeight: "75kg",
      status: "In Stock"
    }
  ];

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
        const searchFields = [product.name, product.code, product.vendor, product.category, product.collection].filter(Boolean);
        if (!searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        )) {
          return false;
        }
      }

      // Applied filters
      if (Object.keys(appliedFilters).length > 0) {
        // Vendor filter
        if (appliedFilters.vendor && product.vendor !== appliedFilters.vendor) return false;
        
        // Category filter
        if (appliedFilters.category && product.category !== appliedFilters.category) return false;
        
        // Price range filter
        if (appliedFilters.priceMin && product.price < parseFloat(appliedFilters.priceMin)) return false;
        if (appliedFilters.priceMax && product.price > parseFloat(appliedFilters.priceMax)) return false;
        
        // Stock status filter
        if (appliedFilters.stockStatus) {
          const stockStatus = getStockStatus(product.inStock, product.reorderPoint || 10);
          if (appliedFilters.stockStatus !== stockStatus.status.toLowerCase().replace(' ', '-')) return false;
        }
        
        // Pattern filter (for fabrics)
        if (appliedFilters.pattern && product.pattern !== appliedFilters.pattern) return false;
        
        // Tags filter
        if (appliedFilters.tags && appliedFilters.tags.length > 0) {
          // This would check against product tags if they existed
          // For now, we'll skip this filter
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

  return (
    <div className="space-y-6">
      <LibraryHeader 
        onAddNew={handleAddNew}
        onShowFilter={() => setShowFilterDialog(true)}
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
              <div className="text-center py-8 text-gray-500">
                No collections available. Create your first collection to organize your inventory!
              </div>
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
    </div>
  );
};
