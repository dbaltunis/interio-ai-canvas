import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, Image as ImageIcon, Trash2, Edit, QrCode, FileSpreadsheet } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { CategoryImportExport } from "./CategoryImportExport";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditInventoryDialog } from "./EditInventoryDialog";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JobsPagination } from "../jobs/JobsPagination";
import { useBulkInventorySelection } from "@/hooks/useBulkInventorySelection";
import { InventoryBulkActionsBar } from "./InventoryBulkActionsBar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { useInventoryLeftovers } from "@/hooks/useInventoryLeftovers";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InventoryQuickView } from "./InventoryQuickView";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";

interface FabricInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
  selectedVendor?: string;
  selectedCollection?: string;
  selectedStorageLocation?: string;
}

const FABRIC_CATEGORIES = [
  { key: "all", label: "All Fabrics" },
  { key: "curtain_fabric", label: "Curtain & Roman Fabrics" },
  { key: "roller_fabric", label: "Roller Blind Fabrics" },
  { key: "cellular", label: "Cellular/Honeycomb" },
  { key: "vertical_fabric", label: "Vertical Blind Fabrics" },
  { key: "awning_fabric", label: "Awning Fabrics" },
  { key: "lining_fabric", label: "Lining Fabrics" },
  { key: "upholstery_fabric", label: "Upholstery Fabrics" },
  { key: "fabric", label: "Other Fabrics" }
];

const ITEMS_PER_PAGE = 24;

export const FabricInventoryView = ({ searchQuery, viewMode, selectedVendor, selectedCollection, selectedStorageLocation }: FabricInventoryViewProps) => {
  const { data: inventory, refetch } = useEnhancedInventory();
  const { toast } = useToast();
  const { formatCurrency: formatPrice } = useFormattedCurrency();
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pricingGrids, setPricingGrids] = useState<Array<{ id: string; grid_code: string | null; name: string }>>([]);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [quickViewItem, setQuickViewItem] = useState<any>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  
  // Get leftover fabric totals for inventory badges
  const { data: leftovers = [] } = useInventoryLeftovers();

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
  
  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fabric?')) return;

    const { error } = await supabase
      .from('enhanced_inventory_items')
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
          supabase.from('enhanced_inventory_items').delete().eq('id', itemId)
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


  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} fabric{filteredItems.length !== 1 ? 's' : ''} found
        </p>
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
          selectedItems={fabricItems.filter(item => selectedItems.includes(item.id))}
        />
            )}
            
            {viewMode === "grid" ? (
              <>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {paginatedItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="group hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                    onClick={() => {
                      setQuickViewItem(item);
                      setShowQuickView(true);
                    }}
                  >
                    <div 
                      className="aspect-[16/5] relative overflow-hidden bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.image_url) setPreviewImage({ url: item.image_url, title: item.name });
                      }}
                    >
                      <ProductImageWithColorFallback
                        imageUrl={item.image_url}
                        color={item.color}
                        productName={item.name}
                        category="fabric"
                        className="w-full h-full group-hover:scale-105 transition-transform"
                        size={200}
                        rounded="none"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <EditInventoryDialog 
                          item={item}
                          trigger={
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
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
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t">
                          {item.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="pt-2 border-t space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Stock:</span>
                          <Badge variant={item.quantity && item.quantity > 0 ? "default" : "secondary"}>
                            {item.quantity || 0}m
                          </Badge>
                        </div>
                        {(() => {
                          const leftover = leftovers.find(l => l.fabric_id === item.id);
                          if (leftover && leftover.total_leftover_sqm > 0) {
                            return (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center justify-between cursor-help">
                                      <span className="text-xs text-muted-foreground">Leftover:</span>
                                      <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100">
                                        {leftover.total_leftover_sqm.toFixed(2)} sqm
                                      </Badge>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{leftover.piece_count} leftover piece(s) available from previous projects</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          }
                          return null;
                        })()}
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
                      <th className="px-2 py-1 w-8">
                        <Checkbox
                          checked={selectionStats.allSelected}
                          onCheckedChange={(checked) => selectAll(!!checked)}
                          aria-label="Select all"
                        />
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium">Image</th>
                      <th className="px-2 py-1 text-left text-xs font-medium">Name</th>
                      <th className="px-2 py-1 text-left text-xs font-medium">SKU</th>
                      <th className="px-2 py-1 text-left text-xs font-medium">Supplier</th>
                      <th className="px-2 py-1 text-left text-xs font-medium">Width</th>
                      <th className="px-2 py-1 text-left text-xs font-medium">Price</th>
                      <th className="px-2 py-1 text-left text-xs font-medium">Stock</th>
                      <th className="px-2 py-1 text-left text-xs font-medium">Tags</th>
                      <th className="px-2 py-1 text-left text-xs font-medium">QR</th>
                      <th className="px-2 py-1 text-left text-xs font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item) => {
                      const isSelected = selectedItems.includes(item.id);
                      return (
                        <tr key={item.id} className="border-t hover:bg-accent/50 transition-colors">
                          <td className="px-2 py-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => selectItem(item.id, !!checked)}
                              aria-label={`Select ${item.name}`}
                            />
                          </td>
                          <td className="px-2 py-1">
                            {item.image_url ? (
                              <img 
                                src={item.image_url} 
                                alt={item.name} 
                                crossOrigin="anonymous" 
                                className="h-8 w-8 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                                onClick={() => setPreviewImage({ url: item.image_url!, title: item.name })}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-1 text-xs font-medium">{item.name}</td>
                          <td className="px-2 py-1 text-xs text-muted-foreground">{item.sku || '-'}</td>
                          <td className="px-2 py-1 text-xs">{item.supplier || '-'}</td>
                          <td className="px-2 py-1 text-xs">{item.fabric_width ? `${item.fabric_width}cm` : '-'}</td>
                          <td className="px-2 py-1 text-xs font-medium">
                            {item.pricing_grid_id ? (
                              <span className="text-primary">Grid</span>
                            ) : (
                              <>{formatPrice(item.price_per_meter || item.selling_price || 0)}/m</>
                            )}
                          </td>
                          <td className="px-2 py-1">
                            <div className="flex flex-col gap-0.5">
                              <Badge variant={item.quantity && item.quantity > 0 ? "default" : "secondary"} className="text-xs py-0 h-5">
                                {item.quantity || 0}m
                              </Badge>
                              {(() => {
                                const leftover = leftovers.find(l => l.fabric_id === item.id);
                                if (leftover && leftover.total_leftover_sqm > 0) {
                                  return (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge variant="outline" className="w-fit text-xs py-0 h-5 bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 cursor-help">
                                            +{leftover.total_leftover_sqm.toFixed(1)}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{leftover.piece_count} leftover piece(s)</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </td>
                          <td className="px-2 py-1">
                            {item.tags && item.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-0.5">
                                {item.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0 h-4">
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                    +{item.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </td>
                          <td className="px-2 py-1">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <QrCode className="h-3 w-3" />
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
                          <td className="px-2 py-1">
                            <div className="flex items-center gap-1">
                              <EditInventoryDialog 
                                item={item}
                                trigger={
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
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
                      {searchQuery ? 'Try adjusting your search' : 'Add your first fabric to get started'}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {previewImage && (
        <ImagePreviewDialog
          open={!!previewImage}
          onOpenChange={(open) => !open && setPreviewImage(null)}
          imageUrl={previewImage.url}
          title={previewImage.title}
        />
      )}
      
      {quickViewItem && (
        <InventoryQuickView
          item={quickViewItem}
          open={showQuickView}
          onOpenChange={setShowQuickView}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};