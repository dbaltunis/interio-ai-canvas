import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScanLine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMeasurementWizardStore } from '@/stores/measurementWizardStore';
import { HardwarePicker } from '@/components/measurement-wizard/components/HardwarePicker';
import { QRCodeScanner } from '@/components/inventory/QRCodeScanner';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  sku?: string;
  uom: string;
  price?: number;
}

export const HardwareStep: React.FC = () => {
  const { selectedHardware, setHardware } = useMeasurementWizardStore();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const { toast } = useToast();

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

  const handleQRScan = async (itemId: string) => {
    try {
      // Look up the item in our loaded list
      const scannedItem = inventoryItems.find(item => item.id === itemId);
      
      if (scannedItem) {
        // Add to hardware or update quantity if already selected
        const existingIndex = selectedHardware.findIndex(h => h.id === itemId);
        
        if (existingIndex >= 0) {
          // Item already selected, increment quantity
          const updated = [...selectedHardware];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1
          };
          setHardware(updated);
          toast({
            title: "Quantity Updated",
            description: `${scannedItem.name} quantity increased to ${updated[existingIndex].quantity}.`,
          });
        } else {
          // Add new item with quantity 1
          setHardware([...selectedHardware, { ...scannedItem, quantity: 1 }]);
          toast({
            title: "Hardware Added",
            description: `${scannedItem.name} has been added.`,
          });
        }
      } else {
        toast({
          title: "Item Not Found",
          description: "This item is not available for hardware selection.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error handling QR scan:', error);
      toast({
        title: "Error",
        description: "Failed to process scanned item.",
        variant: "destructive",
      });
    }
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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Hardware Items</h3>
          <Button
            variant="outline"
            size="default"
            onClick={() => setScannerOpen(true)}
          >
            <ScanLine className="h-4 w-4 mr-2" />
            Scan QR
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Choose tracks, poles, brackets and other hardware needed for this installation.
        </p>
      </div>

      <HardwarePicker
        inventoryItems={inventoryItems}
        selectedHardware={selectedHardware}
        onHardwareChange={setHardware}
      />

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

      <QRCodeScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleQRScan}
      />
    </div>
  );
};