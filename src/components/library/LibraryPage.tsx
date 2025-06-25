
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Package, Palette, Building, Upload, Download } from "lucide-react";
import { FabricForm } from "./FabricForm";
import { BrandForm } from "./BrandForm";
import { CollectionForm } from "./CollectionForm";
import { FilterDialog } from "./FilterDialog";
import { FabricCSVUpload } from "./FabricCSVUpload";

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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Fabric Library</h1>
          <p className="text-brand-neutral">Manage your fabric catalog, brands, and collections</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={() => setShowCSVUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button className="bg-brand-primary hover:bg-brand-accent" onClick={() => setShowFabricForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Fabric
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search fabrics, codes, or brands..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fabrics" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Fabrics
          </TabsTrigger>
          <TabsTrigger value="brands" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Brands
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Collections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fabrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFabrics.map((fabric) => (
              <Card key={fabric.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <img
                    src={fabric.image}
                    alt={fabric.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-brand-primary">{fabric.name}</h3>
                      <p className="text-sm text-brand-neutral">Code: {fabric.code}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">{fabric.type}</Badge>
                      <Badge variant="secondary" className="text-xs">{fabric.color}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-brand-neutral">{fabric.width}cm wide</span>
                      <span className="font-semibold text-brand-primary">${fabric.price}</span>
                    </div>
                    <p className="text-xs text-brand-neutral">{fabric.brand} - {fabric.collection}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="brands" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-brand-primary">Fabric Brands</h2>
            <Button onClick={() => setShowBrandForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockBrands.map((brand) => (
              <Card key={brand.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{brand.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-brand-neutral">Collections:</span>
                      <span className="font-medium">{brand.collections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-brand-neutral">Fabrics:</span>
                      <span className="font-medium">{brand.fabrics}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-brand-primary">Fabric Collections</h2>
            <Button onClick={() => setShowCollectionForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Collection
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCollections.map((collection) => (
              <Card key={collection.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{collection.name}</CardTitle>
                  <CardDescription>{collection.brand}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <span className="text-sm text-brand-neutral">Fabrics:</span>
                    <span className="font-medium">{collection.fabrics}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showFabricForm} onOpenChange={setShowFabricForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Fabric</DialogTitle>
          </DialogHeader>
          <FabricForm onClose={() => setShowFabricForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showBrandForm} onOpenChange={setShowBrandForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
          </DialogHeader>
          <BrandForm onClose={() => setShowBrandForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showCollectionForm} onOpenChange={setShowCollectionForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Collection</DialogTitle>
          </DialogHeader>
          <CollectionForm onClose={() => setShowCollectionForm(false)} />
        </DialogContent>
      </Dialog>

      <FilterDialog 
        open={showFilterDialog} 
        onOpenChange={setShowFilterDialog} 
      />

      <Dialog open={showCSVUpload} onOpenChange={setShowCSVUpload}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Fabrics from CSV</DialogTitle>
          </DialogHeader>
          <FabricCSVUpload onClose={() => setShowCSVUpload(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
