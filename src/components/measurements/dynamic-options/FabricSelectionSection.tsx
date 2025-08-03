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
}

export const FabricSelectionSection = ({
  selectedFabric,
  onFabricChange,
  readOnly = false
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="h-5 w-5" />
          Fabric Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Choose Fabric</Label>
          <Select 
            value={selectedFabric} 
            onValueChange={(value) => {
              console.log('Fabric selected:', value);
              console.log('Fabric data:', fabricItems.find(f => f.id === value));
              onFabricChange(value);
            }}
            disabled={readOnly}
          >
            <SelectTrigger className="bg-background">
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
                      <span className="font-medium">{fabric.name}</span>
                      <Badge variant="outline">
                        {formatPrice(fabric.price_per_meter || fabric.unit_price || 0)}/m
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {fabric.fabric_width && `Width: ${fabric.fabric_width}cm`}
                      {fabric.fabric_composition && ` • ${fabric.fabric_composition}`}
                      {fabric.color && ` • ${fabric.color}`}
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
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Fabric Width</div>
                  <div className="text-muted-foreground">
                    {selectedFabricItem.fabric_width ? `${selectedFabricItem.fabric_width}cm` : 'Not specified'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Pattern Repeat</div>
                  <div className="text-muted-foreground">
                    {selectedFabricItem.pattern_repeat_vertical ? 
                      `${selectedFabricItem.pattern_repeat_vertical}cm` : 
                      'Plain'
                    }
                  </div>
                </div>
                <div>
                  <div className="font-medium">Composition</div>
                  <div className="text-muted-foreground">
                    {selectedFabricItem.fabric_composition || 'Not specified'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Care</div>
                  <div className="text-muted-foreground">
                    {selectedFabricItem.fabric_care_instructions || 'Standard'}
                  </div>
                </div>
              </div>
            </div>

            {selectedFabricItem.collection_name && (
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Collection: {selectedFabricItem.collection_name}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={readOnly}>
                View Fabric Details
              </Button>
              <Button variant="outline" size="sm" disabled={readOnly}>
                Request Sample
              </Button>
            </div>
          </div>
        )}

        {!selectedFabric && (
          <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center text-muted-foreground">
            <Shirt className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Select a fabric to see details and calculate pricing</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};