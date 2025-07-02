
import { Badge } from "@/components/ui/badge";
import { RotateCw } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { TreatmentFormData } from "../useTreatmentFormData";

interface FabricUsageDisplayProps {
  fabricUsage: string;
  formData: TreatmentFormData;
  costs?: {
    fabricOrientation?: string;
    seamsRequired?: number;
    seamLaborHours?: number;
    widthsRequired?: number;
  };
}

export const FabricUsageDisplay = ({ fabricUsage, formData, costs }: FabricUsageDisplayProps) => {
  const { units, getLengthUnitLabel, getFabricUnitLabel } = useMeasurementUnits();

  if (fabricUsage === "0.0") return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-blue-800">
          Estimated fabric usage: {fabricUsage} {getFabricUnitLabel()}
        </div>
        {costs?.fabricOrientation && (
          <Badge variant={costs.fabricOrientation === 'vertical' ? 'default' : 'secondary'}>
            <RotateCw className="w-3 h-3 mr-1" />
            {costs.fabricOrientation}
          </Badge>
        )}
      </div>
      <div className="text-xs text-blue-600">
        Based on {formData.fabric_width}{getLengthUnitLabel()} fabric width, {formData.roll_direction} roll direction, {formData.heading_fullness}x fullness
      </div>
      
      {/* Seam Information */}
      {costs?.seamsRequired && costs.seamsRequired > 0 && (
        <div className="mt-2 p-2 bg-blue-100 rounded">
          <div className="text-xs text-blue-700">
            <strong>Seaming required:</strong> {costs.seamsRequired} seam(s), {costs.widthsRequired} fabric width(s)
          </div>
          <div className="text-xs text-blue-600">
            Additional {costs.seamLaborHours?.toFixed(1)}h labor for seaming
          </div>
        </div>
      )}
    </div>
  );
};
