
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface TreatmentOptionsCardProps {
  treatmentTypesData: any[];
  treatmentTypesLoading: boolean;
  treatmentType: string;
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
}

export const TreatmentOptionsCard = ({ 
  treatmentTypesData, 
  treatmentTypesLoading, 
  treatmentType, 
  selectedOptions, 
  onOptionToggle 
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
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-700">
            No options configured for treatment type "{treatmentType}"
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            You can add options in Settings → Treatments → {treatmentType}
          </p>
        </CardContent>
      </Card>
    );
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
      </CardContent>
    </Card>
  );
};
