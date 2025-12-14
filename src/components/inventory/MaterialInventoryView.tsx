import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, Trash2, Edit, QrCode, FileSpreadsheet, Filter } from "lucide-react";
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
import { ColorSlatPreview, getColorHex } from "./ColorSlatPreview";
import { COLOR_PALETTE } from "@/constants/inventoryCategories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MaterialInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
  selectedVendor?: string;
  selectedCollection?: string;
  selectedStorageLocation?: string;
}

const MATERIAL_CATEGORIES = [
  { key: "all", label: "All Materials" },
  { key: "roller_fabric", label: "Roller Blinds" },
  { key: "venetian_slats", label: "Venetian Blinds" },
  { key: "vertical_slats", label: "Vertical Blinds" },
  { key: "vertical_fabric", label: "Vertical Fabrics" },
  { key: "shutter_material", label: "Plantation Shutters" },
  { key: "cellular", label: "Cellular/Honeycomb" },
  { key: "panel_glide_fabric", label: "Panel Track/Glide" },
  { key: "blind_material", label: "Other Materials" }
];

const ITEMS_PER_PAGE = 24;

export const MaterialInventoryView = ({ searchQuery, viewMode, selectedVendor, selectedCollection, selectedStorageLocation }: MaterialInventoryViewProps) => {
  const { data: inventory, refetch } = useEnhancedInventory();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [quickViewItem, setQuickViewItem] = useState<any>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedPriceGroup, setSelectedPriceGroup] = useState<string>("all");

  const materialItems = inventory?.filter(item => 
    item.category === 'material' || item.category === 'blind_fabric'
  ) || [];

  const priceGroups = [...new Set(materialItems.map(i => i.price_group).filter(Boolean))] as string[];
  priceGroups.sort((a, b) => {
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return a.localeCompare(b);
  });

  const {
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    selectionStats,
  } = useBulkInventorySelection(materialItems);

  const filteredItems = materialItems.filter(item => {
    const matchesGlobalSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || 
      item.subcategory === activeCategory;

    const matchesVendor = !selectedVendor || item.vendor_id === selectedVendor;
    const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
    const matchesLocation = !selectedStorageLocation || item.location === selectedStorageLocation;
    
    const matchesPriceGroup = selectedPriceGroup === "all" || 
      (selectedPriceGroup === "none" ? !item.price_group : item.price_group === selectedPriceGroup);

    return matchesGlobalSearch && matchesCategory && matchesVendor && matchesCollection && matchesLocation && matchesPriceGroup;
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
    if (!confirm('Are you sure you want to delete this material?')) return;

    const { error } = await supabase
      .from('enhanced_inventory_items')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete material", variant: "destructive" });
    } else {
      toast({ title: "Material deleted successfully" });
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
      {/* Header row with count, filter, and import */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {filteredItems.length} materials found
          </span>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedPriceGroup} onValueChange={setSelectedPriceGroup}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups ({materialItems.length})</SelectItem>
                <SelectItem value="none">No Price Group ({materialItems.filter(i => !i.price_group).length})</SelectItem>
                {priceGroups.map(group => (
                  <SelectItem key={group} value={group}>
                    Group {group} ({materialItems.filter(i => i.price_group === group).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPriceGroup !== "all" && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedPriceGroup("all")}>
                Clear
              </Button>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Import/Export Blind Materials</DialogTitle>
            </DialogHeader>
            <CategoryImportExport category="hardware" onImportComplete={refetch} />
          </DialogContent>
        </Dialog>
      </div>

      {selectionStats.selected > 0 && (
        <InventoryBulkActionsBar
          selectedCount={selectionStats.selected}
          onClearSelection={clearSelection}
          onBulkDelete={async () => {
            if (!confirm(`Delete ${selectionStats.selected} selected materials?`)) return;
            
            const { error } = await supabase
              .from('enhanced_inventory_items')
              .update({ active: false })
              .in('id', selectedItems);

            if (error) {
              toast({ title: "Error", description: "Failed to delete materials", variant: "destructive" });
            } else {
              toast({ title: `${selectionStats.selected} materials deleted` });
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
          {MATERIAL_CATEGORIES.map(cat => (
            <TabsTrigger 
              key={cat.key} 
              value={cat.key} 
              className="px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold rounded-none text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {MATERIAL_CATEGORIES.map(cat => (
          <TabsContent key={cat.key} value={cat.key} className="mt-4">
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
                      <th className="px-2 py-2 text-left w-16">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">SKU</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Supplier</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Price Group</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Stock</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Tags</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground w-10">QR</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-muted-foreground w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                          No materials found
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map(item => (
                        <tr 
                          key={item.id} 
                          className="border-b hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => handleCardClick(item)}
                        >
                          <td className="px-2 py-1">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => selectItem(item.id, checked === true)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-2 py-1">
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
                            ) : item.category === 'material' && item.tags?.some((tag: string) => 
                              COLOR_PALETTE.some(c => c.value === tag)
                            ) ? (
                              <ColorSlatPreview 
                                hexColor={getColorHex(
                                  item.tags.find((tag: string) => COLOR_PALETTE.some(c => c.value === tag)) || '',
                                  [...COLOR_PALETTE],
                                  []
                                )}
                                slatWidth={(item.specifications as Record<string, any>)?.slat_width}
                                materialType={(item.specifications as Record<string, any>)?.material_type}
                                orientation={item.subcategory === 'vertical' ? 'vertical' : 'horizontal'}
                                size="sm"
                                className="w-10 h-10"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.name}</span>
                              {item.supplier?.toUpperCase() === 'TWC' && (
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] px-1 py-0">
                                  TWC
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-1 text-xs text-muted-foreground">{item.sku || '-'}</td>
                          <td className="px-2 py-1 text-xs text-muted-foreground">{item.supplier || '-'}</td>
                          <td className="px-2 py-1">
                            {item.price_group ? (
                              <Badge variant="outline" className="text-[10px]">
                                Group {item.price_group}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-2 py-1">
                            <Badge 
                              variant={item.quantity === 0 ? "destructive" : "secondary"} 
                              className="text-[10px]"
                            >
                              {item.quantity ?? 0}
                            </Badge>
                          </td>
                          <td className="px-2 py-1">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {item.tags?.slice(0, 2).map((tag: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0">
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags?.length > 2 && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">
                                  +{item.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-1 text-center">
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
                          <td className="px-2 py-1 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <EditInventoryDialog
                                item={item}
                                trigger={
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                }
                                onSuccess={refetch}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
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

            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <JobsPagination
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  totalItems={filteredItems.length}
                  itemsPerPage={ITEMS_PER_PAGE}
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

      {showQuickView && quickViewItem && (
        <InventoryQuickView
          item={quickViewItem}
          open={showQuickView}
          onOpenChange={(openState) => {
            setShowQuickView(openState);
            if (!openState) setQuickViewItem(null);
          }}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};
