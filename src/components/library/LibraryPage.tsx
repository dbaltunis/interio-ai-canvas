
import { useState } from "react";
import { LibraryHeader } from "./LibraryHeader";
import { LibrarySearch } from "./LibrarySearch";
import { LibraryTabs } from "./LibraryTabs";
import { LibraryDialogs } from "./LibraryDialogs";
import { DatabaseCheck } from "../debug/DatabaseCheck";
import { SetupHelper } from "../admin/SetupHelper";
import { useInventory } from "@/hooks/useInventory";
import { useVendors } from "@/hooks/useVendors";

export const LibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("fabrics");
  const [showFabricForm, setShowFabricForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  // Fetch real data from database
  const { data: inventory = [] } = useInventory();
  const { data: vendors = [] } = useVendors();

  // Transform inventory data to fabric format
  const fabrics = inventory
    .filter(item => item.category === "Fabric")
    .map(item => ({
      id: item.id, // Keep as string
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

  // Transform vendors to brands format
  const brands = vendors.map(vendor => ({
    id: vendor.id, // Keep as string
    name: vendor.name,
    collections: 0, // Would need a separate query to count collections
    fabrics: inventory.filter(item => item.supplier === vendor.name).length
  }));

  // Mock collections for now
  const mockCollections = [
    { id: 1, name: "Classic Collection", brand: "Fibre Naturelle", fabrics: 45 },
    { id: 2, name: "Modern Series", brand: "KD Design", fabrics: 32 },
    { id: 3, name: "Heritage Line", brand: "DEKOMA", fabrics: 67 },
  ];

  const filteredFabrics = fabrics.filter(fabric =>
    fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
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
        collections={mockCollections}
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
