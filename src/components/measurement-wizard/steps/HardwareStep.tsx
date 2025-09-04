import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMeasurementWizardStore } from '@/stores/measurementWizardStore';

export const HardwareStep: React.FC = () => {
  const { selectedHardware, setHardware } = useMeasurementWizardStore();
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHardware = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const orgId = session?.user?.user_metadata?.org_id;
        
        if (!orgId) return;

        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('org_id', orgId)
          .in('type', ['track', 'pole', 'bracket', 'hook', 'other'])
          .eq('is_active', true);

        if (error) throw error;
        if (data) setInventoryItems(data);
      } catch (error) {
        console.error('Error fetching hardware:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHardware();
  }, []);

  const addHardware = (item: any) => {
    const existing = selectedHardware.find(h => h.id === item.id);
    if (existing) {
      setHardware(
        selectedHardware.map(h =>
          h.id === item.id ? { ...h, quantity: h.quantity + 1 } : h
        )
      );
    } else {
      setHardware([...selectedHardware, { ...item, quantity: 1 }]);
    }
  };

  const removeHardware = (itemId: string) => {
    const existing = selectedHardware.find(h => h.id === itemId);
    if (existing && existing.quantity > 1) {
      setHardware(
        selectedHardware.map(h =>
          h.id === itemId ? { ...h, quantity: h.quantity - 1 } : h
        )
      );
    } else {
      setHardware(selectedHardware.filter(h => h.id !== itemId));
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeHardware(itemId);
      return;
    }
    
    setHardware(
      selectedHardware.map(h =>
        h.id === itemId ? { ...h, quantity } : h
      )
    );
  };

  const getSelectedQuantity = (itemId: string) => {
    return selectedHardware.find(h => h.id === itemId)?.quantity || 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const hardwareByType = inventoryItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Hardware Items</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Choose tracks, poles, brackets and other hardware needed for this installation.
        </p>
      </div>

      {Object.entries(hardwareByType).map(([type, items]) => (
        <div key={type}>
          <h4 className="text-md font-medium mb-3 capitalize">{type}s</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const selectedQty = getSelectedQuantity(item.id);
              return (
                <Card key={item.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{item.name}</CardTitle>
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
                    
                    {selectedQty > 0 ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeHardware(item.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={selectedQty}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="w-20 text-center"
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addHardware(item)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addHardware(item)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {selectedHardware.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium mb-3">Selected Hardware</h4>
          <div className="space-y-2">
            {selectedHardware.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {item.quantity} {item.uom}
                  </span>
                </div>
                <div className="text-sm font-medium">
                  ${((item.price || 0) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};