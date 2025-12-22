import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallpaper, Image as ImageIcon, Trash2, Edit, QrCode, FileSpreadsheet } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JobsPagination } from "../jobs/JobsPagination";
import { useBulkInventorySelection } from "@/hooks/useBulkInventorySelection";
import { InventoryBulkActionsBar } from "./InventoryBulkActionsBar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useIsMobile } from "@/hooks/use-mobile";
import { InventoryMobileCard } from "./InventoryMobileCard";
import { matchesUnifiedSupplier } from "@/hooks/useUnifiedSuppliers";
import { useVendors } from "@/hooks/useVendors";

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
  const { data: vendors = [] } = useVendors();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

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

    const matchesVendor = matchesUnifiedSupplier(item, selectedVendor, vendors);
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

  const { units } = useMeasurementUnits();
  const currency = units.currency || 'USD';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} wallcovering{filteredItems.length !== 1 ? 's' : ''} found
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
              <DialogTitle>Import/Export Wallcoverings</DialogTitle>
            </DialogHeader>
            <CategoryImportExport category="wallpaper" onImportComplete={refetch} />
          </DialogContent>
        </Dialog>
      </div>

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
                    <div 
                      className="aspect-[16/5] relative overflow-hidden bg-muted cursor-pointer"
                      onClick={() => item.image_url && setPreviewImage({ url: item.image_url, title: item.name })}
                    >
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          crossOrigin="anonymous"
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
            ) : isMobile ? (
              // Mobile: Show cards for list view too
              <>
                <div className="space-y-3">
                  {paginatedItems.map((item) => {
                    const soldBy = (item as any).wallpaper_sold_by;
                    const stockUnit = soldBy === 'per_roll' ? 'rolls' : soldBy === 'per_sqm' ? 'm²' : 'units';
                    return (
                      <InventoryMobileCard
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.includes(item.id)}
                        onSelect={(checked) => selectItem(item.id, checked)}
                        onClick={() => {}}
                        onEdit={() => {}}
                        onDelete={() => handleDelete(item.id)}
                        formatPrice={formatPrice}
                        stockUnit={stockUnit}
                      />
                    );
                  })}
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
              // Desktop: Show table
              <>
                <div className="rounded-md border bg-card overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20">
                        <TableHead className="w-8">
                          <Checkbox
                            checked={selectionStats.allSelected}
                            onCheckedChange={(checked) => selectAll(!!checked)}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead className="text-xs">Image</TableHead>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs hidden lg:table-cell">SKU</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">Supplier</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">Sold By</TableHead>
                        <TableHead className="text-xs hidden lg:table-cell">Roll Size</TableHead>
                        <TableHead className="text-xs hidden xl:table-cell">Pattern Repeat</TableHead>
                        <TableHead className="text-xs">Price</TableHead>
                        <TableHead className="text-xs">Stock</TableHead>
                        <TableHead className="text-xs hidden lg:table-cell">QR</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.map((item) => {
                        const isSelected = selectedItems.includes(item.id);
                        return (
                          <TableRow key={item.id} className="hover:bg-accent/50 transition-colors">
                            <TableCell className="px-2 py-1">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => selectItem(item.id, !!checked)}
                                aria-label={`Select ${item.name}`}
                              />
                            </TableCell>
                            <TableCell className="px-2 py-1">
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
                            </TableCell>
                            <TableCell className="px-2 py-1 text-xs font-medium">{item.name}</TableCell>
                            <TableCell className="px-2 py-1 text-xs text-muted-foreground hidden lg:table-cell">{item.sku || '-'}</TableCell>
                            <TableCell className="px-2 py-1 text-xs hidden md:table-cell">{item.supplier || '-'}</TableCell>
                            <TableCell className="px-2 py-1 hidden md:table-cell">
                              {(item as any).wallpaper_sold_by ? (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs py-0 h-5">
                                  {(item as any).wallpaper_sold_by === 'per_roll' ? 'Per Roll' : 
                                   (item as any).wallpaper_sold_by === 'per_unit' ? 'Per Meter' : 
                                   (item as any).wallpaper_sold_by === 'per_sqm' ? 'Per m²' : 'Per Unit'}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell className="px-2 py-1 text-xs hidden lg:table-cell">
                              {(item as any).wallpaper_roll_width && (item as any).wallpaper_roll_length ? (
                                <span>{(item as any).wallpaper_roll_width}cm × {(item as any).wallpaper_roll_length}m</span>
                              ) : (
                                <Badge variant="secondary" className="text-xs py-0 h-5">Not specified</Badge>
                              )}
                            </TableCell>
                            <TableCell className="px-2 py-1 text-xs hidden xl:table-cell">
                              {item.pattern_repeat_vertical ? `${item.pattern_repeat_vertical}cm` : '-'}
                            </TableCell>
                            <TableCell className="px-2 py-1 text-xs font-medium">
                              <div className="flex flex-col">
                                <span>{formatPrice(item.price_per_meter || item.selling_price || 0)}</span>
                                {(item as any).wallpaper_sold_by && (
                                  <span className="text-[10px] text-muted-foreground">
                                    per {(item as any).wallpaper_sold_by === 'per_roll' ? 'roll' : 
                                         (item as any).wallpaper_sold_by === 'per_unit' ? 'meter' : 
                                         (item as any).wallpaper_sold_by === 'per_sqm' ? 'm²' : 'unit'}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-1">
                              {item.quantity > 0 || (item as any).stock_quantity > 0 ? (
                                <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs py-0 h-5">
                                  {(item as any).stock_quantity || item.quantity || 0} {(item as any).wallpaper_sold_by === 'per_roll' ? 'rolls' : 'units'}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs py-0 h-5">
                                  Not tracked
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="px-2 py-1 hidden lg:table-cell">
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
                            </TableCell>
                            <TableCell className="px-2 py-1">
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
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
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

      {previewImage && (
        <ImagePreviewDialog
          open={!!previewImage}
          onOpenChange={(open) => !open && setPreviewImage(null)}
          imageUrl={previewImage.url}
          title={previewImage.title}
        />
      )}
    </div>
  );
};
