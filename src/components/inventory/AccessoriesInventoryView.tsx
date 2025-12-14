import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Image as ImageIcon, Trash2, Edit, QrCode, FileSpreadsheet, CircleDot } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { CategoryImportExport } from "./CategoryImportExport";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import { EditInventoryDialog } from "./EditInventoryDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JobsPagination } from "../jobs/JobsPagination";
import { useBulkInventorySelection } from "@/hooks/useBulkInventorySelection";
import { InventoryBulkActionsBar } from "./InventoryBulkActionsBar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { InventoryQuickView } from "./InventoryQuickView";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AccessoriesInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
  selectedVendor?: string;
  selectedCollection?: string;
  selectedStorageLocation?: string;
}

const ACCESSORY_CATEGORIES = [
  { key: "all", label: "All Accessories" },
  { key: "hook", label: "Hooks" },
  { key: "ring", label: "Rings" },
  { key: "tieback", label: "Tiebacks" },
  { key: "holdback", label: "Holdbacks" },
  { key: "finial", label: "Finials" },
  { key: "weight", label: "Weights" },
  { key: "chain", label: "Chains" },
  { key: "clip", label: "Clips" },
  { key: "tape", label: "Tapes" },
  { key: "trim", label: "Trims" },
  { key: "other_accessory", label: "Other" }
];

const ITEMS_PER_PAGE = 24;

