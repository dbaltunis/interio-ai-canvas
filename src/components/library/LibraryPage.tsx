
import { useState } from "react";
import { LibraryHeader } from "./LibraryHeader";
import { LibrarySearch } from "./LibrarySearch";
import { LibraryTabs } from "./LibraryTabs";
import { LibraryDialogs } from "./LibraryDialogs";
import { DatabaseCheck } from "../debug/DatabaseCheck";
import { SetupHelper } from "../admin/SetupHelper";
import { useInventory } from "@/hooks/useInventory";
import { useVendors } from "@/hooks/useVendors";
import { useProductCategories } from "@/hooks/useProductCategories";

export const LibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("fabrics");
  const [showFabricForm, setShowFabricForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  // Fetch real data from database
  const { data: inventory = [], isLoading: inventoryLoading, error: inventoryError } = useInventory();
  const { data: vendors = [], isLoading: vendorsLoading, error: vendorsError } = useVendors();
  const { data: categories = [], isLoading: categoriesLoading } = useProductCategories();

  console.log("LibraryPage - Inventory data:", inventory);
  console.log("LibraryPage - Vendors data:", vendors);
  console.log("LibraryPage - Categories data:", categories);
  console.log("LibraryPage - Loading states:", { inventoryLoading, vendorsLoading, categoriesLoading });
  console.log("LibraryPage - Errors:", { inventoryError, vendorsError });

  // Transform inventory data to fabric format with proper filtering
  const fabrics = inventory
    .filter(item => {
      const isFabricCategory = item.category?.toLowerCase().includes('fabric') || 
                             categories.some(cat => cat.name?.toLowerCase().includes('fabric') && cat.id === item.category);
      return isFabricCategory;
    })
    .map(item => ({
      id: item.id,
      name: item.name,
      code: item.sku || "N/A",
      brand: item.supplier || "Unknown",
      collection: "Default",
      type: item.type || "Unknown",
      color: item.color || "Unknown",
      pattern: item.pattern || "Solid",
      width: item.width || 140,
      price: item.cost_per_unit || 0,
      image: "/placeholder.svg"
    }));

  // Transform vendors to brands format with real fabric counts
  const brands = vendors.map(vendor => ({
    id: vendor.id,
    name: vendor.name,
    collections: 0, // Would need a separate query to count collections
    fabrics: inventory.filter(item => item.supplier === vendor.name).length
  }));

  // Create collections from inventory data grouped by supplier and category
  const collections = categories
    .filter(cat => cat.name?.toLowerCase().includes('fabric'))
    .map((category, index) => ({
      id: index + 1,
      name: category.name,
      brand: "Various",
      fabrics: inventory.filter(item => 
        item.category === category.name || 
        item.category === category.id
      ).length
    }));

  const filteredFabrics = fabrics.filter(fabric =>
    fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state
  if (inventoryLoading || vendorsLoading || categoriesLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-brand-neutral">Loading library data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SetupHelper />
      <DatabaseCheck />
      
      <LibraryHeader
        onFilterClick={() => setShowFilterDialog(true)}
        onCSVUploadClick={() => setShowCSVUpload(true)}
        onAddFabricClick={() => setShowFabricForm(true)}
      />

      <LibrarySearch value={searchTerm} onChange={setSearchTerm} />

      <LibraryTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        fabrics={filteredFabrics}
        brands={brands}
        collections={collections}
        onAddBrand={() => setShowBrandForm(true)}
        onAddCollection={() => setShowCollectionForm(true)}
      />

      <LibraryDialogs
        showFabricForm={showFabricForm}
        setShowFabricForm={setShowFabricForm}
        showBrandForm={showBrandForm}
        setShowBrandForm={setShowBrandForm}
        showCollectionForm={showCollectionForm}
        setShowCollectionForm={setShowCollectionForm}
        showFilterDialog={showFilterDialog}
        setShowFilterDialog={setShowFilterDialog}
        showCSVUpload={showCSVUpload}
        setShowCSVUpload={setShowCSVUpload}
      />
    </div>
  );
};
