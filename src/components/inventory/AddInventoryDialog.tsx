import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Wrench, Scissors, Package } from "lucide-react";
import { useCreateInventoryItem } from "@/hooks/useInventory";

interface AddInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FABRIC_CATEGORIES = [
  "Curtain Fabrics",
  "Blind Fabrics", 
  "Sheer Fabrics",
  "Blackout Fabrics",
  "Lining Fabrics",
  "Upholstery Fabrics"
];

const HARDWARE_CATEGORIES = [
  "Curtain Tracks",
  "Curtain Rods", 
  "Blind Mechanisms",
  "Brackets & Fittings",
  "Motors & Automation",
  "Installation Hardware"
];

const ACCESSORY_CATEGORIES = [
  "Curtain Hooks",
  "Tiebacks & Holdbacks",
  "Trims & Braids",
  "Tassels & Fringes",
  "Curtain Weights",
  "Cleaning & Care"
];

const FABRIC_UNITS = ["metres", "yards", "rolls", "pieces"];
const HARDWARE_UNITS = ["pieces", "sets", "metres", "feet", "boxes"];

export const AddInventoryDialog = ({ open, onOpenChange }: AddInventoryDialogProps) => {
  const [itemType, setItemType] = useState<"fabrics" | "hardware" | "accessories">("fabrics");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    category: "",
    quantity: 0,
    unit: "",
    cost_price: 0,
    selling_price: 0,
    supplier: "",
    location: "",
    reorder_point: 0,
    width: 0
  });

  const createInventoryItem = useCreateInventoryItem();

  const getCurrentCategories = () => {
    switch (itemType) {
      case "fabrics": return FABRIC_CATEGORIES;
      case "hardware": return HARDWARE_CATEGORIES;
      case "accessories": return ACCESSORY_CATEGORIES;
      default: return FABRIC_CATEGORIES;
    }
  };

  const getCurrentUnits = () => {
    switch (itemType) {
      case "fabrics": return FABRIC_UNITS;
      case "hardware": return HARDWARE_UNITS;
      case "accessories": return HARDWARE_UNITS;
      default: return FABRIC_UNITS;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createInventoryItem.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        sku: formData.sku || undefined,
        category: formData.category || undefined,
        quantity: formData.quantity,
        unit: formData.unit || undefined,
        unit_price: formData.selling_price || formData.cost_price || undefined,
        supplier: formData.supplier || undefined,
        location: formData.location || undefined,
        min_stock_level: formData.reorder_point || undefined
      });
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        sku: "",
        category: "",
        quantity: 0,
        unit: "",
        cost_price: 0,
        selling_price: 0,
        supplier: "",
        location: "",
        reorder_point: 0,
        width: 0
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create inventory item:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fabrics": return Palette;
      case "hardware": return Wrench;
      case "accessories": return Scissors;
      default: return Package;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add New Inventory Item
          </DialogTitle>
          <DialogDescription>
            Add fabrics, hardware, or accessories to your inventory system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Type Selection */}
          <Tabs value={itemType} onValueChange={(value) => setItemType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fabrics" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Fabrics
              </TabsTrigger>
              <TabsTrigger value="hardware" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Hardware
              </TabsTrigger>
              <TabsTrigger value="accessories" className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Accessories
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Premium Velvet Curtain Fabric"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., VEL-001-RED"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the item..."
              rows={3}
            />
          </div>

          {/* Category and Units */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {getCurrentCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit of Measure *</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {getCurrentUnits().map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantity and Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Current Stock *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price</Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>

          {/* Supplier and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Warehouse A-1"
              />
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input
                id="reorder_point"
                type="number"
                value={formData.reorder_point}
                onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) || 0 })}
                min="0"
                placeholder="Minimum stock level"
              />
            </div>

            {itemType === "fabrics" && (
              <div className="space-y-2">
                <Label htmlFor="width">Fabric Width (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="e.g., 140"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createInventoryItem.isPending}>
              {createInventoryItem.isPending ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};