export const AccessoriesInventoryView = ({ 
  searchQuery, 
  viewMode, 
  selectedVendor, 
  selectedCollection, 
  selectedStorageLocation 
}: AccessoriesInventoryViewProps) => {
  const { data: inventory, refetch } = useEnhancedInventory();
  const { toast } = useToast();
  const { formatCurrency } = useFormattedCurrency();
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [quickViewItem, setQuickViewItem] = useState<any>(null);
  const [showQuickView, setShowQuickView] = useState(false);

  const accessoryItems = inventory?.filter(item => 
    item.category === 'accessory' || item.subcategory?.includes('hook') || 
    item.subcategory?.includes('ring') || item.subcategory?.includes('tieback') ||
    item.subcategory?.includes('finial') || item.subcategory?.includes('weight') ||
    item.subcategory?.includes('chain') || item.subcategory?.includes('clip') ||
    item.subcategory?.includes('tape') || item.subcategory?.includes('trim')
  ) || [];

  const {
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    selectionStats,
  } = useBulkInventorySelection(accessoryItems);

  const filteredItems = accessoryItems.filter(item => {
    const matchesGlobalSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || 
      item.subcategory === activeCategory;

    const matchesVendor = !selectedVendor || item.vendor_id === selectedVendor;
    const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
    const matchesLocation = !selectedStorageLocation || item.location === selectedStorageLocation;

    return matchesGlobalSearch && matchesCategory && matchesVendor && matchesCollection && matchesLocation;
  });

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
    if (!confirm('Are you sure you want to delete this accessory?')) return;

    const { error } = await supabase
      .from('enhanced_inventory_items')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete accessory", variant: "destructive" });
    } else {
      toast({ title: "Accessory deleted successfully" });
      refetch();
    }
  };

  const handleCardClick = (item: any) => {
    setQuickViewItem(item);
    setShowQuickView(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      paginatedItems.forEach(item => selectItem(item.id, true));
    } else {
      clearSelection();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header row with count and import */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {filteredItems.length} accessor{filteredItems.length !== 1 ? 'ies' : 'y'} found
          </span>
        </div>
        <Button variant="outline" size="sm" disabled>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Import/Export
        </Button>
      </div>

      {selectionStats.selected > 0 && (
        <InventoryBulkActionsBar
          selectedCount={selectionStats.selected}
          onClearSelection={clearSelection}
          onBulkDelete={async () => {
            if (!confirm(`Delete ${selectionStats.selected} selected accessories?`)) return;
            
            const { error } = await supabase
              .from('enhanced_inventory_items')
              .update({ active: false })
              .in('id', selectedItems);

            if (error) {
              toast({ title: "Error", description: "Failed to delete accessories", variant: "destructive" });
            } else {
              toast({ title: `${selectionStats.selected} accessories deleted` });
              clearSelection();
              refetch();
            }
          }}
          selectedItems={filteredItems.filter(item => selectedItems.includes(item.id))}
          onRefetch={refetch}
        />
      )}

      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="bg-background border-b border-border/50 rounded-none p-0 h-auto flex w-full justify-start gap-0 overflow-x-auto">
          {ACCESSORY_CATEGORIES.map(cat => (
            <TabsTrigger 
              key={cat.key} 
              value={cat.key} 
              className="px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold rounded-none text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ACCESSORY_CATEGORIES.map(cat => (
          <TabsContent key={cat.key} value={cat.key} className="mt-4">
            {viewMode === "grid" ? (
              <>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {paginatedItems.map((item) => (
                    <Card 
                      key={item.id} 
                      className="group hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                      onClick={() => handleCardClick(item)}
                    >
                      <div 
                        className="aspect-square relative overflow-hidden bg-muted"
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
                            <CircleDot className="h-12 w-12 text-muted-foreground" />
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
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </div>
                      </div>
                      <CardHeader className="pb-2 pt-3">
                        <CardTitle className="text-sm line-clamp-1">{item.name}</CardTitle>
                        <CardDescription className="text-xs">{item.sku || 'No SKU'}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 pb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-bold text-primary">
                            {formatCurrency(item.selling_price || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Stock:</span>
                          <Badge 
                            variant={item.quantity === 0 ? "destructive" : item.quantity <= (item.reorder_point || 10) ? "secondary" : "default"} 
                            className="text-[10px]"
                          >
                            {item.quantity ?? 0} units
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {paginatedItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CircleDot className="h-12 w-12 mb-4 opacity-50" />
                    <p>No accessories found</p>
                    <p className="text-xs">Add accessories like hooks, rings, tiebacks, and more</p>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-md border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/20 border-b">
                      <tr>
                        <th className="px-2 py-2 text-left w-10">
                          <Checkbox 
                            checked={paginatedItems.length > 0 && paginatedItems.every(item => selectedItems.includes(item.id))}
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="px-2 py-2 text-left w-12">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">SKU</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Supplier</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Price</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Stock</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground w-10">QR</th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-muted-foreground w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <CircleDot className="h-8 w-8 text-muted-foreground/50" />
                              <p>No accessories found</p>
                              <p className="text-xs">Add accessories like hooks, rings, tiebacks, and more</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedItems.map(item => (
                          <tr 
                            key={item.id} 
                            className="border-b hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => handleCardClick(item)}
                          >
                            <td className="px-2 py-2">
                              <Checkbox
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={(checked) => selectItem(item.id, checked === true)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-2 py-2">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewImage({ url: item.image_url!, title: item.name });
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                  <CircleDot className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-2">
                              <span className="text-sm font-medium">{item.name}</span>
                            </td>
                            <td className="px-2 py-2 text-xs text-muted-foreground">{item.sku || '-'}</td>
                            <td className="px-2 py-2">
                              <Badge variant="outline" className="text-[10px]">
                                {item.subcategory?.replace('_', ' ') || 'Accessory'}
                              </Badge>
                            </td>
                            <td className="px-2 py-2 text-xs text-muted-foreground">{item.supplier || '-'}</td>
                            <td className="px-2 py-2 text-sm font-medium text-primary">
                              {formatCurrency(item.selling_price || 0)}
                            </td>
                            <td className="px-2 py-2">
                              <Badge 
                                variant={item.quantity === 0 ? "destructive" : "secondary"} 
                                className="text-[10px]"
                              >
                                {item.quantity ?? 0}
                              </Badge>
                            </td>
                            <td className="px-2 py-2 text-center">
                              <Popover>
                                <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <QrCode className="h-3 w-3" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-4">
                                  <QRCodeDisplay itemId={item.id} itemName={item.name} />
                                </PopoverContent>
                              </Popover>
                            </td>
                            <td className="px-2 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <EditInventoryDialog
                                  item={item}
                                  trigger={
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  }
                                  onSuccess={refetch}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="mt-4">
                <JobsPagination
                  currentPage={currentPage}
                  totalItems={filteredItems.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {previewImage && (
        <ImagePreviewDialog
          imageUrl={previewImage.url}
          title={previewImage.title}
          open={!!previewImage}
          onOpenChange={(open) => !open && setPreviewImage(null)}
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
