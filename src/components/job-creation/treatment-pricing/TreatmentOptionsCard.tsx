
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface TreatmentOptionsCardProps {
  treatmentTypesData: any[];
  treatmentTypesLoading: boolean;
  treatmentType: string;
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  complexityMultiplier?: string;
  onComplexityChange?: (value: string) => void;
}

export const TreatmentOptionsCard = ({ 
  treatmentTypesData, 
  treatmentTypesLoading, 
  treatmentType, 
  selectedOptions, 
  onOptionToggle,
  complexityMultiplier = "standard",
  onComplexityChange
}: TreatmentOptionsCardProps) => {
  const { units } = useMeasurementUnits();

  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return `${currencySymbols[units.currency] || units.currency}${amount.toFixed(2)}`;
  };

  const currentTreatmentType = treatmentTypesData?.find(tt => tt.name === treatmentType);
  const treatmentOptions = currentTreatmentType?.specifications?.options || [];

  console.log('TreatmentOptionsCard - Current Treatment Type:', currentTreatmentType);
  console.log('TreatmentOptionsCard - Treatment Options:', treatmentOptions);

  if (treatmentTypesLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4">Loading treatment options...</div>
        </CardContent>
      </Card>
    );
  }

  if (treatmentOptions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treatment Options</CardTitle>
        <p className="text-sm text-gray-600">Available options for {treatmentType}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {treatmentOptions.map((option: any, index: number) => {
          const optionId = option.id || option.name || `option-${index}`;
          const isSelected = selectedOptions.includes(optionId);
          
          return (
            <div key={optionId} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onOptionToggle(optionId)}
                />
                <div>
                  <div className="font-medium">{option.name}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600">{option.description}</div>
                  )}
                </div>
              </div>
              <Badge variant="outline">
                {formatCurrency(option.cost || 0)}
              </Badge>
            </div>
          );
        })}

        {/* Complexity Multiplier Section */}
        <div className="border-t pt-4 mt-6">
          <div className="space-y-3">
            <Label htmlFor="complexityMultiplier">Job Complexity</Label>
            <Select value={complexityMultiplier} onValueChange={onComplexityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  <div className="space-y-1">
                    <div className="font-medium">Standard (1.0x)</div>
                    <div className="text-xs text-muted-foreground">Basic installation, standard access</div>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="space-y-1">
                    <div className="font-medium">Medium Complexity (1.2x)</div>
                    <div className="text-xs text-muted-foreground">Bay windows, pattern matching, unusual shapes</div>
                  </div>
                </SelectItem>
                <SelectItem value="complex">
                  <div className="space-y-1">
                    <div className="font-medium">Complex (1.5x)</div>
                    <div className="text-xs text-muted-foreground">Difficult access, intricate details, multiple layers</div>
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="space-y-1">
                    <div className="font-medium">Custom Rate</div>
                    <div className="text-xs text-muted-foreground">Set your own multiplier</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="text-xs space-y-1">
                  <p><strong>How complexity affects pricing:</strong></p>
                  <p>• Standard: Base cost × 1.0 (no change)</p>
                  <p>• Medium: Base cost × 1.2 (+20%)</p>
                  <p>• Complex: Base cost × 1.5 (+50%)</p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
