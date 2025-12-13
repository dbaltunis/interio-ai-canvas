import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Image as ImageIcon, Trash2, Edit, QrCode, FileSpreadsheet, Filter } from "lucide-react";
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

// All blind materials: fabrics for blinds + slats/vanes for venetian/vertical
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

  // Get unique price groups for filter
  const priceGroups = [...new Set(materialItems.map(i => i.price_group).filter(Boolean))] as string[];
  priceGroups.sort((a, b) => {
    // Sort numerically if both are numbers, else alphabetically
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Blind Materials</h2>
          <p className="text-sm text-muted-foreground">
            Slats, vanes, and cellular fabrics for window blinds
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import CSV for Blind Materials
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

      {/* Price Group Filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Price Group:</span>
          <Select value={selectedPriceGroup} onValueChange={setSelectedPriceGroup}>
            <SelectTrigger className="w-[180px]">
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
        </div>
        {selectedPriceGroup !== "all" && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedPriceGroup("all")}>
            Clear Filter
          </Button>
        )}
      </div>

      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="w-full justify-start">
          {MATERIAL_CATEGORIES.map(cat => (
            <TabsTrigger key={cat.key} value={cat.key} className="flex items-center gap-2">
              {cat.label}
              <Badge variant="secondary" className="ml-2">
                {cat.key === 'all' 
                  ? materialItems.length 
                  : materialItems.filter(i => i.subcategory === cat.key).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {MATERIAL_CATEGORIES.map(cat => (
          <TabsContent key={cat.key} value={cat.key} className="space-y-4">
            {viewMode === "list" && (
              <div className="space-y-2">
                {paginatedItems.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No materials found</p>
                    </CardContent>
                  </Card>
                ) : (
                  paginatedItems.map(item => (
                    <Card 
                      key={item.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleCardClick(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => selectItem(item.id, checked === true)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
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
                              className="w-16 h-16"
                            />
                          ) : null}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{item.name}</h3>
                              {item.supplier?.toUpperCase() === 'TWC' && (
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px]">
                                  TWC
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.sku}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm">
                                  <QrCode className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-4">
                                <QRCodeDisplay itemId={item.id} itemName={item.name} />
                              </PopoverContent>
                            </Popover>
                            <EditInventoryDialog
                              item={item}
                              trigger={
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                              onSuccess={refetch}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

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
          onOpenChange={(open) => {
            setShowQuickView(open);
            if (!open) setQuickViewItem(null);
          }}
        />
      )}
    </div>
  );
};
