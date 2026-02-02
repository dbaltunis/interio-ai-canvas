import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RotateCw, ChevronDown, Scissors } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { TreatmentFormData } from "../useTreatmentFormData";
import { FabricCuttingDiagram } from "@/components/fabric-visualization";

interface FabricUsageDisplayProps {
  fabricUsage: string;
  formData: TreatmentFormData;
  costs?: {
    fabricOrientation?: string;
    seamsRequired?: number;
    seamLaborHours?: number;
    widthsRequired?: number;
    dropPerWidth?: number;        // drop length per width in cm
    fabricWidthCm?: number;       // fabric width in cm
    totalLinearMeters?: number;   // total linear meters
    leftoverCm?: number;          // leftover fabric
    panelConfiguration?: 'single' | 'pair';
    patternRepeat?: number;       // pattern repeat in cm
  };
}

export const FabricUsageDisplay = ({ fabricUsage, formData, costs }: FabricUsageDisplayProps) => {
  const { units, getLengthUnitLabel, getFabricUnitLabel } = useMeasurementUnits();
  const [showDiagram, setShowDiagram] = useState(false);

  if (fabricUsage === "0.0") return null;

  // Determine if we can show the cutting diagram
  const canShowDiagram = costs?.widthsRequired && costs.widthsRequired > 0 && costs?.dropPerWidth;

  return (
    <div className="bg-blue-50 p-4 rounded-lg space-y-3">
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
        Based on {formData.fabric_width}{getLengthUnitLabel()} fabric width, {formData.roll_direction} roll direction{formData.heading_fullness && parseFloat(formData.heading_fullness) > 1 ? `, ${formData.heading_fullness}x fullness` : ''}
      </div>
      
      {/* Seam Information */}
      {costs?.seamsRequired && costs.seamsRequired > 0 && (
        <div className="p-2 bg-blue-100 rounded">
          <div className="text-xs text-blue-700">
            <strong>Seaming required:</strong> {costs.seamsRequired} seam(s), {costs.widthsRequired} fabric width(s)
          </div>
          <div className="text-xs text-blue-600">
            Additional {costs.seamLaborHours?.toFixed(1)}h labor for seaming
          </div>
        </div>
      )}

      {/* Cutting Diagram Toggle */}
      {canShowDiagram && (
        <Collapsible open={showDiagram} onOpenChange={setShowDiagram}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between text-blue-700 hover:text-blue-800 hover:bg-blue-100 h-8"
            >
              <span className="flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5" />
                {showDiagram ? 'Hide' : 'View'} Cutting Diagram
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDiagram ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <FabricCuttingDiagram
              fabricWidth={costs.fabricWidthCm ?? parseFloat(formData.fabric_width) ?? 140}
              dropLength={costs.dropPerWidth || 274}
              widthsRequired={costs.widthsRequired || 1}
              seamsRequired={costs.seamsRequired || 0}
              orientation={costs.fabricOrientation === 'horizontal' ? 'horizontal' : 'vertical'}
              panelConfiguration={costs.panelConfiguration || 'pair'}
              seamAllowance={3}
              patternRepeat={costs.patternRepeat}
              totalLinearMeters={costs.totalLinearMeters}
              leftoverCm={costs.leftoverCm}
              unitLabel={getLengthUnitLabel()}
            />
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
