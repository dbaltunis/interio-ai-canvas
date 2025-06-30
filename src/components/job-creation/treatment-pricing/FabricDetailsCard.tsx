
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { TreatmentFormData } from "./useTreatmentFormData";

interface FabricDetailsCardProps {
  formData: TreatmentFormData;
  onInputChange: (field: string, value: any) => void;
  fabricUsage: string;
}

export const FabricDetailsCard = ({ formData, onInputChange, fabricUsage }: FabricDetailsCardProps) => {
  const { units, getLengthUnitLabel, getFabricUnitLabel } = useMeasurementUnits();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fabric Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="roll_direction">Roll Direction</Label>
            <Select value={formData.roll_direction} onValueChange={(value) => onInputChange("roll_direction", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select roll direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
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
        {fabricUsage !== "0.00" && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-800">
              Estimated fabric usage: {fabricUsage} {getFabricUnitLabel()}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Based on {formData.fabric_width}{getLengthUnitLabel()} fabric width, {formData.roll_direction} roll direction, {formData.heading_fullness}x fullness
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
