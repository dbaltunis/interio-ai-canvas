import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, Palette, Wrench, Check, X, Plus, Edit3 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { supabase } from "@/integrations/supabase/client";
import { TreatmentCategory, getTreatmentConfig } from "@/utils/treatmentTypeDetection";
import { useTreatmentSpecificFabrics } from "@/hooks/useTreatmentSpecificFabrics";
import { toast } from "sonner";
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
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState("fabric");
  const [showManualEntry, setShowManualEntry] = useState(false);
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
      const selectedCard = selectedCardRefs.current.get(selectedId);
      if (selectedCard) {
        selectedCard.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [activeCategory, selectedItems]);

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

  // Filter inventory by treatment type and category
  const getInventoryByCategory = (category: string) => {
    // For fabric category, ALWAYS use treatment-specific fabrics
    if (category === "fabric") {
      return treatmentFabrics.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    }

    // For other categories, use general inventory
    const categoryMap: Record<string, string[]> = {
      hardware: ["treatment_option", "top_system", "hardware", "track", "pole", "motor", "bracket"],
      material: ["Material", "material", "blind_material", "cellular_fabric", "panel_fabric", "shutter_material"]
    };
    
    console.log('🔍 Filtering inventory for category:', category, 'Treatment:', treatmentCategory);
    const filtered = inventory.filter(item => {
      const matchesCategory = categoryMap[category]?.some(cat => item.category?.toLowerCase().includes(cat.toLowerCase()));
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    
    console.log(`📦 Found ${filtered.length} items for category "${category}". Item categories:`, 
      [...new Set(filtered.map(i => i.category))]);
    
    return filtered;
  };

  // Calculate estimated cost for an item
  const calculateEstimatedCost = (item: any, category: string) => {
    if (!measurements.rail_width || !measurements.drop) return 0;
    const width = parseFloat(measurements.rail_width) / 100; // Convert to meters
    const height = parseFloat(measurements.drop) / 100;
    const area = width * height;
    const price = item.selling_price || item.unit_price || item.price_per_meter || 0;
    switch (category) {
      case "fabric":
        // For fabric, calculate based on linear meters needed
        const linearMeters = height * 2.5; // Approximate with fullness
        return linearMeters * price;
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

    // Get the image URL - try multiple sources
    const getImageUrl = () => {
      // Try image_url first (direct URL)
      if (item.image_url) {
        if (item.image_url.startsWith('http')) return item.image_url;
        // Try as storage path
        try {
          const { data } = supabase.storage.from('business-assets').getPublicUrl(item.image_url);
          if (data?.publicUrl) return data.publicUrl;
        } catch (e) {
          // Continue to images array
        }
      }
      
      // Try images array
      if (!item.images || item.images.length === 0) return null;
      const imagePath = item.images[0];

      // If it's already a full URL, return it
      if (imagePath?.startsWith('http')) return imagePath;

      // Try different storage buckets
      const bucketsToTry = ['business-assets', 'project-images', 'inventory-images'];

      // Return the first available public URL
      for (const bucket of bucketsToTry) {
        try {
          const {
            data
          } = supabase.storage.from(bucket).getPublicUrl(imagePath);
          if (data?.publicUrl) return data.publicUrl;
        } catch (e) {
          continue;
        }
      }
      return null;
    };
    const imageUrl = getImageUrl();
    return <Card 
      key={item.id} 
      ref={(el) => {
        if (el && isSelected) {
          selectedCardRefs.current.set(item.id, el);
        }
      }}
      className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}`} 
      onClick={() => isSelected ? onItemDeselect(category) : onItemSelect(category, item)}
    >
        <CardContent className="p-2">
          <div className="flex flex-col space-y-2">
            {/* Image - Larger for fabric */}
            <div className={`w-full bg-gray-50 border border-gray-200 rounded overflow-hidden relative ${category === 'fabric' ? 'h-24' : 'h-16'}`}>
              {imageUrl ? <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" onError={e => {
              console.error('Image failed to load:', imageUrl);
              e.currentTarget.style.display = 'none';
            }} /> : <div className="flex items-center justify-center h-full text-gray-400 text-[10px]">
                  No image
                </div>}
              {isSelected && <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />}
              
              {/* Pricing Grid Badge Overlay - Only for fabric */}
              {category === 'fabric' && item.price_group && (
                <div className="absolute bottom-1 left-1 right-1">
                  <Badge variant="default" className="text-[9px] px-1.5 py-0.5 h-5 bg-green-600 hover:bg-green-700 text-white w-full justify-center">
                    ✓ Grid: {item.price_group}
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
                      <span>📏 {item.fabric_width}cm wide</span>
                    </div>}
                  {item.product_category && <div className="text-[9px]">
                      For: {item.product_category.replace(/_/g, ' ')}
                    </div>}
                  {item.composition && <div className="truncate">Comp: {item.composition}</div>}
                  {(item.pattern_repeat_vertical > 0 || item.pattern_repeat_horizontal > 0) && <div>
                      Repeat: {item.pattern_repeat_vertical || 0}×{item.pattern_repeat_horizontal || 0}cm
                    </div>}
                </div>}
              
              {/* Price and stock */}
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <span className="text-xs font-semibold">
                  ${price.toFixed(2)}
                  {item.unit && <span className="text-[9px] text-muted-foreground">/{item.unit}</span>}
                </span>
                {item.quantity !== undefined && <Badge variant={item.quantity > 0 ? "secondary" : "destructive"} className="text-[9px] px-1 py-0 h-3.5">
                    {item.quantity > 0 ? `${item.quantity} ${item.unit || 'm'}` : 'Out'}
                  </Badge>}
              </div>
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
    
    // Curtains need fabric + hardware
    if (treatmentCategory === 'curtains') {
      return [
        { key: "fabric", label: "Fabric", icon: Palette },
        { key: "hardware", label: "Hardware", icon: Wrench }
      ];
    }
    
    // Roman blinds can use fabrics
    if (treatmentCategory === 'roman_blinds') {
      return [
        { key: "fabric", label: "Fabric", icon: Palette },
        { key: "hardware", label: "Hardware", icon: Wrench }
      ];
    }
    
    // Roller blinds use fabric
    if (treatmentCategory === 'roller_blinds') {
      return [
        { key: "fabric", label: "Fabric", icon: Palette },
        { key: "hardware", label: "Hardware", icon: Wrench }
      ];
    }
    
    // Panel glide uses fabric
    if (treatmentCategory === 'panel_glide') {
      return [
        { key: "fabric", label: "Fabric", icon: Palette },
        { key: "hardware", label: "Hardware", icon: Wrench }
      ];
    }
    
    // Other blinds need materials (if available) or hardware
    if (['venetian_blinds', 'vertical_blinds', 'cellular_blinds'].includes(treatmentCategory)) {
      return [
        { key: "material", label: "Material", icon: Package },
        { key: "hardware", label: "Hardware", icon: Wrench }
      ];
    }
    
    // Shutters
    if (treatmentCategory === 'shutters' || treatmentCategory === 'plantation_shutters') {
      return [
        { key: "material", label: "Material", icon: Package },
        { key: "hardware", label: "Hardware", icon: Wrench }
      ];
    }
    
    // Default: show fabric + hardware
    return [
      { key: "fabric", label: "Fabric", icon: Palette },
      { key: "hardware", label: "Hardware", icon: Wrench }
    ];
  };
  const availableTabs = getTabsForTreatment();
  return <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Select Materials & Hardware</h3>
        <div className="flex gap-2">
          <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 px-2"
              >
                <Edit3 className="h-4 w-4 mr-1" />
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

                {activeCategory === "fabric" && (
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
                )}

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
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="h-8 px-2"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      {showSearch && <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search inventory..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className="pl-10 h-9"
          autoFocus
        />
      </div>}

      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full h-9" style={{
        gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)`
      }}>
          {availableTabs.map(({
          key,
          label,
          icon: Icon
        }) => <TabsTrigger key={key} value={key} className="flex items-center gap-1.5 text-xs">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>)}
        </TabsList>

        {availableTabs.map(({
        key,
        label
      }) => {
          const categoryItems = getInventoryByCategory(key);
          return <TabsContent key={key} value={key} className="mt-3">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pr-3">
                {categoryItems.map(item => renderInventoryItem(item, key))}
              </div>

              {categoryItems.length === 0 && <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">
                    {treatmentCategory === 'wallpaper' && key === 'fabric' 
                      ? 'No wallpaper items found. Add items with category "wallcovering" in inventory.'
                      : ['venetian_blinds', 'vertical_blinds', 'cellular_blinds', 'shutters', 'plantation_shutters'].includes(treatmentCategory) && key === 'material'
                      ? `No ${label.toLowerCase()} found. Add items with category "${treatmentConfig.inventoryCategory}" in inventory.`
                      : key === 'hardware'
                      ? 'No hardware found. Add items with category "treatment_option", "top_system", "track", or "pole" in inventory.'
                      : `No ${label.toLowerCase()} items found`}
                  </p>
                  {searchTerm && <p className="text-xs mt-1">Try different search terms</p>}
                </div>}
            </ScrollArea>
          </TabsContent>;
        })}
      </Tabs>
    </div>;
};