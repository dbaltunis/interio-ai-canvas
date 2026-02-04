import { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, Palette, Wrench, Check, X, Plus, Edit3, ScanLine, Loader2, Building2, MoreHorizontal } from "lucide-react";
import { FilterButton } from "@/components/library/FilterButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { cn } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useEnhancedInventory, useCreateEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { formatFromCM, getUnitLabel } from "@/utils/measurementFormatters";
import { supabase } from "@/integrations/supabase/client";
import { TreatmentCategory, getTreatmentConfig } from "@/utils/treatmentTypeDetection";
import { useTreatmentSpecificFabrics, parseUnifiedSupplierId } from "@/hooks/useTreatmentSpecificFabrics";
import { getAcceptedSubcategories, getTreatmentPrimaryCategory } from "@/constants/inventorySubcategories";
import { toast } from "sonner";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { InventoryCardSkeleton } from "@/components/inventory/InventoryCardSkeleton";
import { useVendors } from "@/hooks/useVendors";
import { matchesUnifiedSupplier } from "@/hooks/useUnifiedSuppliers";
import { PriceGroupFilter } from "./PriceGroupFilter";
import { QuickTypeFilter } from "./QuickTypeFilter";
import { ColorSwatchSelector } from "./ColorSwatchSelector";
import { MissingGridWarning } from "./MissingGridWarning";
import { useRecentMaterialSelections } from "@/hooks/useRecentMaterialSelections";
import { useFavoriteMaterials } from "@/hooks/useFavoriteMaterials";
import { RecentSelectionsRow } from "./RecentSelectionsRow";
import { FavoriteButton } from "./FavoriteButton";

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
  templateId?: string; // For price group filtering
  parentProductId?: string; // NEW: For TWC-linked material filtering (shows ONLY linked materials)
}
export const InventorySelectionPanel = ({
  treatmentType,
  selectedItems,
  onItemSelect,
  onItemDeselect,
  measurements = {},
  className = "",
  treatmentCategory = 'curtains',
  templateId,
  parentProductId // NEW: Filter to exact TWC materials
}: InventorySelectionPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("fabric");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | undefined>();
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriceGroup, setSelectedPriceGroup] = useState<string | null>(null);
  const [selectedQuickTypes, setSelectedQuickTypes] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    name: "",
    price: "",
    unit: "m",
    fabric_width: "",
    pattern_repeat_horizontal: "",
    pattern_repeat_vertical: ""
  });
  const selectedCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // New hooks for recent selections and favorites
  const { items: recentItems, addSelection, clearHistory, getRelativeTime } = useRecentMaterialSelections();
  const { favorites, toggleFavorite, isFavorite } = useFavoriteMaterials();
  
  // ✅ CRITICAL FIX: Reset price group filter when treatment category changes
  useEffect(() => {
    console.log('🔄 Treatment changed, resetting price group filter:', treatmentCategory);
    setSelectedPriceGroup(null);
    setSelectedQuickTypes([]);
    setSearchTerm("");
    setShowFavoritesOnly(false);
  }, [treatmentCategory]);
  const {
    data: inventory = []
  } = useEnhancedInventory();
  const { data: vendors = [] } = useVendors();
  const {
    units,
    formatLength
  } = useMeasurementUnits();
  const treatmentConfig = getTreatmentConfig(treatmentCategory);

  const createInventoryItem = useCreateEnhancedInventoryItem();

  // Debounce search for server-side filtering (300ms delay)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Parse vendor selection into server-side filter
  const supplierFilter = useMemo(() => {
    return parseUnifiedSupplierId(selectedVendor);
  }, [selectedVendor]);

  // Use treatment-specific fabrics with server-side search, pagination, price group filtering, 
  // TWC parent product filtering, AND server-side vendor/supplier filtering
  const {
    data: fabricsData,
    isLoading: isFabricsLoading,
    isFetching: isFabricsFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTreatmentSpecificFabrics(treatmentCategory, debouncedSearchTerm, templateId, parentProductId, supplierFilter);

  // Flatten paginated data into single array
  const treatmentFabrics = useMemo(() => {
    if (!fabricsData?.pages) return [];
    return fabricsData.pages.flatMap(page => page.items);
  }, [fabricsData]);

  // Calculate price groups for filtering
  const priceGroupStats = useMemo(() => {
    const groups = new Map<string, number>();
    treatmentFabrics.forEach(item => {
      if (item.price_group) {
        groups.set(item.price_group, (groups.get(item.price_group) || 0) + 1);
      }
    });
    return Array.from(groups.entries())
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => a.group.localeCompare(b.group));
  }, [treatmentFabrics]);

  // Calculate brand groups for sidebar
  const brandGroups = useMemo(() => {
    const groups = new Map<string | null, { vendorName: string; count: number }>();
    treatmentFabrics.forEach(item => {
      const vendorId = item.vendor_id || null;
      const vendorName = item.vendor?.name || item.supplier || 'Unassigned';
      const existing = groups.get(vendorId);
      if (existing) {
        existing.count++;
      } else {
        groups.set(vendorId, { vendorName, count: 1 });
      }
    });
    return Array.from(groups.entries())
      .map(([vendorId, { vendorName, count }]) => ({
        vendorId,
        vendorName,
        itemCount: count
      }))
      .sort((a, b) => a.vendorName.localeCompare(b.vendorName));
  }, [treatmentFabrics]);

  // Calculate available quick filter types
  const availableQuickTypes = useMemo(() => {
    const types = new Set<string>();
    treatmentFabrics.forEach(item => {
      if (item.tags) {
        ['blockout', 'sheer', 'sunscreen', 'light_filtering', 'dimout', 'thermal', 'wide_width'].forEach(t => {
          if (item.tags.includes(t)) types.add(t);
        });
      }
    });
    return Array.from(types);
  }, [treatmentFabrics]);

  // Handle quick type toggle
  const handleQuickTypeToggle = (type: string) => {
    setSelectedQuickTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

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

  // AUTO-SELECT: When only 1 material exists and nothing is selected, auto-select it
  // This streamlines the workflow for single-material templates (e.g., TWC products)
  useEffect(() => {
    // Only auto-select when data is loaded and not fetching
    if (isFabricsLoading || isFabricsFetching) return;
    
    // Check if we have exactly 1 item and nothing is currently selected
    const currentCategory = activeCategory === 'both' ? 'fabric' : activeCategory;
    const currentSelection = selectedItems[currentCategory as keyof typeof selectedItems];
    
    // Get filtered items for current category
    const filteredItems = activeCategory === 'fabric' || activeCategory === 'both' 
      ? treatmentFabrics 
      : [];
    
    // Auto-select if: exactly 1 item AND no current selection AND parentProductId is set (template-linked)
    if (filteredItems.length === 1 && !currentSelection && parentProductId) {
      const singleItem = filteredItems[0];
      console.log('🎯 Auto-selecting single material:', singleItem.name);
      onItemSelect(currentCategory, singleItem);
      toast.success(`Auto-selected: ${singleItem.name}`);
    }
  }, [treatmentFabrics, activeCategory, selectedItems, isFabricsLoading, isFabricsFetching, parentProductId, onItemSelect]);

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
    // For fabric category, use server-side filtered treatmentFabrics
    // Apply client-side filters ONLY for collection/tags/price group/quick types
    // (vendor/supplier is now server-side)
    if (category === "fabric") {
      const filtered = treatmentFabrics.filter(item => {
        // Vendor/supplier is now filtered server-side, no need to check here
        const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
        const matchesTags = selectedTags.length === 0 || (item.tags && selectedTags.some(tag => item.tags.includes(tag)));
        // Price group filter
        const matchesPriceGroup = !selectedPriceGroup || item.price_group === selectedPriceGroup;
        // Quick type filter (must match ALL selected types)
        const matchesQuickTypes = selectedQuickTypes.length === 0 || 
          (item.tags && selectedQuickTypes.every(t => item.tags.includes(t)));
        return matchesCollection && matchesTags && matchesPriceGroup && matchesQuickTypes;
      });
      // Sort results: items starting with search term first, then alphabetically
      const searchLower = searchTerm.toLowerCase();
      const sorted = searchTerm ? filtered.sort((a, b) => {
        const aName = a.name?.toLowerCase() || '';
        const bName = b.name?.toLowerCase() || '';
        const aStartsWith = aName.startsWith(searchLower) ? 0 : 1;
        const bStartsWith = bName.startsWith(searchLower) ? 0 : 1;
        if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith;
        return aName.localeCompare(bName);
      }) : filtered;
      return sorted;
    }

    // For "both" category (vertical blinds with fabric AND material vanes)
    if (category === "both") {
      const searchLower = searchTerm.toLowerCase();
      
      // CRITICAL FIX: When parentProductId is set (TWC-linked), ALL items come from treatmentFabrics
      // treatmentFabrics is already filtered by parent_product_id AND vendor via useTreatmentSpecificFabrics
      if (parentProductId) {
        const filtered = treatmentFabrics.filter(item => {
          const matchesSearch = item.name?.toLowerCase().includes(searchLower) || 
                               item.description?.toLowerCase().includes(searchLower) ||
                               item.sku?.toLowerCase().includes(searchLower) ||
                               item.supplier?.toLowerCase().includes(searchLower) ||
                               item.vendor?.name?.toLowerCase().includes(searchLower);
          // Vendor/supplier is already server-side filtered for treatmentFabrics
          const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
          const matchesTags = selectedTags.length === 0 || (item.tags && selectedTags.some(tag => item.tags.includes(tag)));
          return matchesSearch && matchesCollection && matchesTags;
        });
        
        console.log('📦 Both tab (TWC-linked): Using ONLY treatmentFabrics:', filtered.length, 'items');
        return filtered;
      }
      
      // Non-TWC templates: combine fabric from treatmentFabrics + materials from inventory
      // treatmentFabrics already has server-side vendor filter applied
      const fabricItems = treatmentFabrics.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchLower) || 
                             item.description?.toLowerCase().includes(searchLower) ||
                             item.sku?.toLowerCase().includes(searchLower) ||
                             item.supplier?.toLowerCase().includes(searchLower) ||
                             item.vendor?.name?.toLowerCase().includes(searchLower);
        // Vendor/supplier is already server-side filtered for treatmentFabrics
        const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
        const matchesTags = selectedTags.length === 0 || (item.tags && selectedTags.some(tag => item.tags.includes(tag)));
        return matchesSearch && matchesCollection && matchesTags;
      });

      // Get material items from inventory (only for non-TWC templates)
      // These still need client-side vendor filtering
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
        // Client-side vendor filter for inventory items
        const matchesVendor = matchesUnifiedSupplier(item, selectedVendor, vendors);
        const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
        const matchesTags = selectedTags.length === 0 || (item.tags && selectedTags.some(tag => item.tags.includes(tag)));
        
        return matchesCategory && matchesSubcategory && matchesSearch && matchesVendor && matchesCollection && matchesTags;
      });

      console.log('📦 Both tab (non-TWC):', fabricItems.length, 'fabric items +', materialItems.length, 'material items');
      return [...fabricItems, ...materialItems];
    }

    // For material category, filter by treatment-specific material subcategories
    // CRITICAL FIX: Use enriched materials from treatmentFabrics (which now includes materials with pricing grids)
    if (category === "material") {
      const requiredSubcategories = getTreatmentMaterialSubcategories();
      
      console.log('🔍 Filtering materials - Required subcategories:', requiredSubcategories);
      console.log('📊 treatmentFabrics count:', treatmentFabrics.length, '| Raw inventory count:', inventory.length);
      console.log('🔗 parentProductId:', parentProductId || 'none (non-TWC)');
      
      // CRITICAL FIX: When parentProductId is set (TWC-linked), ALL items come from treatmentFabrics ONLY
      // treatmentFabrics is already filtered by parent_product_id AND vendor via useTreatmentSpecificFabrics
      if (parentProductId) {
        const searchLower = searchTerm.toLowerCase();
        const filtered = treatmentFabrics.filter(item => {
          const matchesSearch = item.name?.toLowerCase().includes(searchLower) || 
                               item.description?.toLowerCase().includes(searchLower) ||
                               item.sku?.toLowerCase().includes(searchLower) ||
                               item.supplier?.toLowerCase().includes(searchLower) ||
                               item.vendor?.name?.toLowerCase().includes(searchLower);
          // Vendor/supplier is already server-side filtered for treatmentFabrics
          const matchesCollection = !selectedCollection || item.collection_id === selectedCollection;
          const matchesTags = selectedTags.length === 0 || (item.tags && selectedTags.some(tag => item.tags.includes(tag)));
          return matchesSearch && matchesCollection && matchesTags;
        });
        
        const enrichedCount = filtered.filter(i => i.pricing_grid_data || i.resolved_grid_id).length;
        console.log(`📦 Material tab (TWC-linked): Using ONLY treatmentFabrics: ${filtered.length} items (${enrichedCount} with pricing grids)`);
        return filtered;
      }
      
      // Non-TWC templates: Use treatmentFabrics if available, else fall back to inventory
      // treatmentFabrics already has server-side vendor filter applied
      const sourceData = treatmentFabrics.length > 0 ? treatmentFabrics : inventory;
      const dataSource = treatmentFabrics.length > 0 ? 'treatmentFabrics (enriched)' : 'raw inventory';
      const useServerSideVendorFilter = treatmentFabrics.length > 0;
      
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
        
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = item.name?.toLowerCase().includes(searchLower) || 
                             item.description?.toLowerCase().includes(searchLower) ||
                             item.sku?.toLowerCase().includes(searchLower) ||
                             item.supplier?.toLowerCase().includes(searchLower) ||
                             item.vendor?.name?.toLowerCase().includes(searchLower);
        // Only apply client-side vendor filter if NOT using treatmentFabrics (which is already server-side filtered)
        const matchesVendor = useServerSideVendorFilter ? true : matchesUnifiedSupplier(item, selectedVendor, vendors);
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
      const searchLower = searchTerm.toLowerCase();
      const filtered = inventory.filter(item => {
        const matchesCategory = item.category?.toLowerCase() === 'hardware';
        const matchesSearch = item.name?.toLowerCase().includes(searchLower) || 
                             item.description?.toLowerCase().includes(searchLower) ||
                             item.sku?.toLowerCase().includes(searchLower) ||
                             item.supplier?.toLowerCase().includes(searchLower) ||
                             item.vendor?.name?.toLowerCase().includes(searchLower);
        // Use unified vendor/supplier matching
        const matchesVendor = matchesUnifiedSupplier(item, selectedVendor, vendors);
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
    
    // Handle item selection with recent tracking
    const handleSelect = () => {
      if (isSelected) {
        onItemDeselect(category);
      } else {
        addSelection(item);
        onItemSelect(category, item);
      }
    };
    
    return <Card 
      key={item.id} 
      ref={(el) => {
        if (el) {
          selectedCardRefs.current.set(item.id, el);
        }
      }}
      className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}`} 
      onClick={handleSelect}
    >
        <CardContent className="p-1">
          <div className="flex flex-col space-y-1">
            {/* Image or Color Swatch - fills entire card width */}
            <div className="aspect-square w-full relative overflow-hidden rounded-sm bg-muted">
              <ProductImageWithColorFallback
                imageUrl={imageUrl}
                color={item.color}
                productName={item.name}
                supplierName={item.supplier || item.vendor?.name}
                category={category}
                className="w-full h-full object-cover"
                fillContainer={true}
                showColorName={true}
                rounded="sm"
              />
              {isSelected && <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full z-10" />}
              
              {/* Favorite button */}
              <FavoriteButton
                isFavorite={isFavorite(item.id)}
                onToggle={() => toggleFavorite(item.id)}
                className="absolute top-1 left-1 z-10"
              />
              
              {/* Pricing Grid Badge Overlay */}
              {(category === 'fabric' || category === 'material') && (item.price_group || item.pricing_grid_id || item.metadata?.pricing_grid_data) && (
                <div className="absolute bottom-1 left-1 right-1 z-10">
                  <Badge variant="default" className="text-[9px] px-1.5 py-0.5 h-5 bg-success hover:bg-success/90 text-success-foreground w-full justify-center">
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
                        // Has grid - show clean "Group X" label
                        return <span className="text-primary">Group {item.price_group || 'Assigned'}</span>;
                      }
                      // No grid - show actual price from database
                      return `${currencySymbol}${price.toFixed(2)}/${lengthUnit}`;
                    })()}
                  </span>
                  <span className="text-[8px] text-muted-foreground leading-none">
                    {item.price_group || item.pricing_grid_id || item.metadata?.pricing_grid_data
                      ? 'per pricing grid' 
                      : (item.pricing_method ? item.pricing_method.replace(/_/g, ' ') : 'Per metre')}
                  </span>
                </div>
              {/* Stock indicator with color coding - only show for explicitly tracked inventory */}
                {item.track_inventory === true && item.quantity !== undefined && (
                  <Badge 
                    variant={item.quantity <= 0 ? "destructive" : item.quantity < 10 ? "outline" : "secondary"}
                    className={cn(
                      "text-[9px] px-1.5 py-0 h-4 shrink-0",
                      item.quantity <= 0 && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                      item.quantity > 0 && item.quantity < 10 && "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-300",
                      item.quantity >= 10 && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    )}
                  >
                    {item.quantity <= 0 ? 'Out' : `${item.quantity} ${units.fabric || 'm'}`}
                  </Badge>
                )}
              </div>
              
              {/* Color swatches instead of plain tags for colors */}
              {item.tags && item.tags.length > 0 && (
                <ColorSwatchSelector 
                  colors={item.tags}
                  size="sm"
                  maxVisible={5}
                />
              )}

              {/* Note: Grid warning removed from selection cards - appears only after enrichment fails in measurements */}
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
      <div className="flex gap-2 items-center flex-wrap animate-fade-in">
        <div className="relative flex-1 min-w-[120px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform" />
          <Input 
            placeholder="Search fabrics, materials..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} 
            className="pl-9 h-10 text-sm transition-all duration-200"
          />
          {isFabricsFetching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        
        {/* Brand Dropdown - replaces sidebar */}
        {brandGroups.length > 1 && (
          <Select 
            value={selectedVendor || "all"} 
            onValueChange={(val) => setSelectedVendor(val === "all" ? undefined : val)}
          >
            <SelectTrigger className="w-28 h-10">
              <Building2 className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All ({treatmentFabrics.length})</SelectItem>
              {brandGroups.map(({ vendorId, vendorName, itemCount }) => (
                <SelectItem key={vendorId || 'unassigned'} value={vendorId || 'unassigned'}>
                  {vendorName} ({itemCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {/* Compact Price Group Dropdown */}
        {priceGroupStats.length > 0 && (
          <Select 
            value={selectedPriceGroup || "all"} 
            onValueChange={(val) => setSelectedPriceGroup(val === "all" ? null : val)}
          >
            <SelectTrigger className="w-24 h-10">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              {priceGroupStats.map(({ group, count }) => (
                <SelectItem key={group} value={group}>
                  {group} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {/* Favorites Toggle */}
        {favorites.length > 0 && (
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            className="h-10 gap-1.5 px-3"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <FavoriteButton
              isFavorite={showFavoritesOnly}
              onToggle={() => {}}
              className="pointer-events-none"
              size="sm"
            />
            <span className="text-xs">{favorites.length}</span>
          </Button>
        )}
        
        {/* Actions dropdown (QR + Manual) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setScannerOpen(true)}>
              <ScanLine className="h-4 w-4 mr-2" />
              Scan QR Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowManualEntry(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Manual Entry
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <FilterButton
          selectedVendor={selectedVendor}
          selectedCollection={selectedCollection}
          selectedTags={selectedTags}
          onVendorChange={setSelectedVendor}
          onCollectionChange={setSelectedCollection}
          onTagsChange={setSelectedTags}
        />
      </div>
      
      {/* TWC Linked Materials Indicator - shows when filtering by parent product */}
      {parentProductId && (
        <div className="flex items-center gap-1.5 mt-2 py-1 px-2 bg-muted/50 rounded text-muted-foreground">
          <Building2 className="h-3 w-3" />
          <span className="text-[10px] font-medium">TWC Linked</span>
          <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1">
            {treatmentFabrics.length}
          </Badge>
        </div>
      )}
      
      {/* Quick Type Filters - compact row */}
      {availableQuickTypes.length > 0 && (
        <div className="flex items-center gap-2 py-1">
          <span className="text-[10px] font-medium text-muted-foreground shrink-0">Type:</span>
          <QuickTypeFilter
            selectedTypes={selectedQuickTypes}
            onTypeToggle={handleQuickTypeToggle}
            availableTypes={availableQuickTypes}
          />
        </div>
      )}
      
      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
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

      {/* Main content - full width without sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden mt-2">
        {/* Category tabs and content */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col overflow-hidden">
          {availableTabs.length > 1 && (
            <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }}>
              {availableTabs.map(({ key, label, icon: Icon }) => (
                <TabsTrigger key={key} value={key} className="flex items-center justify-center gap-1.5 text-sm">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          {availableTabs.map(({ key, label }) => {
            const categoryItems = getInventoryByCategory(key);
            
            // Filter for favorites if showFavoritesOnly is true
            const displayItems = showFavoritesOnly 
              ? categoryItems.filter(item => isFavorite(item.id))
              : categoryItems;
            
            // Handle recent item selection
            const handleRecentSelect = (itemId: string) => {
              const item = categoryItems.find(i => i.id === itemId);
              if (item) {
                addSelection(item);
                onItemSelect(key, item);
              }
            };
            
            return (
              <TabsContent key={key} value={key} className="flex-1 overflow-hidden">
                {/* Recently Used Row */}
                {recentItems.length > 0 && !showFavoritesOnly && (
                  <RecentSelectionsRow
                    items={recentItems}
                    getRelativeTime={getRelativeTime}
                    onSelect={handleRecentSelect}
                    onClear={clearHistory}
                    className="border-b border-border/50 px-2"
                  />
                )}
                
                {/* Favorites indicator */}
                {showFavoritesOnly && (
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/50 bg-amber-50 dark:bg-amber-950/30">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">★ Showing Favorites Only</span>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        {displayItems.length}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-[10px]"
                      onClick={() => setShowFavoritesOnly(false)}
                    >
                      Show All
                    </Button>
                  </div>
                )}
                
                {/* Skeleton loading state */}
                {key === 'fabric' && isFabricsLoading && displayItems.length === 0 && (
                  <ScrollArea className="h-full">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 p-2">
                      <InventoryCardSkeleton count={12} />
                    </div>
                  </ScrollArea>
                )}
                
                {/* Items grid */}
                {(!isFabricsLoading || displayItems.length > 0) && (
                  <ScrollArea className="h-full">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 p-2">
                      {displayItems.map(item => renderInventoryItem(item, key))}
                    </div>
                    
                    {/* Load More button */}
                    {key === 'fabric' && hasNextPage && !showFavoritesOnly && (
                      <div className="flex justify-center py-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                        >
                          {isFetchingNextPage ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            `Load More (${displayItems.length} shown)`
                          )}
                        </Button>
                      </div>
                    )}
                  </ScrollArea>
                )}

                {displayItems.length === 0 && !isFabricsLoading && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">
                      {showFavoritesOnly 
                        ? 'No favorites yet. Star items to add them here.'
                        : treatmentCategory === 'wallpaper' && key === 'fabric' 
                        ? 'No wallpaper items found.'
                        : key === 'material'
                        ? `No ${label.toLowerCase()} found.`
                        : key === 'hardware'
                        ? 'No hardware found.'
                        : `No ${label.toLowerCase()} items found.`}
                    </p>
                    {searchTerm && !showFavoritesOnly && <p className="text-xs mt-1">Try different search terms</p>}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
      
      <QRCodeScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleQRScan}
      />
    </div>;
};