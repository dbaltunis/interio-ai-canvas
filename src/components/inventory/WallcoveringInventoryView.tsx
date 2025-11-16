import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Wallpaper, Image as ImageIcon, Trash2, Edit, QrCode } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { EditInventoryDialog } from "./EditInventoryDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JobsPagination } from "../jobs/JobsPagination";
import { useBulkInventorySelection } from "@/hooks/useBulkInventorySelection";
import { InventoryBulkActionsBar } from "./InventoryBulkActionsBar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface WallcoveringInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
  selectedVendor?: string;
  selectedCollection?: string;
  selectedStorageLocation?: string;
}

const WALLCOVERING_CATEGORIES = [
  { key: "all", label: "All Wallcoverings" },
  { key: "plain_wallpaper", label: "Plain Wallpapers" },
  { key: "patterned_wallpaper", label: "Patterned Wallpapers" },
  { key: "wall_panels_murals", label: "Wall Panels / Murals" }
];

const ITEMS_PER_PAGE = 24;

export const WallcoveringInventoryView = ({ searchQuery, viewMode, selectedVendor, selectedCollection, selectedStorageLocation }: WallcoveringInventoryViewProps) => {
  const { data: inventory, refetch } = useEnhancedInventory();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const wallcoveringItems = inventory?.filter(item => 
    item.category === 'wallcovering'
  ) || [];

  // Bulk selection
  const {
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    selectionStats,
  } = useBulkInventorySelection(wallcoveringItems);

  const filteredItems = wallcoveringItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || 
      item.subcategory === activeCategory;

    const matchesVendor = !selectedVendor || item.vendor_id === selectedVendor;
    const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
    const matchesLocation = !selectedStorageLocation || item.location === selectedStorageLocation;

    return matchesSearch && matchesCategory && matchesVendor && matchesCollection && matchesLocation;
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallcovering?')) return;

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete wallcovering",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Wallcovering deleted successfully",
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

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="bg-background border-b border-border/50 rounded-none p-0 h-auto flex w-full justify-start gap-0">
          {WALLCOVERING_CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.key}
              value={cat.key}
              className="px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold rounded-none text-muted-foreground hover:text-foreground"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {WALLCOVERING_CATEGORIES.map((cat) => (
          <TabsContent key={cat.key} value={cat.key} className="mt-6 space-y-4">
            {selectedItems.length > 0 && (
        <InventoryBulkActionsBar
          selectedCount={selectedItems.length}
          onClearSelection={clearSelection}
          onBulkDelete={handleBulkDelete}
          selectedItems={wallcoveringItems.filter(item => selectedItems.includes(item.id))}
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
                          <Wallpaper className="h-12 w-12 text-muted-foreground" />
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
                        {/* Selling Unit Badge */}
                        {(item as any).wallpaper_sold_by && (
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-muted-foreground">Sold By:</span>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                              {(item as any).wallpaper_sold_by === 'per_roll' ? 'Per Roll' : 
                               (item as any).wallpaper_sold_by === 'per_unit' ? 'Per Meter' : 
                               (item as any).wallpaper_sold_by === 'per_sqm' ? 'Per m²' : 'Per Unit'}
                            </Badge>
                          </div>
                        )}
                        {item.supplier && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Supplier:</span>
                            <span className="font-medium">{item.supplier}</span>
                          </div>
                        )}
                        {(item as any).wallpaper_roll_width && (item as any).wallpaper_roll_length ? (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Roll Size:</span>
                            <span className="font-medium">
                              {(item as any).wallpaper_roll_width}cm × {(item as any).wallpaper_roll_length}m
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Roll Size:</span>
                            <Badge variant="secondary" className="text-xs">Not specified</Badge>
                          </div>
                        )}
                        {item.pattern_repeat_vertical ? (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pattern Repeat:</span>
                            <span className="font-medium">{item.pattern_repeat_vertical}cm</span>
                          </div>
                        ) : null}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-bold text-primary">
                            {formatPrice(item.price_per_meter || item.selling_price || 0)}
                            {(item as any).wallpaper_sold_by && (
                              <span className="text-xs text-muted-foreground ml-1">
                                /{(item as any).wallpaper_sold_by === 'per_roll' ? 'roll' : 
                                  (item as any).wallpaper_sold_by === 'per_unit' ? 'm' : 
                                  (item as any).wallpaper_sold_by === 'per_sqm' ? 'm²' : 'unit'}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Stock:</span>
                          {item.quantity > 0 || (item as any).stock_quantity > 0 ? (
                            <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                              {(item as any).stock_quantity || item.quantity || 0} {(item as any).wallpaper_sold_by === 'per_roll' ? 'rolls' : 'units'}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                              Not tracked
                            </Badge>
                          )}
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
                <div className="rounded-md border bg-card">
                <table className="w-full">
                  <thead className="bg-muted/20 border-b">
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
                      <th className="px-4 py-3 text-left text-sm font-medium">Sold By</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Roll Size</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Pattern Repeat</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">QR</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item) => {
                      const isSelected = selectedItems.includes(item.id);
                      return (
                        <tr key={item.id} className="border-t hover:bg-accent/50 transition-colors">
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
                          <td className="px-4 py-3">
                            {(item as any).wallpaper_sold_by ? (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
                                {(item as any).wallpaper_sold_by === 'per_roll' ? 'Per Roll' : 
                                 (item as any).wallpaper_sold_by === 'per_unit' ? 'Per Meter' : 
                                 (item as any).wallpaper_sold_by === 'per_sqm' ? 'Per m²' : 'Per Unit'}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {(item as any).wallpaper_roll_width && (item as any).wallpaper_roll_length ? (
                              <span>{(item as any).wallpaper_roll_width}cm × {(item as any).wallpaper_roll_length}m</span>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Not specified</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.pattern_repeat_vertical ? `${item.pattern_repeat_vertical}cm` : '-'}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            <div className="flex flex-col">
                              <span>{formatPrice(item.price_per_meter || item.selling_price || 0)}</span>
                              {(item as any).wallpaper_sold_by && (
                                <span className="text-xs text-muted-foreground">
                                  per {(item as any).wallpaper_sold_by === 'per_roll' ? 'roll' : 
                                       (item as any).wallpaper_sold_by === 'per_unit' ? 'meter' : 
                                       (item as any).wallpaper_sold_by === 'per_sqm' ? 'm²' : 'unit'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {item.quantity > 0 || (item as any).stock_quantity > 0 ? (
                              <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                                {(item as any).stock_quantity || item.quantity || 0} {(item as any).wallpaper_sold_by === 'per_roll' ? 'rolls' : 'units'}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                                Not tracked
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <QrCode className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto">
                                <QRCodeDisplay
                                  itemId={item.id}
                                  itemName={item.name}
                                  size={180}
                                  showActions={false}
                                />
                              </PopoverContent>
                            </Popover>
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
                    <Wallpaper className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No wallcoverings found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? 'Try adjusting your search' : 'Add your first wallcovering to get started'}
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
