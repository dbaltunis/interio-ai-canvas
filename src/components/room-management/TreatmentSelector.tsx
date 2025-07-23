
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface TreatmentSelectorProps {
  surface: any;
  room: any;
  onTreatmentSelect: (treatmentType: string, windowCovering?: any) => void;
}

export const TreatmentSelector = ({
  surface,
  room,
  onTreatmentSelect
}: TreatmentSelectorProps) => {
  const [selectedTreatment, setSelectedTreatment] = useState<string>("");
  const { data: windowCoverings = [] } = useWindowCoverings();
  const { units, formatLength } = useMeasurementUnits();

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

  const treatmentCategories = [
    {
      category: "Soft Treatments",
      treatments: windowCoverings.filter(w => w.category === "fabric"),
      color: "bg-blue-50 border-blue-200"
    },
    {
      category: "Hard Treatments", 
      treatments: windowCoverings.filter(w => w.category === "hard"),
      color: "bg-gray-50 border-gray-200"
    }
  ];

  const handleSelect = (treatmentType: string, windowCovering?: any) => {
    onTreatmentSelect(treatmentType, windowCovering);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Select Treatment for {surface.name}</h3>
        <p className="text-sm text-muted-foreground">
          Window Size: {formatLength(surface.width || 60)} × {formatLength(surface.height || 48)} in {room.name}
        </p>
      </div>

      <div className="grid gap-6">
        {treatmentCategories.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="text-base">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {category.treatments.map((treatment) => (
                  <Card
                    key={treatment.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTreatment === treatment.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : category.color
                    }`}
                    onClick={() => setSelectedTreatment(treatment.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="font-medium text-sm mb-1">{treatment.name}</div>
                      <Badge variant="secondary" className="text-xs">
                        {treatment.category}
                      </Badge>
                      {treatment.base_price && (
                        <div className="text-xs text-muted-foreground mt-1">
                          From {formatCurrency(treatment.base_price)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-3 pt-4">
        <Button variant="outline">
          Cancel
        </Button>
        <Button 
          onClick={() => {
            const treatment = windowCoverings.find(w => w.id === selectedTreatment);
            if (treatment) {
              handleSelect(treatment.name.toLowerCase(), treatment);
            }
          }}
          disabled={!selectedTreatment}
        >
          Add Treatment
        </Button>
      </div>
    </div>
  );
};
