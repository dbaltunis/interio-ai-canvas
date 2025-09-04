import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  sku?: string;
  uom: string;
  price?: number;
}

interface SelectedHardware extends InventoryItem {
  quantity: number;
}

interface HardwarePickerProps {
  inventoryItems: InventoryItem[];
  selectedHardware: SelectedHardware[];
  onHardwareChange: (hardware: SelectedHardware[]) => void;
}

export const HardwarePicker: React.FC<HardwarePickerProps> = ({
  inventoryItems,
  selectedHardware,
  onHardwareChange,
}) => {
  const hardwareByType = inventoryItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  const getSelectedQuantity = (itemId: string) => {
    return selectedHardware.find(h => h.id === itemId)?.quantity || 0;
  };

  const isSelected = (itemId: string) => {
    return selectedHardware.some(h => h.id === itemId);
  };

  const toggleHardware = (item: InventoryItem, checked: boolean) => {
    if (checked) {
      onHardwareChange([...selectedHardware, { ...item, quantity: 1 }]);
    } else {
      onHardwareChange(selectedHardware.filter(h => h.id !== item.id));
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      onHardwareChange(selectedHardware.filter(h => h.id !== itemId));
      return;
    }
    
    onHardwareChange(
      selectedHardware.map(h =>
        h.id === itemId ? { ...h, quantity } : h
      )
    );
  };

  return (
    <div className="space-y-6">
      {Object.entries(hardwareByType).map(([type, items]) => (
        <div key={type}>
          <h4 className="text-md font-medium mb-3 capitalize">{type}s</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const selectedQty = getSelectedQuantity(item.id);
              const itemSelected = isSelected(item.id);
              
              return (
                <Card key={item.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={itemSelected}
                          onCheckedChange={(checked) => toggleHardware(item, checked as boolean)}
                        />
                        <CardTitle className="text-base">{item.name}</CardTitle>
                      </div>
                      {selectedQty > 0 && (
                        <Badge variant="default">{selectedQty}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.sku && <Badge variant="outline">{item.sku}</Badge>}
                      <Badge variant="secondary">{item.uom}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription className="text-sm">
                      ${item.price || 0} per {item.uom}
                    </CardDescription>
                    
                    {itemSelected && (
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`qty-${item.id}`} className="text-sm">Qty:</Label>
                        <Input
                          id={`qty-${item.id}`}
                          type="number"
                          value={selectedQty}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="w-20 text-center"
                          min="1"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};