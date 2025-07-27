import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateEnhancedInventoryItem, useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { PricingGridEditor } from "./PricingGridEditor";
import { Edit, Trash2 } from "lucide-react";

interface EditInventoryDialogProps {
  item: any;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const EditInventoryDialog = ({ item, trigger, onSuccess }: EditInventoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: item.name || "",
    description: item.description || "",
    category: item.category || "",
    sku: item.sku || "",
    quantity: item.quantity || 0,
    unit_price: item.unit_price || 0,
    unit: item.unit || "units",
    reorder_point: item.reorder_point || 0,
    reorder_quantity: item.reorder_quantity || 0,
    supplier: item.supplier || "",
    location: item.location || "",
    fabric_width: item.fabric_width || null,
    pattern_repeat_vertical: item.pattern_repeat_vertical || null,
    pricing_grid: item.pricing_grid || null,
  });

  const updateMutation = useUpdateEnhancedInventoryItem();
  const deleteMutation = useDeleteEnhancedInventoryItem();

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        category: item.category || "",
        sku: item.sku || "",
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        unit: item.unit || "units",
        reorder_point: item.reorder_point || 0,
        reorder_quantity: item.reorder_quantity || 0,
        supplier: item.supplier || "",
        location: item.location || "",
        fabric_width: item.fabric_width || null,
        pattern_repeat_vertical: item.pattern_repeat_vertical || null,
        pricing_grid: item.pricing_grid || null,
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        ...formData,
      });
      
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(item.id);
        setOpen(false);
        onSuccess?.();
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const isFabric = formData.category === "fabric" || formData.category === "curtain_fabric" || formData.category === "blind_fabric";
  const isHardware = ["track", "rod", "bracket", "motor", "accessory"].includes(formData.category);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
          <DialogDescription>
            Update the details for {item.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fabric">Fabric</SelectItem>
                  <SelectItem value="curtain_fabric">Curtain Fabric</SelectItem>
                  <SelectItem value="blind_fabric">Blind Fabric</SelectItem>
                  <SelectItem value="track">Track</SelectItem>
                  <SelectItem value="rod">Rod</SelectItem>
                  <SelectItem value="bracket">Bracket</SelectItem>
                  <SelectItem value="motor">Motor</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meters">Meters</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                  <SelectItem value="sets">Sets</SelectItem>
                  <SelectItem value="pairs">Pairs</SelectItem>
                  <SelectItem value="rolls">Rolls</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="unit_price">Unit Price ($)</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input
                id="reorder_point"
                type="number"
                value={formData.reorder_point}
                onChange={(e) => setFormData(prev => ({ ...prev, reorder_point: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="reorder_quantity">Reorder Quantity</Label>
              <Input
                id="reorder_quantity"
                type="number"
                value={formData.reorder_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, reorder_quantity: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Fabric-specific fields */}
          {isFabric && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fabric_width">Fabric Width (cm)</Label>
                <Input
                  id="fabric_width"
                  type="number"
                  value={formData.fabric_width || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    fabric_width: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="pattern_repeat">Pattern Repeat (cm)</Label>
                <Input
                  id="pattern_repeat"
                  type="number"
                  value={formData.pattern_repeat_vertical || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    pattern_repeat_vertical: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                />
              </div>
            </div>
          )}

          {/* Pricing Grid for hardware and blinds */}
          {(isHardware || formData.category === "blind_fabric") && (
            <div>
              <Label>Pricing Grid</Label>
              <PricingGridEditor
                itemType={formData.category}
                onGridChange={(grid) => setFormData(prev => ({ ...prev, pricing_grid: grid }))}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Item
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Item"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};