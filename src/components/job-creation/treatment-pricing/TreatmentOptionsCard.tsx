
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
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Treatment Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-yellow-700">
            No options configured for treatment type "{treatmentType}"
          </p>
          <p className="text-xs text-yellow-600">
            You can add options in <strong>Settings → Treatments → {treatmentType}</strong>
          </p>
          <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>Treatment Types Found: {treatmentTypesData?.length || 0}</p>
            <p>Current Treatment Type: {currentTreatmentType ? 'Found' : 'Not Found'}</p>
            <p>Available Treatment Types: {treatmentTypesData?.map(tt => tt.name).join(', ') || 'None'}</p>
          </div>
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
