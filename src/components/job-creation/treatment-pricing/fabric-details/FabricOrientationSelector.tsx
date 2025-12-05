
import { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { TreatmentFormData } from "../useTreatmentFormData";

interface FabricOrientationSelectorProps {
  formData: TreatmentFormData;
  onInputChange: (field: string, value: any) => void;
}

// Threshold: 200cm = ~78.74 inches
const FABRIC_WIDTH_THRESHOLD_CM = 200;

export const FabricOrientationSelector = ({ formData, onInputChange }: FabricOrientationSelectorProps) => {
  const fabricWidthCm = parseFloat(formData.fabric_width) || 137;
  const isNarrowFabric = fabricWidthCm <= FABRIC_WIDTH_THRESHOLD_CM;
  const autoSelectedOrientation = isNarrowFabric ? "vertical" : "horizontal";
  const isAutoSelected = formData.roll_direction === autoSelectedOrientation;
  const previousWidthRef = useRef<number>(fabricWidthCm);

  // Auto-select orientation when fabric width changes (e.g., when fabric is selected)
  useEffect(() => {
    const widthChanged = previousWidthRef.current !== fabricWidthCm;
    
    if (widthChanged && fabricWidthCm > 0) {
      const recommendedOrientation = fabricWidthCm > FABRIC_WIDTH_THRESHOLD_CM ? "horizontal" : "vertical";
      
      // Auto-apply the recommended orientation
      if (formData.roll_direction !== recommendedOrientation) {
        console.log(`🔄 Auto-selecting orientation: ${recommendedOrientation} for fabric width ${fabricWidthCm}cm`);
        onInputChange("roll_direction", recommendedOrientation);
      }
      
      previousWidthRef.current = fabricWidthCm;
    }
  }, [fabricWidthCm, formData.roll_direction, onInputChange]);

  // Dynamic labeling based on recommendation
  const horizontalLabel = isNarrowFabric ? "Horizontal (Rotated)" : "Horizontal (Standard)";
  const verticalLabel = isNarrowFabric ? "Vertical (Standard)" : "Vertical (Rotated)";

  return (
    <div className="space-y-2">
      <Label htmlFor="roll_direction">Roll Direction</Label>
      <Select value={formData.roll_direction} onValueChange={(value) => onInputChange("roll_direction", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select roll direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="horizontal">
            <div className="flex items-center gap-2">
              {horizontalLabel}
              {!isNarrowFabric && <Badge variant="secondary" className="text-xs">Recommended</Badge>}
            </div>
          </SelectItem>
          <SelectItem value="vertical">
            <div className="flex items-center gap-2">
              {verticalLabel}
              {isNarrowFabric && <Badge variant="secondary" className="text-xs">Recommended</Badge>}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      {isAutoSelected && (
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <Info className="w-3 h-3" />
          Auto-selected for {fabricWidthCm <= 200 ? "narrow" : "wide"} fabric
        </div>
      )}
    </div>
  );
};
