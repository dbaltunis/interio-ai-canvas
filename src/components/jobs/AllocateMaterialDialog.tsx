import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useAllocateMaterial } from "@/hooks/useProjectMaterialAllocations";

interface AllocateMaterialDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AllocateMaterialDialog({ projectId, open, onOpenChange }: AllocateMaterialDialogProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const { data: inventory } = useEnhancedInventory();
  const allocateMaterial = useAllocateMaterial();

  const selectedItem = inventory?.find((item) => item.id === selectedItemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId || !quantity) return;

    await allocateMaterial.mutateAsync({
      project_id: projectId,
      inventory_item_id: selectedItemId,
      allocated_quantity: parseFloat(quantity),
      status: "allocated",
    });

    // Reset form
    setSelectedItemId("");
    setQuantity("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Allocate Material to Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger id="material">
                <SelectValue placeholder="Select a material" />
              </SelectTrigger>
              <SelectContent>
                {inventory?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Stock: {item.quantity} {item.unit}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedItem && (
              <div className="text-sm text-muted-foreground">
                Available: {selectedItem.quantity} {selectedItem.unit}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Allocate</Label>
            <div className="flex gap-2">
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                max={selectedItem?.quantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="flex-1"
              />
              {selectedItem && (
                <div className="flex items-center px-3 bg-muted rounded-md text-sm text-muted-foreground">
                  {selectedItem.unit}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedItemId || !quantity || allocateMaterial.isPending}>
              {allocateMaterial.isPending ? "Allocating..." : "Allocate Material"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
