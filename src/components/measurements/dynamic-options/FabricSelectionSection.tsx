import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shirt, Palette } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";

interface FabricSelectionSectionProps {
  selectedFabric: string;
  onFabricChange: (fabricId: string) => void;
  readOnly?: boolean;
  fabricCalculation?: {
    linearMeters: number;
    totalCost: number;
    pricePerMeter: number;
    widthsRequired: number;
  };
}

export const FabricSelectionSection = ({
  selectedFabric,
  onFabricChange,
  readOnly = false,
  fabricCalculation
}: FabricSelectionSectionProps) => {
  const { units } = useMeasurementUnits();
  const { data: inventory = [], isLoading } = useEnhancedInventory();

  // Filter fabric inventory items
  const fabricItems = inventory.filter(item => 
    item.category?.toLowerCase().includes('fabric') || 
    item.category?.toLowerCase().includes('textile')
  );

  const selectedFabricItem = fabricItems.find(item => item.id === selectedFabric);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: units.currency
    }).format(price);
  };

  return (
    <div className="space-y-2">
      {/* Compact Fabric Selection */}
      <div>
        <Label className="text-xs font-medium">Choose Fabric</Label>
        <Select 
          value={selectedFabric} 
          onValueChange={(value) => {
            console.log('Fabric selected:', value);
            console.log('Fabric data:', fabricItems.find(f => f.id === value));
            onFabricChange(value);
          }}
          disabled={readOnly}
        >
          <SelectTrigger className="bg-background h-8 text-sm">
            <SelectValue placeholder="Select fabric from inventory" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Loading fabrics...
              </SelectItem>
            ) : fabricItems.length > 0 ? (
              fabricItems.map((fabric) => (
              <SelectItem key={fabric.id} value={fabric.id}>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{fabric.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatPrice(fabric.price_per_meter || fabric.unit_price || 0)}/m
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fabric.fabric_width && `${fabric.fabric_width}cm wide`}
                    {fabric.fabric_composition && ` • ${fabric.fabric_composition}`}
                  </div>
                </div>
              </SelectItem>
              ))
            ) : (
              <SelectItem value="no-fabrics" disabled>
                No fabrics in inventory - Add fabrics in Settings
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedFabricItem && (
        <div className="space-y-2">
          {/* Compact Fabric Info */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-1 bg-muted/50 rounded">
              <div className="font-medium">{selectedFabricItem.fabric_width || 137}cm</div>
              <div className="text-muted-foreground">Width</div>
            </div>
            <div className="text-center p-1 bg-muted/50 rounded">
              <div className="font-medium">
                {selectedFabricItem.pattern_repeat_vertical ? 
                  `${selectedFabricItem.pattern_repeat_vertical}cm` : 
                  'Plain'
                }
              </div>
              <div className="text-muted-foreground">Repeat</div>
            </div>
            <div className="text-center p-1 bg-muted/50 rounded">
              <div className="font-medium">{formatPrice(selectedFabricItem.price_per_meter || selectedFabricItem.unit_price || 0)}</div>
              <div className="text-muted-foreground">Per Meter</div>
            </div>
          </div>

          {fabricCalculation && (
            <div className="p-2 bg-primary/5 border border-primary/20 rounded text-xs">
              <div className="font-semibold text-primary mb-1">Calculated Requirements</div>
              
              {/* Main calculation results in compact grid */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex justify-between">
                  <span>Linear Metres:</span>
                  <span className="font-medium">{fabricCalculation.linearMeters.toFixed(2)}m</span>
                </div>
                <div className="flex justify-between">
                  <span>Widths Needed:</span>
                  <span className="font-medium">{fabricCalculation.widthsRequired}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price/Meter:</span>
                  <span className="font-medium">{formatPrice(fabricCalculation.pricePerMeter)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-primary">Total Cost:</span>
                  <span className="font-semibold text-primary">{formatPrice(fabricCalculation.totalCost)}</span>
                </div>
              </div>

              {/* Expandable calculation details */}
              <details className="group">
                <summary className="cursor-pointer text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                  <span className="text-xs">Show calculation breakdown</span>
                  <span className="transform transition-transform group-open:rotate-90">▶</span>
                </summary>
                <div className="mt-2 p-2 bg-background/50 rounded border text-xs space-y-1">
                  <div className="font-medium text-muted-foreground mb-1">How this was calculated:</div>
                  <div>• Fabric width: {selectedFabricItem.fabric_width || 137}cm</div>
                  <div>• Required fullness width determines widths needed</div>
                  <div>• Drop + hem allowances × number of widths</div>
                  <div>• Waste percentage applied for cutting efficiency</div>
                  <div className="text-muted-foreground italic mt-1">
                    Formula: (Drop + Hems) × Widths × Waste Factor
                  </div>
                </div>
              </details>
            </div>
          )}

          {selectedFabricItem.collection_name && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Palette className="h-3 w-3" />
              <span>Collection: {selectedFabricItem.collection_name}</span>
            </div>
          )}

          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={readOnly}>
              Details
            </Button>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={readOnly}>
              Sample
            </Button>
          </div>
        </div>
      )}

      {!selectedFabric && (
        <div className="p-3 border-2 border-dashed border-muted rounded text-center text-muted-foreground">
          <Shirt className="h-6 w-6 mx-auto mb-1 opacity-50" />
          <div className="text-xs">Select fabric to see calculations</div>
        </div>
      )}
    </div>
  );
};