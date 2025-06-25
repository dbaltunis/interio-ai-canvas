
import { useState } from "react";
import { LibraryHeader } from "./LibraryHeader";
import { LibrarySearch } from "./LibrarySearch";
import { LibraryTabs } from "./LibraryTabs";
import { LibraryDialogs } from "./LibraryDialogs";

const mockFabrics = [
  {
    id: 1,
    name: "Velvet Luxe",
    code: "VL-001",
    brand: "Fibre Naturelle",
    collection: "Classic Collection",
    type: "Velvet",
    color: "Navy Blue",
    pattern: "Solid",
    width: 140,
    price: 45.50,
    image: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Silk Shimmer",
    code: "SS-002",
    brand: "KD Design",
    collection: "Modern Series",
    type: "Silk",
    color: "Champagne",
    pattern: "Textured",
    width: 150,
    price: 65.00,
    image: "/placeholder.svg"
  },
];

const mockBrands = [
  { id: 1, name: "Fibre Naturelle", collections: 8, fabrics: 156 },
  { id: 2, name: "KD Design", collections: 5, fabrics: 89 },
  { id: 3, name: "DEKOMA", collections: 12, fabrics: 234 },
];

const mockCollections = [
  { id: 1, name: "Classic Collection", brand: "Fibre Naturelle", fabrics: 45 },
  { id: 2, name: "Modern Series", brand: "KD Design", fabrics: 32 },
  { id: 3, name: "Heritage Line", brand: "DEKOMA", fabrics: 67 },
];

export const LibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("fabrics");
  const [showFabricForm, setShowFabricForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  const filteredFabrics = mockFabrics.filter(fabric =>
    fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
        brands={mockBrands}
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
