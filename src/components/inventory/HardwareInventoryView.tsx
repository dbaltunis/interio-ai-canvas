import { useState } from "react";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PricingCell } from "./PricingCell";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Minus, Image as ImageIcon, Trash2, Edit, QrCode, FileSpreadsheet } from "lucide-react";
import { PixelHardwareIcon } from "@/components/icons/PixelArtIcons";
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
import { InventoryQuickView } from "./InventoryQuickView";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { InventorySupplierFilter } from "./InventorySupplierFilter";
import { matchesUnifiedSupplier } from "@/hooks/useUnifiedSuppliers";
import { useVendors } from "@/hooks/useVendors";
import { useIsMobile } from "@/hooks/use-mobile";
import { InventoryMobileCard } from "./InventoryMobileCard";
import { useIsDealer } from "@/hooks/useIsDealer";

interface HardwareInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
  selectedVendor?: string;
  selectedCollection?: string;
  selectedStorageLocation?: string;
  canManageInventory?: boolean;
}

const HARDWARE_CATEGORIES = [
  { key: "all", label: "All Hardware" },
  { key: "rod", label: "Rods/Poles" },
  { key: "track", label: "Tracks" },
  { key: "motor", label: "Motors" },
  { key: "bracket", label: "Brackets" },
  { key: "accessory", label: "Accessories" }
];

const ITEMS_PER_PAGE = 24;

export const HardwareInventoryView = ({ searchQuery, viewMode, selectedVendor: externalVendor, selectedCollection, selectedStorageLocation, canManageInventory = false }: HardwareInventoryViewProps) => {
  const { data: inventory, refetch } = useEnhancedInventory();
  const { data: vendors = [] } = useVendors();
  const { data: isDealer } = useIsDealer();
  const { toast } = useToast();
  const confirm = useConfirmDialog();
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [quickViewItem, setQuickViewItem] = useState<any>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [localSelectedVendor, setLocalSelectedVendor] = useState<string | undefined>(externalVendor);

  // Use local vendor state, sync with external if provided
  const selectedVendor = externalVendor ?? localSelectedVendor;

  const hardwareItems = inventory?.filter(item => 
    item.category === 'hardware'
  ) || [];

  // Bulk selection
  const {
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    selectionStats,
  } = useBulkInventorySelection(hardwareItems);

  const filteredItems = hardwareItems.filter(item => {
    const matchesGlobalSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || 
      item.subcategory === activeCategory;

    // CRITICAL FIX: Use hybrid vendor/supplier matching for TWC items
    const matchesVendor = matchesUnifiedSupplier(item, selectedVendor, vendors);
    const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
    const matchesLocation = !selectedStorageLocation || item.location === selectedStorageLocation;

    return matchesGlobalSearch && matchesCategory && matchesVendor && matchesCollection && matchesLocation;
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
    const confirmed = await confirm({
      title: "Delete Hardware Item",
      description: "Are you sure you want to delete this hardware item?",
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    const { error } = await supabase
      .from('enhanced_inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete hardware",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Hardware deleted successfully",
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
      {/* Action Bar with Supplier Filter */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} hardware item{filteredItems.length !== 1 ? 's' : ''} found
          </p>
          <InventorySupplierFilter
            value={selectedVendor}
            onChange={setLocalSelectedVendor}
            showCounts={true}
            category="hardware"
          />
        </div>
        {canManageInventory && !isDealer && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Import/Export
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import/Export Hardware</DialogTitle>
              </DialogHeader>
              <CategoryImportExport category="hardware" onImportComplete={refetch} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="bg-background border-b border-border/50 rounded-none p-0 h-auto flex w-full justify-start gap-0">
          {HARDWARE_CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.key}
              value={cat.key}
              className="px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold rounded-none text-muted-foreground hover:text-foreground"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {HARDWARE_CATEGORIES.map((cat) => (
          <TabsContent key={cat.key} value={cat.key} className="mt-6 space-y-4">
            {selectedItems.length > 0 && canManageInventory && (
        <InventoryBulkActionsBar
          selectedCount={selectedItems.length}
          onClearSelection={clearSelection}
          onBulkDelete={handleBulkDelete}
          selectedItems={hardwareItems.filter(item => selectedItems.includes(item.id))}
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
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          crossOrigin="anonymous"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Minus className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {canManageInventory && (
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
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
                      <CardDescription className="text-xs">{item.sku || 'No SKU'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        {!isDealer && item.supplier && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Supplier:</span>
                            <span className="font-medium">{item.supplier}</span>
                          </div>
                        )}
                        {(item as any).material && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Material:</span>
                            <span className="font-medium">{(item as any).material}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price:</span>
                          <PricingCell item={item} className="font-bold text-primary" />
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
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Stock:</span>
                          <Badge variant={item.quantity && item.quantity > 0 ? "default" : "secondary"}>
                            {item.quantity || 0} units
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
            ) : isMobile ? (
              // Mobile: Show cards for list view too
              <>
                <div className="space-y-3">
                  {paginatedItems.map((item) => (
                    <InventoryMobileCard
                      key={item.id}
                      item={item}
                      isSelected={selectedItems.includes(item.id)}
                      onSelect={(checked) => selectItem(item.id, checked)}
                      onClick={() => {
                        setQuickViewItem(item);
                        setShowQuickView(true);
                      }}
                      onEdit={canManageInventory ? () => {} : undefined}
                      onDelete={canManageInventory ? () => handleDelete(item.id) : undefined}
                      formatPrice={formatPrice}
                      stockUnit="units"
                    />
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
                        {!isDealer && <TableHead className="text-xs hidden md:table-cell">Supplier</TableHead>}
                        <TableHead className="text-xs hidden lg:table-cell">Material</TableHead>
                        <TableHead className="text-xs">Price</TableHead>
                        <TableHead className="text-xs">Stock</TableHead>
                        <TableHead className="text-xs hidden lg:table-cell">QR</TableHead>
                        {canManageInventory && <TableHead className="text-xs">Actions</TableHead>}
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
                            {!isDealer && <TableCell className="px-2 py-1 text-xs hidden md:table-cell">{item.supplier || '-'}</TableCell>}
                            <TableCell className="px-2 py-1 text-xs hidden lg:table-cell">{(item as any).material || '-'}</TableCell>
                            <TableCell className="px-2 py-1 text-xs font-medium">
                              <PricingCell item={item} />
                            </TableCell>
                            <TableCell className="px-2 py-1">
                              <Badge variant={item.quantity && item.quantity > 0 ? "default" : "secondary"} className="text-xs py-0 h-5">
                                {item.quantity || 0} units
                              </Badge>
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
                            {canManageInventory && (
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
                            )}
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
                  <div className="flex justify-center">
                    <PixelHardwareIcon size={64} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Add your first track or rod</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      {searchQuery ? 'Try adjusting your search' : 'The foundation of every installation. Build your hardware library.'}
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