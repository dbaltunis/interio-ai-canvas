
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

  if (treatmentTypesLoading || treatmentOptions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treatment Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {treatmentOptions.map((option: any, index: number) => (
          <div key={option.id || option.name || index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={selectedOptions.includes(option.id || option.name)}
                onCheckedChange={() => onOptionToggle(option.id || option.name)}
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
        ))}
      </CardContent>
    </Card>
  );
};
