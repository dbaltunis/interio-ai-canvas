
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { TreatmentFormData } from "../useTreatmentFormData";

interface FabricBasicDetailsProps {
  formData: TreatmentFormData;
  onInputChange: (field: string, value: any) => void;
}

export const FabricBasicDetails = ({ formData, onInputChange }: FabricBasicDetailsProps) => {
  const { units, getLengthUnitLabel, getFabricUnitLabel } = useMeasurementUnits();

  return (
    <div className="space-y-4">
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
          <Label htmlFor="fabric_code">Fabric Code</Label>
          <Input
            id="fabric_code"
            value={formData.fabric_code}
            onChange={(e) => onInputChange("fabric_code", e.target.value)}
            placeholder="Fabric reference code"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fabric_width">Fabric Width ({getLengthUnitLabel()})</Label>
          <Input
            id="fabric_width"
            type="number"
            step="0.5"
            value={formData.fabric_width}
            onChange={(e) => onInputChange("fabric_width", e.target.value)}
            placeholder="137"
          />
          <div className="text-xs text-muted-foreground">
            {parseFloat(formData.fabric_width) || 137}cm = {Math.round((parseFloat(formData.fabric_width) || 137) / 2.54)}" 
            {(parseFloat(formData.fabric_width) || 137) <= 200 ? " (Narrow fabric)" : " (Wide fabric)"}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fabric_cost_per_yard">Cost per {getFabricUnitLabel()} ({units.currency})</Label>
        <Input
          id="fabric_cost_per_yard"
          type="number"
          step="0.01"
          value={formData.fabric_cost_per_yard}
          onChange={(e) => onInputChange("fabric_cost_per_yard", e.target.value)}
          placeholder="0.00"
        />
      </div>
    </div>
  );
};
