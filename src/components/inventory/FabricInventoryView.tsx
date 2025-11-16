import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, Plus, Search, Image as ImageIcon, Trash2, Edit, FileSpreadsheet } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { EditInventoryDialog } from "./EditInventoryDialog";
import { CategoryImportExport } from "./CategoryImportExport";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JobsPagination } from "../jobs/JobsPagination";
import { useBulkInventorySelection } from "@/hooks/useBulkInventorySelection";
import { InventoryBulkActionsBar } from "./InventoryBulkActionsBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FabricInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
}

const FABRIC_CATEGORIES = [
  { key: "all", label: "All Fabrics" },
  { key: "curtain_fabric", label: "Curtain Fabrics" },
  { key: "roller_fabric", label: "Roller Fabrics" },
  { key: "furniture_fabric", label: "Furniture Fabrics" },
  { key: "sheer_fabric", label: "Sheer Fabrics" }
];

const ITEMS_PER_PAGE = 24;

export const FabricInventoryView = ({ searchQuery, viewMode }: FabricInventoryViewProps) => {
  const { data: inventory, refetch } = useEnhancedInventory();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [localSearch, setLocalSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pricingGrids, setPricingGrids] = useState<Array<{ id: string; grid_code: string | null; name: string }>>([]);

  const fabricItems = inventory?.filter(item => 
    item.category === 'fabric'
  ) || [];

  // Bulk selection
  const {
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    selectionStats,
  } = useBulkInventorySelection(fabricItems);

  // Fetch pricing grids for displaying grid names
  useEffect(() => {
    const fetchPricingGrids = async () => {
      const { data } = await supabase
        .from('pricing_grids')
        .select('id, grid_code, name')
        .eq('active', true);
      
      if (data) {
        setPricingGrids(data);
      }
    };
    
    fetchPricingGrids();
  }, []);

  const filteredItems = fabricItems.filter(item => {
    const matchesGlobalSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocalSearch = item.name?.toLowerCase().includes(localSearch.toLowerCase()) ||
      item.sku?.toLowerCase().includes(localSearch.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(localSearch.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || 
      item.subcategory === activeCategory;

    return matchesGlobalSearch && matchesLocalSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };
  
  const handleSearchChange = (search: string) => {
    setLocalSearch(search);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fabric?')) return;

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete fabric",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Fabric deleted successfully",
      });
      refetch();
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedItems.map(itemId => 
          supabase.from('inventory').delete().eq('id', itemId)
        )
      );
      
      toast({
        title: "Items deleted",
        description: `${selectedItems.length} items deleted successfully`,
      });
      clearSelection();
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some items",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Home className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Fabrics</h2>
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} fabrics in inventory
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fabrics..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Import/Export
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import/Export Fabrics</DialogTitle>
              </DialogHeader>
              <CategoryImportExport category="fabrics" onImportComplete={refetch} />
            </DialogContent>
          </Dialog>
          <AddInventoryDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            }
            initialCategory="fabric"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="bg-background border-b border-border/50 rounded-none p-0 h-auto flex w-full justify-start gap-0">
          {FABRIC_CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.key}
              value={cat.key}
              className="px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold rounded-none text-muted-foreground hover:text-foreground"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {FABRIC_CATEGORIES.map((cat) => (
          <TabsContent key={cat.key} value={cat.key} className="mt-6 space-y-4">
            {selectedItems.length > 0 && (
              <InventoryBulkActionsBar
                selectedCount={selectedItems.length}
                onClearSelection={clearSelection}
                onBulkDelete={handleBulkDelete}
              />
            )}
            
            {viewMode === "grid" ? (
              <>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {paginatedItems.map((item) => (
                  <Card key={item.id} className="group hover:shadow-lg transition-all overflow-hidden">
                    <div className="aspect-[16/5] relative overflow-hidden bg-muted">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <EditInventoryDialog 
                          item={item}
                          trigger={
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
                      <CardDescription className="text-xs">{item.sku || 'No SKU'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        {item.supplier && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Supplier:</span>
                            <span className="font-medium">{item.supplier}</span>
                          </div>
                        )}
                        {item.fabric_width && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Width:</span>
                            <span className="font-medium">{item.fabric_width}cm</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.price_group ? 'Pricing Grid:' : 'Price:'}
                          </span>
                          <span className="font-bold text-primary">
                            {item.price_group ? (
                              pricingGrids.find(g => g.grid_code === item.price_group || g.id === item.price_group)?.name || item.price_group
                            ) : (
                              `${formatPrice(item.price_per_meter || item.selling_price || 0)}/m`
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Stock:</span>
                          <Badge variant={item.quantity && item.quantity > 0 ? "default" : "secondary"}>
                            {item.quantity || 0}m
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
                {totalPages > 1 && (
                  <JobsPagination
                    currentPage={currentPage}
                    totalItems={filteredItems.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            ) : (
              <>
                <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 w-12">
                        <Checkbox
                          checked={selectionStats.allSelected}
                          onCheckedChange={(checked) => selectAll(!!checked)}
                          aria-label="Select all"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Supplier</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Width</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item) => {
                      const isSelected = selectedItems.includes(item.id);
                      return (
                        <tr key={item.id} className="border-t hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => selectItem(item.id, !!checked)}
                              aria-label={`Select ${item.name}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded object-cover" />
                            ) : (
                              <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{item.sku || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.supplier || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.fabric_width ? `${item.fabric_width}cm` : '-'}</td>
                          <td className="px-4 py-3 font-medium">
                            {formatPrice(item.price_per_meter || item.selling_price || 0)}/m
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={item.quantity && item.quantity > 0 ? "default" : "secondary"}>
                              {item.quantity || 0}m
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <EditInventoryDialog 
                                item={item}
                                trigger={
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <JobsPagination
                  currentPage={currentPage}
                  totalItems={filteredItems.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
            )}

            {filteredItems.length === 0 && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-muted">
                    <Home className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No fabrics found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {localSearch || searchQuery ? 'Try adjusting your search' : 'Add your first fabric to get started'}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};