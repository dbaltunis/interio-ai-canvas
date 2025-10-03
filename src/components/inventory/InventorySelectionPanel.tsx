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
}

export const InventorySelectionPanel = ({
  treatmentType,
  selectedItems,
  onItemSelect,
  onItemDeselect,
  measurements = {},
  className = ""
}: InventorySelectionPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("fabric");
  
  const { data: inventory = [] } = useEnhancedInventory();
  const { units, formatLength } = useMeasurementUnits();

  // Filter inventory by treatment type and category
  const getInventoryByCategory = (category: string) => {
    const categoryMap: Record<string, string[]> = {
      fabric: ["Fabric", "fabric"],
      hardware: ["Hardware", "hardware", "Track", "Rod", "Pole"],
      material: ["Material", "material", "Blind Material", "Blind_Material"]
    };

    return inventory.filter(item => {
      const matchesCategory = categoryMap[category]?.some(cat => 
        item.category?.toLowerCase().includes(cat.toLowerCase())
      );
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
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
    const isSelected = selectedItems[category as keyof typeof selectedItems]?.id === item.id;
    const price = item.selling_price || item.unit_price || item.price_per_meter || 0;

    return (
      <Card 
        key={item.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'
        }`}
        onClick={() => isSelected ? onItemDeselect(category) : onItemSelect(category, item)}
      >
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-xs leading-tight line-clamp-2 flex-1">
                {item.name}
              </h4>
              {isSelected && (
                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium">
                ${price.toFixed(2)}
                {item.unit && <span className="text-muted-foreground text-[10px]">/{item.unit}</span>}
              </span>
              
              {item.stock_quantity !== undefined && (
                <Badge variant={item.stock_quantity > 0 ? "secondary" : "destructive"} className="text-[10px] px-1.5 py-0 h-4">
                  {item.stock_quantity}
                </Badge>
              )}
            </div>
            
            {category === "fabric" && item.fabric_width && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {item.fabric_width}cm
              </Badge>
            )}
            
            {estimatedCost > 0 && (
              <div className="text-[10px] text-primary font-medium">
                Est: ${estimatedCost.toFixed(2)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const getTabsForTreatment = () => {
    switch (treatmentType) {
      case "curtains":
        return [
          { key: "fabric", label: "Fabric", icon: Palette },
          { key: "hardware", label: "Hardware", icon: Wrench }
        ];
      
      case "blinds":
      case "venetian_blinds":
      case "vertical_blinds":
      case "roller_blinds":
        return [
          { key: "material", label: "Material", icon: Package },
          { key: "hardware", label: "Hardware", icon: Wrench }
        ];
      
      default:
        return [
          { key: "fabric", label: "Fabric", icon: Palette },
          { key: "material", label: "Material", icon: Package },
          { key: "hardware", label: "Hardware", icon: Wrench }
        ];
    }
  };

  const availableTabs = getTabsForTreatment();

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-3">
        {/* Selected Items Inline Display */}
        {Object.values(selectedItems).some(item => item) && (
          <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex-1 flex flex-wrap items-center gap-2">
              {Object.entries(selectedItems).map(([category, item]) => 
                item && (
                  <div key={category} className="flex items-center gap-1.5 px-2 py-1 bg-background rounded border">
                    <span className="text-xs font-medium capitalize">{category}:</span>
                    <span className="text-xs">{item.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemDeselect(category);
                      }}
                      className="h-4 w-4 p-0 hover:bg-destructive/10"
                    >
                      <X className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        {/* Category tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full h-9" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
            {availableTabs.map(({ key, label, icon: Icon }) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1.5 text-xs">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {availableTabs.map(({ key, label }) => (
            <TabsContent key={key} value={key} className="mt-3">
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pr-3">
                  {getInventoryByCategory(key).map(item => renderInventoryItem(item, key))}
                </div>

                {getInventoryByCategory(key).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No {label.toLowerCase()} items found</p>
                    {searchTerm && (
                      <p className="text-xs mt-1">Try different search terms</p>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};