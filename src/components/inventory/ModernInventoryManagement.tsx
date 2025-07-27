import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  Package, 
  Palette, 
  Wrench,
  TrendingUp,
  TrendingDown,
  Filter,
  Grid3X3,
  List,
  Eye,
  Edit,
  ShoppingCart,
  BarChart3,
  Scissors,
  Layers
} from "lucide-react";
import { InventoryHeader } from "./InventoryHeader";
import { InventoryStats } from "./InventoryStats";
import { InventoryGridView } from "./InventoryGridView";
import { InventoryListView } from "./InventoryListView";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { InventoryFilters } from "./InventoryFilters";
import { useInventory, useLowStockItems } from "@/hooks/useInventory";

type ViewMode = "grid" | "list";
type CategoryFilter = "all" | "fabrics" | "hardware" | "accessories";

export const ModernInventoryManagement = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: inventory, isLoading } = useInventory();
  const { data: lowStockItems } = useLowStockItems();

  // Filter inventory based on search and category
  const filteredInventory = inventory?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || 
                           (categoryFilter === "fabrics" && (item.category?.toLowerCase().includes("fabric") || item.category?.toLowerCase().includes("textile"))) ||
                           (categoryFilter === "hardware" && (item.category?.toLowerCase().includes("hardware") || item.category?.toLowerCase().includes("track") || item.category?.toLowerCase().includes("rod"))) ||
                           (categoryFilter === "accessories" && item.category?.toLowerCase().includes("accessories"));
    
    return matchesSearch && matchesCategory;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <InventoryHeader 
        onAddItem={() => setShowAddDialog(true)}
        itemCount={inventory?.length || 0}
        lowStockCount={lowStockItems?.length || 0}
      />

      {/* Stats Overview */}
      <InventoryStats inventory={inventory || []} lowStockItems={lowStockItems || []} />

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search fabrics, hardware, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>

            {/* Category Tabs */}
            <Tabs value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CategoryFilter)} className="w-auto">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="fabrics" className="text-xs">
                  <Palette className="h-3 w-3 mr-1" />
                  Fabrics
                </TabsTrigger>
                <TabsTrigger value="hardware" className="text-xs">
                  <Wrench className="h-3 w-3 mr-1" />
                  Hardware
                </TabsTrigger>
                <TabsTrigger value="accessories" className="text-xs">
                  <Scissors className="h-3 w-3 mr-1" />
                  Access.
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* View Mode & Filters */}
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <InventoryFilters />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Content */}
      {filteredInventory.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || categoryFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Start building your inventory by adding your first item"}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <InventoryGridView 
          inventory={filteredInventory} 
          lowStockItems={lowStockItems || []}
        />
      ) : (
        <InventoryListView 
          inventory={filteredInventory} 
          lowStockItems={lowStockItems || []}
        />
      )}

      {/* Add Item Dialog */}
      <AddInventoryDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};