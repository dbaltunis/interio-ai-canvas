
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { TreatmentFormData } from "./useTreatmentFormData";
import { FabricBasicDetails } from "./fabric-details/FabricBasicDetails";
import { FabricOrientationSelector } from "./fabric-details/FabricOrientationSelector";
import { FabricUsageDisplay } from "./fabric-details/FabricUsageDisplay";
import { FabricCostComparison } from "./fabric-details/FabricCostComparison";
import { FabricGuidelines } from "./fabric-details/FabricGuidelines";

interface FabricDetailsCardProps {
  formData: TreatmentFormData;
  onInputChange: (field: string, value: any) => void;
  fabricUsage: string;
  costs?: {
    fabricOrientation?: string;
    costComparison?: any;
    warnings?: string[];
    seamsRequired?: number;
    seamLaborHours?: number;
    widthsRequired?: number;
  };
}

export const FabricDetailsCard = ({ formData, onInputChange, fabricUsage, costs }: FabricDetailsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fabric Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FabricBasicDetails formData={formData} onInputChange={onInputChange} />
        
        <FabricOrientationSelector formData={formData} onInputChange={onInputChange} />

        <FabricGuidelines />

        {/* Fabric Usage Display */}
        <FabricUsageDisplay 
          fabricUsage={fabricUsage} 
          formData={formData} 
          costs={costs} 
        />

        {/* Cost Comparison */}
        {costs?.costComparison && (
          <FabricCostComparison costComparison={costs.costComparison} />
        )}

        {/* Warnings */}
        {costs?.warnings && costs.warnings.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {costs.warnings.map((warning, index) => (
                  <div key={index} className="text-xs">{warning}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
