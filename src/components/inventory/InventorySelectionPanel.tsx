import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, Palette, Wrench, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { supabase } from "@/integrations/supabase/client";
import { TreatmentCategory, getTreatmentConfig } from "@/utils/treatmentTypeDetection";
import { useTreatmentSpecificFabrics } from "@/hooks/useTreatmentSpecificFabrics";
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
  const {
    data: inventory = []
  } = useEnhancedInventory();
  const {
    units,
    formatLength
  } = useMeasurementUnits();
  const treatmentConfig = getTreatmentConfig(treatmentCategory);

  // Use treatment-specific fabrics
  const {
    data: treatmentFabrics = []
  } = useTreatmentSpecificFabrics(treatmentCategory);

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
    
    // Check selection using multiple ID field options for fabric persistence
    const selectedItem = selectedItems[category as keyof typeof selectedItems];
    const isSelected = 
      selectedItem?.id === item.id || 
      selectedItem?.id === item.fabric_id ||
      selectedItem?.fabric_id === item.id ||
      selectedItem?.fabric_id === item.fabric_id;
    
    const price = item.selling_price || item.unit_price || item.price_per_meter || 0;

    // Get the image URL - try multiple storage buckets
    const getImageUrl = () => {
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
    return <Card key={item.id} className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}`} onClick={() => isSelected ? onItemDeselect(category) : onItemSelect(category, item)}>
        <CardContent className="p-2">
          <div className="flex flex-col space-y-2">
            {/* Image */}
            <div className="h-16 w-full bg-gray-50 border border-gray-200 rounded overflow-hidden relative">
              {imageUrl ? <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" onError={e => {
              console.error('Image failed to load:', imageUrl);
              e.currentTarget.style.display = 'none';
            }} /> : <div className="flex items-center justify-center h-full text-gray-400 text-[10px]">
                  No image
                </div>}
              {isSelected && <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />}
            </div>
            
            {/* Item details */}
            <div className="space-y-1">
              <h4 className="font-semibold text-xs line-clamp-1">{item.name}</h4>
              
              {/* Fabric-specific info */}
              {category === "fabric" && <div className="space-y-0.5 text-[10px] text-muted-foreground">
                  {item.fabric_width > 0 && <div className="flex items-center gap-1">
                      <span>📏 {item.fabric_width}cm wide</span>
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
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
          className="h-8 px-2"
        >
          <Search className="h-4 w-4" />
        </Button>
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
      }) => <TabsContent key={key} value={key} className="mt-3">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pr-3">
                {getInventoryByCategory(key).map(item => renderInventoryItem(item, key))}
              </div>

              {getInventoryByCategory(key).length === 0 && <div className="text-center py-12 text-muted-foreground">
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
          </TabsContent>)}
      </Tabs>
    </div>;
};