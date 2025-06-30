
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TreatmentFormFieldsProps {
  formData: any;
  treatmentType: string;
  onInputChange: (field: string, value: any) => void;
}

export const TreatmentFormFields = ({ 
  formData, 
  treatmentType, 
  onInputChange 
}: TreatmentFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {/* Product Name */}
      <div className="space-y-2">
        <Label htmlFor="product_name">Product Name *</Label>
        <Input
          id="product_name"
          value={formData.product_name}
          onChange={(e) => onInputChange("product_name", e.target.value)}
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
            onChange={(e) => onInputChange("material_cost", parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="labor_cost">Labor Cost ($)</Label>
          <Input
            id="labor_cost"
            type="number"
            step="0.01"
            value={formData.labor_cost}
            onChange={(e) => onInputChange("labor_cost", parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => onInputChange("quantity", parseInt(e.target.value) || 1)}
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
              onChange={(e) => onInputChange("fabric_type", e.target.value)}
              placeholder="e.g., Cotton, Linen, Silk"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => onInputChange("color", e.target.value)}
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
            onChange={(e) => onInputChange("pattern", e.target.value)}
            placeholder="e.g., Solid, Striped, Floral"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hardware">Hardware</Label>
          <Input
            id="hardware"
            value={formData.hardware}
            onChange={(e) => onInputChange("hardware", e.target.value)}
            placeholder="e.g., Rods, Brackets, Tracks"
          />
        </div>
      </div>

      {/* Mounting Type */}
      <div className="space-y-2">
        <Label htmlFor="mounting_type">Mounting Type</Label>
        <Select value={formData.mounting_type} onValueChange={(value) => onInputChange("mounting_type", value)}>
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
          onChange={(e) => onInputChange("notes", e.target.value)}
          rows={3}
          placeholder="Special instructions or notes..."
        />
      </div>
    </div>
  );
};
