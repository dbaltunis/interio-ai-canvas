
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface FabricSelectorProps {
  selectedFabric: any;
  onSelectionChange: (selection: any) => void;
  treatmentType: string;
  measurements: any;
}

export const FabricSelector = ({
  selectedFabric,
  onSelectionChange,
  treatmentType,
  measurements
}: FabricSelectorProps) => {
  const { formatCurrency } = useMeasurementUnits();
  const [customFabric, setCustomFabric] = useState({
    name: "",
    pricePerYard: "",
    width: "137",
    composition: ""
  });

  const fabricCollections = [
    {
      id: "premium_cotton",
      name: "Premium Cotton Collection",
      priceRange: [25, 45],
      fabrics: [
        { id: "cotton_1", name: "Classic Cotton", pricePerYard: 28, width: 137, composition: "100% Cotton" },
        { id: "cotton_2", name: "Cotton Linen Blend", pricePerYard: 32, width: 137, composition: "60% Cotton, 40% Linen" },
        { id: "cotton_3", name: "Organic Cotton", pricePerYard: 38, width: 137, composition: "100% Organic Cotton" }
      ]
    },
    {
      id: "luxury_silk",
      name: "Luxury Silk Collection",
      priceRange: [45, 85],
      fabrics: [
        { id: "silk_1", name: "Pure Silk Dupioni", pricePerYard: 65, width: 137, composition: "100% Silk" },
        { id: "silk_2", name: "Silk Taffeta", pricePerYard: 72, width: 137, composition: "100% Silk" },
        { id: "silk_3", name: "Silk Velvet", pricePerYard: 85, width: 137, composition: "100% Silk Velvet" }
      ]
    },
    {
      id: "designer_prints",
      name: "Designer Prints",
      priceRange: [35, 65],
      fabrics: [
        { id: "print_1", name: "Botanical Print", pricePerYard: 42, width: 137, composition: "Cotton/Polyester Blend" },
        { id: "print_2", name: "Geometric Pattern", pricePerYard: 48, width: 137, composition: "Cotton/Linen Blend" },
        { id: "print_3", name: "Damask Classic", pricePerYard: 55, width: 137, composition: "Cotton/Silk Blend" }
      ]
    },
    {
      id: "performance",
      name: "Performance Fabrics",
      priceRange: [30, 55],
      fabrics: [
        { id: "perf_1", name: "Sunbrella Outdoor", pricePerYard: 38, width: 137, composition: "Solution-Dyed Acrylic" },
        { id: "perf_2", name: "Stain Resistant", pricePerYard: 45, width: 137, composition: "Treated Polyester" },
        { id: "perf_3", name: "Blackout Fabric", pricePerYard: 35, width: 137, composition: "Coated Polyester" }
      ]
    }
  ];

  const calculateFabricUsage = (fabric: any) => {
    const width = parseFloat(measurements.width) || 100;
    const height = parseFloat(measurements.height) || 150;
    const fullness = 2.5; // Default fullness ratio
    
    // Simple calculation - should be enhanced with actual fabric calculation logic
    const totalWidth = width * fullness;
    const fabricWidthNeeded = Math.ceil(totalWidth / fabric.width);
    const totalLength = (height + 30) * fabricWidthNeeded; // 30cm for hems
    const yards = totalLength / 91.44; // Convert cm to yards
    
    return {
      yards: Math.ceil(yards * 10) / 10,
      cost: Math.ceil(yards * 10) / 10 * fabric.pricePerYard,
      widthsNeeded: fabricWidthNeeded
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fabric Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {fabricCollections.map((collection) => (
              <div key={collection.id}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{collection.name}</h4>
                  <Badge variant="outline">
                    {formatCurrency(collection.priceRange[0])} - {formatCurrency(collection.priceRange[1])} /yard
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {collection.fabrics.map((fabric) => {
                    const usage = calculateFabricUsage(fabric);
                    return (
                      <Card
                        key={fabric.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedFabric?.id === fabric.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/30'
                        }`}
                        onClick={() => onSelectionChange({ ...fabric, usage })}
                      >
                        <CardContent className="p-3">
                          <div className="w-full h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Fabric Sample</span>
                          </div>
                          <div className="font-medium text-sm mb-1">{fabric.name}</div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {fabric.composition}
                          </div>
                          <div className="text-xs mb-1">
                            {formatCurrency(fabric.pricePerYard)}/yard
                          </div>
                          <div className="text-xs text-green-600">
                            Est. {usage.yards} yards = {formatCurrency(usage.cost)}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Fabric Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Fabric</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabric_name">Fabric Name</Label>
              <Input
                id="fabric_name"
                value={customFabric.name}
                onChange={(e) => setCustomFabric(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter fabric name"
              />
            </div>
            <div>
              <Label htmlFor="price_per_yard">Price per Yard</Label>
              <Input
                id="price_per_yard"
                type="number"
                step="0.50"
                value={customFabric.pricePerYard}
                onChange={(e) => setCustomFabric(prev => ({ ...prev, pricePerYard: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="fabric_width">Fabric Width (cm)</Label>
              <Input
                id="fabric_width"
                type="number"
                value={customFabric.width}
                onChange={(e) => setCustomFabric(prev => ({ ...prev, width: e.target.value }))}
                placeholder="137"
              />
            </div>
            <div>
              <Label htmlFor="composition">Composition</Label>
              <Input
                id="composition"
                value={customFabric.composition}
                onChange={(e) => setCustomFabric(prev => ({ ...prev, composition: e.target.value }))}
                placeholder="e.g., 100% Cotton"
              />
            </div>
          </div>
          <Button 
            className="mt-4"
            onClick={() => {
              if (customFabric.name && customFabric.pricePerYard) {
                const fabricData = {
                  id: `custom_${Date.now()}`,
                  name: customFabric.name,
                  pricePerYard: parseFloat(customFabric.pricePerYard),
                  width: parseInt(customFabric.width),
                  composition: customFabric.composition
                };
                const usage = calculateFabricUsage(fabricData);
                onSelectionChange({ ...fabricData, usage });
              }
            }}
            disabled={!customFabric.name || !customFabric.pricePerYard}
          >
            Add Custom Fabric
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
