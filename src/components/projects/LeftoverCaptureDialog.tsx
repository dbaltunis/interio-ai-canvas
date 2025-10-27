import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Sparkles, AlertCircle } from "lucide-react";
import { LeftoverItem } from "@/hooks/useProjectLeftovers";
import { useCreateEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LeftoverCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leftovers: LeftoverItem[];
  projectId: string;
  projectName: string;
}

export const LeftoverCaptureDialog = ({
  open,
  onOpenChange,
  leftovers,
  projectId,
  projectName,
}: LeftoverCaptureDialogProps) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(leftovers.map(l => l.id))
  );
  const [locations, setLocations] = useState<Record<string, string>>({});
  const createItem = useCreateEnhancedInventoryItem();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleLocationChange = (id: string, location: string) => {
    setLocations(prev => ({ ...prev, [id]: location }));
  };

  const handleCreateRemnants = async () => {
    setIsCreating(true);
    try {
      const selectedLeftovers = leftovers.filter(l => selectedItems.has(l.id));
      
      for (const leftover of selectedLeftovers) {
        await createItem.mutateAsync({
          name: leftover.name,
          category: 'remnant',
          subcategory: leftover.category,
          description: `Leftover from ${projectName} - ${leftover.roomName || ''} ${leftover.surfaceName || ''}`.trim(),
          quantity: leftover.quantity,
          unit: leftover.unit,
          cost_price: leftover.proratedCost,
          selling_price: leftover.proratedCost * 1.2, // 20% markup on remnants
          location: locations[leftover.id] || 'Remnants Storage',
          active: true,
          // Store metadata for traceability
          sku: `REM-${projectId.slice(0, 8)}-${Date.now()}`,
        });
      }

      toast({
        title: "Remnants captured successfully",
        description: `Added ${selectedLeftovers.length} remnant${selectedLeftovers.length !== 1 ? 's' : ''} to inventory`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating remnants:', error);
      toast({
        title: "Failed to capture remnants",
        description: "Please try again or add them manually",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleMarkAsScrap = () => {
    toast({
      title: "Marked as scrap",
      description: "These materials will not be added to inventory",
    });
    onOpenChange(false);
  };

  const totalValue = leftovers
    .filter(l => selectedItems.has(l.id))
    .reduce((sum, l) => sum + l.proratedCost, 0);

  if (leftovers.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <DialogTitle>Capture Project Leftovers</DialogTitle>
          </div>
          <DialogDescription>
            We detected {leftovers.length} material{leftovers.length !== 1 ? 's' : ''} with significant leftovers from "{projectName}". 
            Select which ones to add to inventory as remnants.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <strong>Save money!</strong> These remnants have a total value of ${totalValue.toFixed(2)}. 
            Adding them to inventory makes them searchable for future projects.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {leftovers.map((leftover) => (
            <div
              key={leftover.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedItems.has(leftover.id)}
                  onCheckedChange={() => toggleItem(leftover.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{leftover.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {leftover.category}
                        </Badge>
                        {leftover.roomName && (
                          <span className="text-xs text-muted-foreground">
                            {leftover.roomName} {leftover.surfaceName && `• ${leftover.surfaceName}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        ${leftover.proratedCost.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {leftover.quantity.toFixed(2)}{leftover.unit}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Ordered:</span> {leftover.originalQuantity.toFixed(2)}{leftover.unit}
                    </div>
                    <div>
                      <span className="font-medium">Leftover:</span> {leftover.quantity.toFixed(2)}{leftover.unit}
                    </div>
                    <div>
                      <span className="font-medium">% Leftover:</span> {((leftover.quantity / leftover.originalQuantity) * 100).toFixed(1)}%
                    </div>
                  </div>

                  {selectedItems.has(leftover.id) && (
                    <div className="space-y-1">
                      <Label htmlFor={`location-${leftover.id}`} className="text-xs">
                        Storage Location (optional)
                      </Label>
                      <Input
                        id={`location-${leftover.id}`}
                        placeholder="e.g., Shelf A3, Bin 12, Workshop"
                        value={locations[leftover.id] || ''}
                        onChange={(e) => handleLocationChange(leftover.id, e.target.value)}
                        className="h-8"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedItems.size > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Remnants will be automatically marked with reduced prices (cost only, no markup) 
              and made searchable by original material name.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAsScrap}
            disabled={isCreating}
          >
            Mark as Scrap
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleCreateRemnants}
            disabled={selectedItems.size === 0 || isCreating}
          >
            {isCreating ? (
              <>Creating...</>
            ) : (
              <>Create {selectedItems.size} Remnant{selectedItems.size !== 1 ? 's' : ''}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
