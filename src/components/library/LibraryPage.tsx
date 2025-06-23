
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Search, Filter, List, LayoutGrid, Edit, Trash2, Copy } from "lucide-react";
import { FabricForm } from "./FabricForm";
import { BrandForm } from "./BrandForm";
import { CollectionForm } from "./CollectionForm";
import { FilterDialog } from "./FilterDialog";

export const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState("fabric");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addDialogType, setAddDialogType] = useState<"brand" | "collection" | "fabric">("fabric");

  // Mock data for demonstration
  const brands = [
    { id: 1, name: "Fibre Naturelle", logo: "/placeholder.svg" },
    { id: 2, name: "KD Design", logo: "/placeholder.svg" },
    { id: 3, name: "DEKOMA", logo: "/placeholder.svg" },
  ];

  const fabrics = [
    {
      id: 1,
      name: "Merlon Custard",
      code: "K5361/02",
      price: 120.00,
      unit: "cm",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
      stock: "In Stock",
      brand: "Fibre Naturelle"
    },
    {
      id: 2,
      name: "Merlon Custard",
      code: "K5361/02",
      price: 130.00,
      unit: "cm",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
      stock: "In Stock",
      brand: "Fibre Naturelle"
    },
    {
      id: 3,
      name: "OSL/04 Cinnamon",
      code: "OSL/04",
      price: 91.00,
      unit: "cm",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
      stock: "In Stock",
      brand: "KD Design"
    },
    {
      id: 4,
      name: "OSL/02 Sage",
      code: "OSL/02",
      price: 91.00,
      unit: "cm",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      stock: "In Stock",
      brand: "KD Design"
    },
    {
      id: 5,
      name: "OSL/01 Pepper",
      code: "OSL/01",
      price: 91.00,
      unit: "cm",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
      stock: "In Stock",
      brand: "DEKOMA"
    },
  ];

  const handleAddNew = (type: "brand" | "collection" | "fabric") => {
    setAddDialogType(type);
    setShowAddDialog(true);
  };

  const renderFabricCard = (fabric: any) => (
    <Card key={fabric.id} className="relative group">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
          {fabric.image ? (
            <img 
              src={fabric.image} 
              alt={fabric.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold mb-2">{fabric.name}</CardTitle>
        <p className="text-sm text-gray-600 mb-1">${fabric.price.toFixed(2)}/{fabric.unit}</p>
        <p className="text-sm text-gray-500 mb-2">{fabric.code}</p>
        <p className="text-sm text-gray-500 mb-4">Stock: {fabric.stock}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderBrandCard = (brand: any) => (
    <Card key={brand.id} className="relative group">
      <CardContent className="p-6">
        <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <span className="text-xl font-semibold text-gray-600">{brand.name}</span>
        </div>
        <CardTitle className="text-lg font-semibold text-center">{brand.name}</CardTitle>
        <div className="flex justify-center space-x-2 mt-4">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Library</h1>
        <div className="flex items-center space-x-2">
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
                  onClick={() => handleAddNew("brand")}
                >
                  Create Brand
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => handleAddNew("collection")}
                >
                  Create Collection
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => handleAddNew("fabric")}
                >
                  Create Fabric
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Upload Fabrics via CSV
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="brands">
              Fabric brand ({brands.length})
            </TabsTrigger>
            <TabsTrigger value="collections">
              Fabric Collection (13)
            </TabsTrigger>
            <TabsTrigger value="fabric">
              Fabric ({fabrics.length})
            </TabsTrigger>
          </TabsList>
          
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
        </div>

        {/* Select All Checkbox */}
        <div className="flex items-center space-x-2 mt-4">
          <input type="checkbox" id="selectAll" className="rounded" />
          <label htmlFor="selectAll" className="text-sm text-gray-600">
            Select all
          </label>
        </div>

        {/* Tab Contents */}
        <TabsContent value="brands" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brands.map(renderBrandCard)}
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            No collections available. Create your first collection to get started!
          </div>
        </TabsContent>

        <TabsContent value="fabric" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fabrics.map(renderFabricCard)}
          </div>
          <div className="text-center py-4">
            <Button variant="ghost" className="text-gray-500">
              Show more
            </Button>
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
              Add {addDialogType === "brand" ? "Brand" : addDialogType === "collection" ? "Collection" : "Fabric"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {addDialogType === "fabric" && <FabricForm onClose={() => setShowAddDialog(false)} />}
            {addDialogType === "brand" && <BrandForm onClose={() => setShowAddDialog(false)} />}
            {addDialogType === "collection" && <CollectionForm onClose={() => setShowAddDialog(false)} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
