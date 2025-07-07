import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Search, Filter, List, LayoutGrid, Edit, Trash2, Copy, Package, AlertTriangle, Wrench, ShoppingCart, FolderTree } from "lucide-react";
import { FabricForm } from "./FabricForm";
import { BrandForm } from "./BrandForm";
import { CollectionForm } from "./CollectionForm";
import { FilterDialog } from "./FilterDialog";
import { VendorForm } from "./VendorForm";
import { HardwareForm } from "./HardwareForm";
import { CategoryManager } from "./CategoryManager";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { toast } from "sonner";

export const LibraryPage = () => {
  const { units, getFabricUnitLabel, formatFabric } = useMeasurementUnits();
  const [activeTab, setActiveTab] = useState("fabrics");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addDialogType, setAddDialogType] = useState<"vendor" | "fabric" | "hardware" | "collection">("fabric");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return `${currencySymbols[units.currency] || units.currency}${amount.toFixed(2)}`;
  };

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

  const handleProductSelect = (productId: string, productType: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
      toast.success(`${productType} removed from selection`);
    } else {
      setSelectedProducts(prev => [...prev, productId]);
      toast.success(`${productType} added to selection`);
    }
  };

  const handleAddToProject = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }
    
    toast.success(`${selectedProducts.length} products ready to add to project`);
    console.log("Selected products for project:", selectedProducts);
  };

  const handleAddNew = (type: "vendor" | "fabric" | "hardware" | "collection") => {
    setAddDialogType(type);
    setShowAddDialog(true);
  };

  const getStockStatus = (current: number, reorderPoint: number) => {
    if (current <= reorderPoint * 0.5) return { status: "Critical", color: "bg-red-500" };
    if (current <= reorderPoint) return { status: "Low Stock", color: "bg-orange-500" };
    return { status: "In Stock", color: "bg-green-500" };
  };

  const renderVendorCard = (vendor: any) => (
    <Card key={vendor.id} className="relative group hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <CardTitle className="text-lg font-semibold mb-1">{vendor.name}</CardTitle>
            <Badge variant="outline" className="mb-2">{vendor.type}</Badge>
            <p className="text-sm text-gray-600 mb-1">{vendor.country}</p>
            <p className="text-sm text-gray-500">{vendor.contact}</p>
            <p className="text-sm text-gray-500">{vendor.phone}</p>
          </div>
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Products</p>
            <p className="font-semibold">{vendor.products}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Order</p>
            <p className="font-semibold">{vendor.lastOrder}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderFabricCard = (fabric: any) => {
    const stockStatus = getStockStatus(fabric.inStock, fabric.reorderPoint);
    const isSelected = selectedProducts.includes(fabric.id.toString());
    
    return (
      <Card 
        key={fabric.id} 
        className={`relative group hover:shadow-lg transition-shadow cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
        onClick={() => handleProductSelect(fabric.id.toString(), 'Fabric')}
      >
        <CardHeader className="p-0">
          <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
            <img 
              src={fabric.image} 
              alt={fabric.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge className={`${stockStatus.color} text-white`}>
                {stockStatus.status}
              </Badge>
              {isSelected && (
                <Badge variant="default" className="bg-blue-500">
                  Selected
                </Badge>
              )}
            </div>
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                {fabric.pattern}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold mb-2">{fabric.name}</CardTitle>
          <p className="text-sm text-gray-600 mb-1">{fabric.code}</p>
          <p className="text-sm text-gray-500 mb-1">{fabric.vendor}</p>
          <p className="text-sm text-gray-500 mb-1">{fabric.category}</p>
          <p className="text-sm text-gray-500 mb-3">{fabric.collection}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-semibold">{formatCurrency(fabric.price)}/{getFabricUnitLabel()}</p>
            </div>
            <div>
              <p className="text-gray-500">In Stock</p>
              <p className="font-semibold">{formatFabric(fabric.inStock)}</p>
            </div>
            <div>
              <p className="text-gray-500">Width</p>
              <p className="font-semibold">{fabric.width}</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-semibold">{fabric.location}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-500 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {fabric.inStock <= fabric.reorderPoint && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHardwareCard = (hardware: any) => {
    const stockStatus = getStockStatus(hardware.inStock, hardware.reorderPoint);
    const isSelected = selectedProducts.includes(hardware.id.toString());
    
    return (
      <Card 
        key={hardware.id} 
        className={`relative group hover:shadow-lg transition-shadow cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
        onClick={() => handleProductSelect(hardware.id.toString(), 'Hardware')}
      >
        <CardHeader className="p-0">
          <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
            <img 
              src={hardware.image} 
              alt={hardware.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge className={`${stockStatus.color} text-white`}>
                {stockStatus.status}
              </Badge>
              {isSelected && (
                <Badge variant="default" className="bg-blue-500">
                  Selected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold mb-2">{hardware.name}</CardTitle>
          <p className="text-sm text-gray-600 mb-1">{hardware.code}</p>
          <p className="text-sm text-gray-500 mb-1">{hardware.vendor}</p>
          <Badge variant="secondary" className="mb-3 text-xs">{hardware.category}</Badge>
          
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-semibold">{formatCurrency(hardware.price)}/{hardware.unit}</p>
            </div>
            <div>
              <p className="text-gray-500">In Stock</p>
              <p className="font-semibold">{hardware.inStock} {hardware.unit}s</p>
            </div>
            <div>
              <p className="text-gray-500">Material</p>
              <p className="font-semibold">{hardware.material}</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-semibold">{hardware.location}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-500 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {hardware.inStock <= hardware.reorderPoint && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-gray-600">Manage fabrics, hardware, and vendor relationships</p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedProducts.length > 0 && (
            <Button
              onClick={handleAddToProject}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Project ({selectedProducts.length})
            </Button>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button className="bg-slate-600 hover:bg-slate-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => handleAddNew("vendor")}
                >
                  Add Vendor/Supplier
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => handleAddNew("fabric")}
                >
                  Add Fabric
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => handleAddNew("hardware")}
                >
                  Add Hardware
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => handleAddNew("collection")}
                >
                  Add Collection
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Import from CSV
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" className="bg-slate-600 hover:bg-slate-700 text-white border-slate-600">
            <Search className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-slate-600 hover:bg-slate-700 text-white border-slate-600"
            onClick={() => setShowFilterDialog(true)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedProducts.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Selected Products: {selectedProducts.length}</p>
                <p className="text-sm text-gray-600">Ready to add to project or calculate fabric usage</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedProducts([])}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-5">
            <TabsTrigger value="categories">
              <FolderTree className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="vendors">
              Vendors ({vendors.length})
            </TabsTrigger>
            <TabsTrigger value="fabrics">
              Fabrics ({fabrics.length})
            </TabsTrigger>
            <TabsTrigger value="hardware">
              Hardware ({hardware.length})
            </TabsTrigger>
            <TabsTrigger value="collections">
              Collections (8)
            </TabsTrigger>
          </TabsList>
          
          {activeTab !== 'categories' && (
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Card
              </Button>
            </div>
          )}
        </div>

        {/* Tab Contents */}
        <TabsContent value="categories" className="space-y-4">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vendors.map(renderVendorCard)}
          </div>
        </TabsContent>

        <TabsContent value="fabrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fabrics.map(renderFabricCard)}
          </div>
        </TabsContent>

        <TabsContent value="hardware" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hardware.map(renderHardwareCard)}
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            No collections available. Create your first collection to organize your inventory!
          </div>
        </TabsContent>
      </Tabs>

      {/* Filter Dialog */}
      <FilterDialog 
        open={showFilterDialog} 
        onOpenChange={setShowFilterDialog}
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
    </div>
  );
};
