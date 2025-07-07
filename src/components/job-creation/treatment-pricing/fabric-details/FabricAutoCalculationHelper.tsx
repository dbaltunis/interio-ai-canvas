import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, RotateCcw, Settings } from "lucide-react";
import { TreatmentFormData } from "../useTreatmentFormData";

interface FabricAutoCalculationHelperProps {
  formData: TreatmentFormData;
  onInputChange: (field: string, value: any) => void;
}

export const FabricAutoCalculationHelper = ({ formData, onInputChange }: FabricAutoCalculationHelperProps) => {
  const fabricWidth = parseFloat(formData.fabric_width) || 137;
  const isNarrowFabric = fabricWidth <= 200;
  const isPlainFabric = formData.fabric_type?.toLowerCase().includes('plain') || 
                        formData.fabric_type?.toLowerCase().includes('solid') ||
                        formData.fabric_type?.toLowerCase().includes('textured');
  
  // Auto-suggest roll direction based on fabric width and pattern
  const suggestedRollDirection = isNarrowFabric ? 'vertical' : 'horizontal';
  const canRotateForSavings = isPlainFabric && isNarrowFabric;
  
  // Calculate potential fabric savings if rotating plain narrow fabric
  const railWidth = parseFloat(formData.rail_width) || 0;
  const drop = parseFloat(formData.drop) || 0;
  const canBenefitFromRotation = canRotateForSavings && drop < fabricWidth && railWidth > fabricWidth;

  const handleAutoOptimize = () => {
    if (canBenefitFromRotation) {
      onInputChange("roll_direction", "horizontal");
    } else {
      onInputChange("roll_direction", suggestedRollDirection);
    }
  };

  return (
    <div className="space-y-3">
      {/* Fabric Classification */}
      <div className="flex items-center gap-2">
        <Badge variant={isNarrowFabric ? "secondary" : "outline"}>
          {isNarrowFabric ? "Narrow Fabric" : "Wide Fabric"} ({fabricWidth}cm)
        </Badge>
        <Badge variant={isPlainFabric ? "secondary" : "destructive"}>
          {isPlainFabric ? "Plain - No Matching" : "Patterned - Matching Required"}
        </Badge>
      </div>

      {/* Auto-optimization suggestions */}
      {canBenefitFromRotation && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-sm font-medium">💡 Fabric Savings Opportunity</p>
              <p className="text-xs">
                This plain narrow fabric can be rotated horizontally to save fabric. 
                Drop ({drop}cm) is less than fabric width ({fabricWidth}cm).
              </p>
              <Button size="sm" variant="outline" onClick={handleAutoOptimize}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Optimize Fabric Usage
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Pattern matching warning */}
      {!isPlainFabric && formData.roll_direction === 'horizontal' && (
        <Alert variant="destructive">
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <p className="text-xs">
              ⚠ Patterned fabrics typically require vertical roll direction for proper pattern matching.
              Horizontal orientation may cause pattern misalignment.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Roll direction recommendation */}
      {formData.roll_direction !== suggestedRollDirection && !canBenefitFromRotation && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <p className="text-xs">
                Recommended roll direction: <strong>{suggestedRollDirection}</strong> 
                {isNarrowFabric ? " (narrow fabric standard)" : " (wide fabric efficient)"}
              </p>
              <Button size="sm" variant="outline" onClick={handleAutoOptimize}>
                Use Recommended
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};