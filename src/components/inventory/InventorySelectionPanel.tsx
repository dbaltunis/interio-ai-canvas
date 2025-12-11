import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, Palette, Wrench, Check, X, Plus, Edit3, ScanLine } from "lucide-react";
import { FilterButton } from "@/components/library/FilterButton";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { VirtualizedInventoryGrid } from "@/components/inventory/VirtualizedInventoryGrid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEnhancedInventory, useCreateEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { usePaginatedInventory, flattenPaginatedResults } from "@/hooks/usePaginatedInventory";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { formatFromCM, getUnitLabel } from "@/utils/measurementFormatters";
import { supabase } from "@/integrations/supabase/client";
import { TreatmentCategory, getTreatmentConfig } from "@/utils/treatmentTypeDetection";
import { useTreatmentSpecificFabrics } from "@/hooks/useTreatmentSpecificFabrics";
import { getAcceptedSubcategories, getTreatmentPrimaryCategory } from "@/constants/inventorySubcategories";
import { toast } from "sonner";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";
interface InventorySelectionPanelProps {
  treatmentType: string;
  selectedItems: {
    fabric?: any;
    hardware?: any;
    material?: any;
  };
  onItemSelect: (category: string, item: any) => void;
  onItemDeselect: (category: string) => void;
  measurements?: Record<string, any>;
  className?: string;
  treatmentCategory?: TreatmentCategory;
}
export const InventorySelectionPanel = ({
  treatmentType,
  selectedItems,
  onItemSelect,
  onItemDeselect,
  measurements = {},
  className = "",
  treatmentCategory = 'curtains'
}: InventorySelectionPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300); // Debounce search for performance
  const [activeCategory, setActiveCategory] = useState("fabric");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | undefined>();
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [manualEntry, setManualEntry] = useState({
    name: "",
    price: "",
    unit: "m",
    fabric_width: "",
    pattern_repeat_horizontal: "",
    pattern_repeat_vertical: ""
  });
  const selectedCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const {
    data: inventory = []
  } = useEnhancedInventory();
  const {
    units,
    formatLength
  } = useMeasurementUnits();
  const treatmentConfig = getTreatmentConfig(treatmentCategory);

  const createInventoryItem = useCreateEnhancedInventoryItem();

  // Use treatment-specific fabrics
  const {
    data: treatmentFabrics = []
  } = useTreatmentSpecificFabrics(treatmentCategory);

  // Auto-scroll to selected item when category changes or selection changes
  useEffect(() => {
    const selectedId = selectedItems[activeCategory as keyof typeof selectedItems]?.id;
    if (selectedId) {
      // Use a small delay to ensure DOM has rendered the items
      const scrollTimeout = setTimeout(() => {
        const selectedCard = selectedCardRefs.current.get(selectedId);
        if (selectedCard) {
          selectedCard.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100);
      return () => clearTimeout(scrollTimeout);
    }
  }, [activeCategory, selectedItems, treatmentFabrics, inventory]);

  // Handle manual entry submission
  const handleManualEntrySubmit = async () => {
    if (!manualEntry.name || !manualEntry.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Determine the correct category and subcategory
      let mainCategory = activeCategory;
      let subCategory = activeCategory;
      
      // Map fabric category to proper category/subcategory structure
      if (activeCategory === "fabric") {
        mainCategory = "fabric";
        if (treatmentCategory === 'curtains' || treatmentCategory === 'roman_blinds') {
          subCategory = 'curtain_fabric';
        } else if (treatmentCategory === 'roller_blinds') {
          subCategory = 'roller_fabric';
        } else if (treatmentCategory === 'panel_glide') {
          subCategory = 'panel_glide_fabric';
        } else if (treatmentCategory === 'wallpaper') {
          subCategory = 'wallcovering';
        } else {
          subCategory = 'curtain_fabric'; // Default to curtain fabric
        }
      }

      // Prepare the item data for database insertion
      const itemData: any = {
        name: manualEntry.name,
        selling_price: parseFloat(manualEntry.price),
        unit: manualEntry.unit,
        quantity: 0,
        category: mainCategory,
        subcategory: subCategory,
      };

      // Add fabric-specific fields if category is fabric
      if (activeCategory === "fabric") {
        itemData.fabric_width = parseFloat(manualEntry.fabric_width) || 0;
        itemData.pattern_repeat_horizontal = parseFloat(manualEntry.pattern_repeat_horizontal) || 0;
        itemData.pattern_repeat_vertical = parseFloat(manualEntry.pattern_repeat_vertical) || 0;
      }

      console.log('💾 Saving inventory item:', itemData);

      // Save to database
      const newItem = await createInventoryItem.mutateAsync(itemData);
      
      console.log('✅ Item created:', newItem);
      
      // Select the newly created item
      if (newItem) {
        onItemSelect(activeCategory, newItem);
      }

      // Reset form and close dialog
      setManualEntry({ 
        name: "", 
        price: "", 
        unit: "m",
        fabric_width: "",
        pattern_repeat_horizontal: "",
        pattern_repeat_vertical: ""
      });
      setShowManualEntry(false);
    } catch (error) {
      console.error("❌ Error creating inventory item:", error);
      // Error toast is already handled by the mutation
    }
  };

  // Handle QR code scan
  const handleQRScan = async (itemId: string) => {
    try {
      // Look up the item in inventory
      const allItems = [...inventory, ...treatmentFabrics];
      const scannedItem = allItems.find(item => item.id === itemId);
      
      if (scannedItem) {
        // Determine which category this item belongs to
        let targetCategory = activeCategory;
        
        if (scannedItem.category === 'fabric' || scannedItem.category?.toLowerCase().includes('fabric')) {
          targetCategory = 'fabric';
        } else if (scannedItem.category?.toLowerCase().includes('hardware') || 
                   scannedItem.category?.toLowerCase().includes('track') ||
                   scannedItem.category?.toLowerCase().includes('pole')) {
          targetCategory = 'hardware';
        } else {
          targetCategory = 'material';
        }
        
        // Switch to the correct tab if needed
        if (targetCategory !== activeCategory) {
          setActiveCategory(targetCategory);
        }
        
        // Select the item
        onItemSelect(targetCategory, scannedItem);
        
        toast.success(`${scannedItem.name} selected`);
      } else {
        toast.error("Item not found in inventory");
      }
    } catch (error) {
      console.error('Error handling QR scan:', error);
      toast.error("Failed to process scanned item");
    }
  };

  // Map treatment types to their required material subcategories using centralized config
  const getTreatmentMaterialSubcategories = (): string[] => {
    console.log('🎯 Getting material subcategories for treatment:', treatmentCategory);
    
    // Use centralized config instead of hardcoded switch
    const primaryCategory = getTreatmentPrimaryCategory(treatmentCategory);
    if (primaryCategory === 'material') {
      const subcategories = getAcceptedSubcategories(treatmentCategory);
      console.log('✅ Found material subcategories:', subcategories);
      return subcategories;
    }
    
    console.log('⚠️ Treatment uses fabric, not material');
    return [];
  };

  // Filter inventory by treatment type and category
  const getInventoryByCategory = (category: string) => {
    console.log('🔍 getInventoryByCategory called:', { category, treatmentCategory, inventoryCount: inventory.length });
    
    // For fabric category, ALWAYS use treatment-specific fabrics
    if (category === "fabric") {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const filtered = treatmentFabrics.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchLower) || 
                             item.description?.toLowerCase().includes(searchLower) ||
                             item.sku?.toLowerCase().includes(searchLower) ||
                             item.supplier?.toLowerCase().includes(searchLower) ||
                             item.vendor?.name?.toLowerCase().includes(searchLower);
        const matchesVendor = !selectedVendor || item.vendor_id === selectedVendor;
        const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
        const matchesTags = selectedTags.length === 0 || (item.tags && selectedTags.some(tag => item.tags.includes(tag)));
        return matchesSearch && matchesVendor && matchesCollection && matchesTags;
      });
      // Sort results: items starting with search term first, then alphabetically
      const sorted = debouncedSearchTerm ? filtered.sort((a, b) => {
        const aName = a.name?.toLowerCase() || '';
        const bName = b.name?.toLowerCase() || '';
        const aStartsWith = aName.startsWith(searchLower) ? 0 : 1;
        const bStartsWith = bName.startsWith(searchLower) ? 0 : 1;
        if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith;
        return aName.localeCompare(bName);
      }) : filtered;
      console.log('📦 Fabric tab filtered:', sorted.length, 'items');
      return sorted;
    }

    // For "both" category (vertical blinds with fabric AND material vanes)
    if (category === "both") {
      const searchLower = debouncedSearchTerm.toLowerCase();
      // Get both fabric items from treatment-specific fabrics
      const fabricItems = treatmentFabrics.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchLower) || 
                             item.description?.toLowerCase().includes(searchLower) ||
                             item.sku?.toLowerCase().includes(searchLower) ||
                             item.supplier?.toLowerCase().includes(searchLower) ||
                             item.vendor?.name?.toLowerCase().includes(searchLower);
        const matchesVendor = !selectedVendor || item.vendor_id === selectedVendor;
        const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
        const matchesTags = selectedTags.length === 0 || (item.tags && selectedTags.some(tag => item.tags.includes(tag)));
        return matchesSearch && matchesVendor && matchesCollection && matchesTags;
      });

      // Get material items from inventory
      const requiredSubcategories = getTreatmentMaterialSubcategories();
      const materialItems = inventory.filter(item => {
        const matchesCategory = item.category?.toLowerCase() === 'material' || 
                               item.category?.toLowerCase() === 'hard_coverings';
        const matchesSubcategory = requiredSubcategories.length === 0 || 
                                   requiredSubcategories.some(subcat => 
                                     item.subcategory?.toLowerCase() === subcat.toLowerCase()
                                   );
        const matchesSearch = item.name?.toLowerCase().includes(searchLower) || 
                             item.description?.toLowerCase().includes(searchLower) ||
                             item.sku?.toLowerCase().includes(searchLower) ||
                             item.supplier?.toLowerCase().includes(searchLower) ||
                             item.vendor?.name?.toLowerCase().includes(searchLower);
        const matchesVendor = !selectedVendor || item.vendor_id === selectedVendor;
        const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
        const matchesTags = selectedTags.length === 0 || (item.tags && selectedTags.some(tag => item.tags.includes(tag)));
        
        return matchesCategory && matchesSubcategory && matchesSearch && matchesVendor && matchesCollection && matchesTags;
      });

      console.log('📦 Both tab filtered:', fabricItems.length, 'fabric items +', materialItems.length, 'material items');
      return [...fabricItems, ...materialItems];
    }

    // For material category, filter by treatment-specific material subcategories
    // CRITICAL FIX: Use enriched materials from treatmentFabrics (which now includes materials with pricing grids)
    if (category === "material") {
      const requiredSubcategories = getTreatmentMaterialSubcategories();
      
      console.log('🔍 Filtering materials - Required subcategories:', requiredSubcategories);
      console.log('📊 treatmentFabrics count:', treatmentFabrics.length, '| Raw inventory count:', inventory.length);
      
      // CRITICAL: Use treatmentFabrics if available (already enriched with pricing grids)
      // treatmentFabrics now includes materials for material-based treatments
      const sourceData = treatmentFabrics.length > 0 ? treatmentFabrics : inventory;
      const dataSource = treatmentFabrics.length > 0 ? 'treatmentFabrics (enriched)' : 'raw inventory';
      
      console.log('📦 Using data source:', dataSource);
      
      const filtered = sourceData.filter(item => {
        // Must be in material or hard_coverings category
        const matchesCategory = item.category?.toLowerCase() === 'material' || 
                               item.category?.toLowerCase() === 'hard_coverings';
        
        // Must match one of the required subcategories for this treatment
        const matchesSubcategory = requiredSubcategories.length === 0 || 
                                   requiredSubcategories.some(subcat => 
                                     item.subcategory?.toLowerCase() === subcat.toLowerCase()
                                   );
        
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch = item.name?.toLowerCase().includes(searchLower) || 
                             item.description?.toLowerCase().includes(searchLower) ||
                             item.sku?.toLowerCase().includes(searchLower) ||
                             item.supplier?.toLowerCase().includes(searchLower) ||
                             item.vendor?.name?.toLowerCase().includes(searchLower);
        const matchesVendor = !selectedVendor || item.vendor_id === selectedVendor;
        const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
        const matchesTags = selectedTags.length === 0 || (item.tags && selectedTags.some(tag => item.tags.includes(tag)));
        
        return matchesCategory && matchesSubcategory && matchesSearch && matchesVendor && matchesCollection && matchesTags;
      });
      
      // Log enrichment status
      const enrichedCount = filtered.filter(i => i.pricing_grid_data || i.resolved_grid_id).length;
      console.log(`📦 Found ${filtered.length} material items (${enrichedCount} with pricing grids). Subcategories:`, 
        [...new Set(filtered.map(i => i.subcategory || 'none'))]);
      
      return filtered;
    }

    // For hardware category, show all hardware items (not treatment-specific)
    if (category === "hardware") {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const filtered = inventory.filter(item => {
        const matchesCategory = item.category?.toLowerCase() === 'hardware';
        const matchesSearch = item.name?.toLowerCase().includes(searchLower) || 
                             item.description?.toLowerCase().includes(searchLower) ||
                             item.sku?.toLowerCase().includes(searchLower) ||
                             item.supplier?.toLowerCase().includes(searchLower) ||
                             item.vendor?.name?.toLowerCase().includes(searchLower);
        const matchesVendor = !selectedVendor || item.vendor_id === selectedVendor;
        const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
        const matchesTags = selectedTags.length === 0 || (item.tags && selectedTags.some(tag => item.tags.includes(tag)));
        
        return matchesCategory && matchesSearch && matchesVendor && matchesCollection && matchesTags;
      });
      
      console.log(`📦 Found ${filtered.length} hardware items`);
      return filtered;
    }
    
    console.log('⚠️ Unknown category:', category);
    return [];
  };

  // Calculate estimated cost for an item
  // NOTE: This is for preview only - actual calculation uses template fullness
  const calculateEstimatedCost = (item: any, category: string) => {
    if (!measurements.rail_width || !measurements.drop) return 0;
    const width = parseFloat(measurements.rail_width) / 1000; // Convert mm to meters
    const height = parseFloat(measurements.drop) / 1000; // Convert mm to meters
    const area = width * height;
    const price = item.selling_price || item.unit_price || item.price_per_meter || 0;
    switch (category) {
      case "fabric":
        // For fabric preview, use height only (no fullness guess - that comes from heading selection)
        // This is just a rough estimate for browsing, actual calc uses selected heading fullness
        return height * price;
      case "hardware":
        // For hardware, typically per linear meter of width
        return width * price;
      case "material":
        // For blind materials, calculate based on area
        return area * price;
      default:
        return price;
    }
  };
  const renderInventoryItem = (item: any, category: string) => {
    const estimatedCost = calculateEstimatedCost(item, category);
    
    // Check selection - ONLY if both IDs exist and match
    const selectedItem = selectedItems[category as keyof typeof selectedItems];
    const isSelected = Boolean(
      selectedItem && item.id && (
        selectedItem.id === item.id || 
        (selectedItem.fabric_id && item.fabric_id && selectedItem.fabric_id === item.fabric_id)
      )
    );
    
    const price = item.selling_price || item.unit_price || item.price_per_meter || 0;

    // Get the image URL - simplified, only uses image_url field
    const getImageUrl = () => {
      if (!item.image_url) return null;
      // Direct URL
      if (item.image_url.startsWith('http')) return item.image_url;
      // Storage path - try to get public URL
      try {
        const { data } = supabase.storage.from('business-assets').getPublicUrl(item.image_url);
        if (data?.publicUrl) return data.publicUrl;
      } catch (e) {
        return null;
      }
      return null;
    };
    const imageUrl = getImageUrl();
    return <Card 
      key={item.id} 
      ref={(el) => {
        if (el) {
          selectedCardRefs.current.set(item.id, el);
        }
      }}
      className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}`} 
      onClick={() => isSelected ? onItemDeselect(category) : onItemSelect(category, item)}
    >
        <CardContent className="p-2">
          <div className="flex flex-col space-y-2">
            {/* Image or Color Swatch - Using universal component */}
            <div className="aspect-square w-full relative">
              <ProductImageWithColorFallback
                imageUrl={imageUrl}
                color={item.color}
                productName={item.name}
                category={category}
                className="w-full h-full"
                size={200}
                showColorName={true}
              />
              {isSelected && <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full z-10" />}
              
              {/* Pricing Grid Badge Overlay - Check price_group, pricing_grid_id, OR metadata.pricing_grid_data for TWC */}
              {(category === 'fabric' || category === 'material') && (item.price_group || item.pricing_grid_id || item.metadata?.pricing_grid_data) && (
                <div className="absolute bottom-1 left-1 right-1 z-10">
                  <Badge variant="default" className="text-[9px] px-1.5 py-0.5 h-5 bg-green-600 hover:bg-green-700 text-white w-full justify-center">
                    ✓ Grid: {item.price_group || item.resolved_grid_name || 'Assigned'}
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Item details */}
            <div className="space-y-1">
              <h4 className="font-semibold text-xs line-clamp-1">{item.name}</h4>
              
              {/* Fabric-specific info */}
              {category === "fabric" && <div className="space-y-0.5 text-[10px] text-muted-foreground">
                  {item.fabric_width > 0 && <div className="flex items-center gap-1">
                      <span>📏 {formatFromCM(item.fabric_width, units.length)} wide</span>
                    </div>}
                  {item.product_category && <div className="text-[9px]">
                      For: {item.product_category.replace(/_/g, ' ')}
                    </div>}
                  {item.composition && <div className="truncate">Comp: {item.composition}</div>}
                  {(item.pattern_repeat_vertical > 0 || item.pattern_repeat_horizontal > 0) && <div>
                      Repeat: {formatFromCM(item.pattern_repeat_vertical || 0, units.length, 0)}×{formatFromCM(item.pattern_repeat_horizontal || 0, units.length, 0)}
                    </div>}
                </div>}
              
              {/* Color indicator (small swatch next to name) */}
              {item.color && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <ProductImageWithColorFallback
                    color={item.color}
                    productName={item.name}
                    size={12}
                    rounded="full"
                  />
                  <span className="text-[9px] text-muted-foreground truncate">{item.color}</span>
                </div>
              )}

              {/* Price and stock */}
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">
                    {(() => {
                      const currencySymbol = getCurrencySymbol(units.currency || 'NZD');
                      const lengthUnit = units.fabric || 'm';
                      
                      // Check if using pricing grid - also check metadata for TWC products
                      if (item.price_group || item.pricing_grid_id || item.metadata?.pricing_grid_data) {
                        // Has grid - show "Grid" instead of fake price
                        return <span className="text-primary">Grid Pricing</span>;
                      }
                      // No grid - show actual price from database
                      return `${currencySymbol}${price.toFixed(2)}/${lengthUnit}`;
                    })()}
                  </span>
                  <span className="text-[8px] text-muted-foreground leading-none">
                    {item.price_group || item.pricing_grid_id || item.metadata?.pricing_grid_data
                      ? `${item.resolved_grid_name || item.price_group || 'Grid assigned'}` 
                      : (item.pricing_method ? item.pricing_method.replace(/_/g, ' ') : 'Per metre')}
                  </span>
                </div>
                {item.quantity !== undefined && item.quantity > 0 && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">
                    {item.quantity} {units.fabric || 'm'}
                  </Badge>
                )}
              </div>
              
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-0.5 pt-1">
                  {item.tags.slice(0, 2).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-[8px] px-1 py-0 h-3.5">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 2 && (
                    <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5">
                      +{item.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>;
  };
  const getTabsForTreatment = () => {
    // Wallpaper only needs wallcovering
    if (treatmentCategory === 'wallpaper') {
      return [{ key: "fabric", label: "Wallpaper", icon: Palette }];
    }
    
    // Curtains need fabric only (hardware assigned in settings)
    if (treatmentCategory === 'curtains') {
      return [
        { key: "fabric", label: "Fabric", icon: Palette }
      ];
    }
    
    // Roman blinds can use fabrics
    if (treatmentCategory === 'roman_blinds') {
      return [
        { key: "fabric", label: "Fabric", icon: Palette }
      ];
    }
    
    // Roller blinds use fabric
    if (treatmentCategory === 'roller_blinds') {
      return [
        { key: "fabric", label: "Fabric", icon: Palette }
      ];
    }
    
    // Panel glide uses fabric
    if (treatmentCategory === 'panel_glide') {
      return [
        { key: "fabric", label: "Fabric", icon: Palette }
      ];
    }
    
    // FIXED: Cellular/honeycomb blinds use FABRIC, not material
    if (treatmentCategory === 'cellular_blinds') {
      return [
        { key: "fabric", label: "Fabric", icon: Palette }
      ];
    }
    
    // Venetian blinds need materials (slats only)
    if (treatmentCategory === 'venetian_blinds') {
      return [
        { key: "material", label: "Material", icon: Package }
      ];
    }
    
    // Vertical blinds support BOTH fabric vanes AND material slats
    if (treatmentCategory === 'vertical_blinds') {
      return [
        { key: "both", label: "Fabric & Material", icon: Palette }
      ];
    }
    
    // Shutters
    if (treatmentCategory === 'shutters' || treatmentCategory === 'plantation_shutters') {
      return [
        { key: "material", label: "Material", icon: Package }
      ];
    }
    
    // Default: show fabric only
    return [
      { key: "fabric", label: "Fabric", icon: Palette }
    ];
  };
  const availableTabs = getTabsForTreatment();

  // Sync activeCategory with first available tab when treatment changes
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some(tab => tab.key === activeCategory)) {
      setActiveCategory(availableTabs[0].key);
    }
  }, [treatmentCategory, availableTabs.length]);

  return <div className={`h-full flex flex-col ${className}`}>
      <div className="flex gap-2 items-center animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground transition-transform" />
          <Input 
            placeholder="Search inventory: fabrics, hardware, materials..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="pl-12 h-12 text-base transition-all duration-200 focus:scale-[1.02]"
          />
        </div>
        
        <FilterButton
          selectedVendor={selectedVendor}
          selectedCollection={selectedCollection}
          selectedTags={selectedTags}
          onVendorChange={setSelectedVendor}
          onCollectionChange={setSelectedCollection}
          onTagsChange={setSelectedTags}
        />
        
        <Button 
          variant="outline" 
          className="h-12 px-4 shrink-0"
          onClick={() => setScannerOpen(true)}
        >
          <ScanLine className="h-4 w-4 mr-2" />
          Scan QR
        </Button>
        
        <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="h-12 px-4 shrink-0"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Manual Entry</DialogTitle>
                <DialogDescription>
                  Enter custom {activeCategory} details not in your inventory.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={manualEntry.name}
                    onChange={(e) => setManualEntry({ ...manualEntry, name: e.target.value })}
                    placeholder={`Enter ${activeCategory} name`}
                  />
                </div>

                {activeCategory === "fabric" && treatmentCategory === "wallpaper" ? (
                  // Wallpaper-specific fields
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="wallpaper_roll_width">Roll Width (cm)</Label>
                      <Input
                        id="wallpaper_roll_width"
                        type="number"
                        step="0.1"
                        value={manualEntry.fabric_width}
                        onChange={(e) => setManualEntry({ ...manualEntry, fabric_width: e.target.value })}
                        placeholder="e.g., 53, 70, 106"
                      />
                      <p className="text-xs text-muted-foreground">
                        Standard rolls are typically {formatFromCM(53, units.length)} wide
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="wallpaper_roll_length">Roll Length (meters)</Label>
                      <Input
                        id="wallpaper_roll_length"
                        type="number"
                        step="0.1"
                        value={manualEntry.pattern_repeat_vertical}
                        onChange={(e) => setManualEntry({ ...manualEntry, pattern_repeat_vertical: e.target.value })}
                        placeholder="e.g., 10, 15"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="pattern_repeat">Pattern Repeat (cm)</Label>
                      <Input
                        id="pattern_repeat"
                        type="number"
                        step="0.1"
                        value={manualEntry.pattern_repeat_horizontal}
                        onChange={(e) => setManualEntry({ ...manualEntry, pattern_repeat_horizontal: e.target.value })}
                        placeholder="e.g., 64, 0 for plain"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter 0 for no pattern repeat
                      </p>
                    </div>
                  </>
                ) : activeCategory === "fabric" ? (
                  // Curtain/Blind fabric fields
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="fabric_width">Fabric Width (cm)</Label>
                      <Input
                        id="fabric_width"
                        type="number"
                        step="1"
                        value={manualEntry.fabric_width}
                        onChange={(e) => setManualEntry({ ...manualEntry, fabric_width: e.target.value })}
                        placeholder="e.g., 137, 300"
                      />
                      <p className="text-xs text-muted-foreground">
                        Fabrics ≥250cm are wide (can be railroaded), &lt;250cm are narrow
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-2">
                        <Label htmlFor="pattern_repeat_vertical">Vertical Repeat (cm)</Label>
                        <Input
                          id="pattern_repeat_vertical"
                          type="number"
                          step="0.1"
                          value={manualEntry.pattern_repeat_vertical}
                          onChange={(e) => setManualEntry({ ...manualEntry, pattern_repeat_vertical: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="pattern_repeat_horizontal">Horizontal Repeat (cm)</Label>
                        <Input
                          id="pattern_repeat_horizontal"
                          type="number"
                          step="0.1"
                          value={manualEntry.pattern_repeat_horizontal}
                          onChange={(e) => setManualEntry({ ...manualEntry, pattern_repeat_horizontal: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="grid gap-2">
                  <Label htmlFor="price">Price per Unit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={manualEntry.price}
                      onChange={(e) => setManualEntry({ ...manualEntry, price: e.target.value })}
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <Select
                      value={manualEntry.unit}
                      onValueChange={(value) => setManualEntry({ ...manualEntry, unit: value })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m">per m</SelectItem>
                        <SelectItem value="yd">per yd</SelectItem>
                        <SelectItem value="ft">per ft</SelectItem>
                        <SelectItem value="m²">per m²</SelectItem>
                        <SelectItem value="each">each</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowManualEntry(false)}>
                  Cancel
                </Button>
                <Button onClick={handleManualEntrySubmit} disabled={createInventoryItem.isPending}>
                  {createInventoryItem.isPending ? "Adding..." : "Add Item"}
                </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col overflow-hidden mt-2">
        <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }}>
          {availableTabs.map(({
          key,
          label,
          icon: Icon
        }) => <TabsTrigger key={key} value={key} className="flex items-center justify-center gap-1.5 text-sm">
              <Icon className="h-4 w-4" />
            </TabsTrigger>)}
        </TabsList>

        {availableTabs.map(({
        key,
        label
      }) => {
          const categoryItems = getInventoryByCategory(key);
          return <TabsContent key={key} value={key} className="flex-1 overflow-hidden">
            <VirtualizedInventoryGrid
              items={categoryItems}
              renderItem={renderInventoryItem}
              category={key}
              emptyMessage={
                treatmentCategory === 'wallpaper' && key === 'fabric' 
                  ? 'No wallpaper items found. Add items with subcategory "wallcovering" or "wallpaper" in inventory.'
                  : key === 'material'
                  ? `No ${label.toLowerCase()} found. Add items with category "material" and subcategory "${getAcceptedSubcategories(treatmentCategory).join('" or "')}" in inventory.`
                  : key === 'hardware'
                  ? 'No hardware found. Add items with category "treatment_option", "top_system", "track", or "pole" in inventory.'
                  : `No ${label.toLowerCase()} items found. Add items with subcategory "${getAcceptedSubcategories(treatmentCategory).join('" or "')}" in inventory.`
              }
              searchTerm={debouncedSearchTerm}
            />
          </TabsContent>;
        })}
      </Tabs>
      
      <QRCodeScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleQRScan}
      />
    </div>;
};