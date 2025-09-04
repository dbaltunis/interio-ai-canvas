import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, Palette, Wrench } from "lucide-react";
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

    return (
      <Card 
        key={item.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
        }`}
        onClick={() => isSelected ? onItemDeselect(category) : onItemSelect(category, item)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm">{item.name}</CardTitle>
            {isSelected && (
              <Badge variant="default" className="text-xs">Selected</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2 text-xs">
            {item.description && (
              <p className="text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="font-medium">
                ${(item.selling_price || item.unit_price || item.price_per_meter || 0).toFixed(2)}
                {item.unit && <span className="text-muted-foreground">/{item.unit}</span>}
              </span>
              
              {item.stock_quantity !== undefined && (
                <Badge variant={item.stock_quantity > 0 ? "secondary" : "destructive"} className="text-xs">
                  Stock: {item.stock_quantity}
                </Badge>
              )}
            </div>
            
            {/* Fabric specific details */}
            {category === "fabric" && (
              <div className="space-y-1">
                {item.fabric_width && (
                  <div>Width: {item.fabric_width}cm</div>
                )}
                {item.pattern_repeat && (
                  <div>Repeat: {item.pattern_repeat}cm</div>
                )}
                {item.fabric_type && (
                  <Badge variant="outline" className="text-xs">{item.fabric_type}</Badge>
                )}
              </div>
            )}
            
            {/* Estimated cost */}
            {estimatedCost > 0 && (
              <div className="pt-2 border-t border-border">
                <span className="text-primary font-medium">
                  Est. Cost: ${estimatedCost.toFixed(2)}
                </span>
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
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
          {availableTabs.map(({ key, label, icon: Icon }) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {availableTabs.map(({ key, label }) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{label} Selection</h3>
              {selectedItems[key as keyof typeof selectedItems] && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onItemDeselect(key)}
                >
                  Clear Selection
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {getInventoryByCategory(key).map(item => renderInventoryItem(item, key))}
            </div>

            {getInventoryByCategory(key).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No {label.toLowerCase()} items found</p>
                {searchTerm && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Selected items summary */}
      {Object.values(selectedItems).some(item => item) && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Selected Items</h4>
          <div className="space-y-2">
            {Object.entries(selectedItems).map(([category, item]) => 
              item && (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{category}: {item.name}</span>
                  <span className="font-medium">
                    ${(item.selling_price || item.unit_price || item.price_per_meter || 0).toFixed(2)}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};