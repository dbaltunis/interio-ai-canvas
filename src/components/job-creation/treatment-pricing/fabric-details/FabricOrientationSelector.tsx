
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
  const recommendedOrientation = isNarrowFabric ? "vertical" : "horizontal";
  const isAutoSelected = formData.roll_direction === recommendedOrientation;
  const previousWidthRef = useRef<number | null>(null); // Start as null to trigger on first valid fabric

  // Auto-select orientation when fabric width changes OR on initial load with fabric selected
  useEffect(() => {
    // Only auto-select if fabric width is valid (not default 137)
    const hasValidFabricWidth = formData.fabric_width && parseFloat(formData.fabric_width) !== 137;
    const isFirstLoad = previousWidthRef.current === null;
    const widthChanged = previousWidthRef.current !== fabricWidthCm;
    
    if (hasValidFabricWidth && (isFirstLoad || widthChanged)) {
      const correctOrientation = fabricWidthCm > FABRIC_WIDTH_THRESHOLD_CM ? "horizontal" : "vertical";
      
      // Auto-apply the correct orientation
      if (formData.roll_direction !== correctOrientation) {
        console.log(`🔄 Auto-selecting orientation: ${correctOrientation} for fabric width ${fabricWidthCm}cm (>200cm = horizontal, ≤200cm = vertical)`);
        onInputChange("roll_direction", correctOrientation);
      }
      
      previousWidthRef.current = fabricWidthCm;
    }
  }, [fabricWidthCm, formData.fabric_width, formData.roll_direction, onInputChange]);

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
