
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TreatmentPricingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatmentData: any) => void;
  treatmentType: string;
  surfaceType: string;
}

export const TreatmentPricingForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  treatmentType, 
  surfaceType 
}: TreatmentPricingFormProps) => {
  const [formData, setFormData] = useState({
    product_name: "",
    material_cost: 0,
    labor_cost: 0,
    quantity: 1,
    fabric_type: "",
    color: "",
    pattern: "",
    hardware: "",
    mounting_type: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalPrice = (formData.material_cost + formData.labor_cost) * formData.quantity;
    
    const treatmentData = {
      ...formData,
      treatment_type: treatmentType,
      total_price: totalPrice,
      unit_price: formData.material_cost + formData.labor_cost,
      status: "planned"
    };

    onSave(treatmentData);
    onClose();
    
    // Reset form
    setFormData({
      product_name: "",
      material_cost: 0,
      labor_cost: 0,
      quantity: 1,
      fabric_type: "",
      color: "",
      pattern: "",
      hardware: "",
      mounting_type: "",
      notes: ""
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalPrice = (formData.material_cost + formData.labor_cost) * formData.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add {treatmentType} to {surfaceType === 'wall' ? 'Wall' : 'Window'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => handleInputChange("product_name", e.target.value)}
              placeholder={`Enter ${treatmentType.toLowerCase()} product name`}
              required
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="material_cost">Material Cost ($)</Label>
              <Input
                id="material_cost"
                type="number"
                step="0.01"
                value={formData.material_cost}
                onChange={(e) => handleInputChange("material_cost", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labor_cost">Labor Cost ($)</Label>
              <Input
                id="labor_cost"
                type="number"
                step="0.01"
                value={formData.labor_cost}
                onChange={(e) => handleInputChange("labor_cost", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Product Details */}
          {(treatmentType === "Curtains" || treatmentType === "Wall Covering") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fabric_type">Fabric Type</Label>
                <Input
                  id="fabric_type"
                  value={formData.fabric_type}
                  onChange={(e) => handleInputChange("fabric_type", e.target.value)}
                  placeholder="e.g., Cotton, Linen, Silk"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern</Label>
              <Input
                id="pattern"
                value={formData.pattern}
                onChange={(e) => handleInputChange("pattern", e.target.value)}
                placeholder="e.g., Solid, Striped, Floral"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hardware">Hardware</Label>
              <Input
                id="hardware"
                value={formData.hardware}
                onChange={(e) => handleInputChange("hardware", e.target.value)}
                placeholder="e.g., Rods, Brackets, Tracks"
              />
            </div>
          </div>

          {/* Mounting Type */}
          <div className="space-y-2">
            <Label htmlFor="mounting_type">Mounting Type</Label>
            <Select value={formData.mounting_type} onValueChange={(value) => handleInputChange("mounting_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select mounting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inside_mount">Inside Mount</SelectItem>
                <SelectItem value="outside_mount">Outside Mount</SelectItem>
                <SelectItem value="ceiling_mount">Ceiling Mount</SelectItem>
                <SelectItem value="wall_mount">Wall Mount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              placeholder="Special instructions or notes..."
            />
          </div>

          {/* Total Price Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Price:</span>
              <span className="text-2xl font-bold text-green-600">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              (${(formData.material_cost + formData.labor_cost).toFixed(2)} × {formData.quantity} {formData.quantity === 1 ? 'unit' : 'units'})
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Treatment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
