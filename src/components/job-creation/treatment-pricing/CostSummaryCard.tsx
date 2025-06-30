
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface CostSummaryCardProps {
  costs: {
    fabricCost: string;
    optionsCost: string;
    laborCost: string;
    totalCost: string;
  };
}

export const CostSummaryCard = ({ costs }: CostSummaryCardProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Fabric Cost:</span>
          <span>{formatCurrency(parseFloat(costs.fabricCost))}</span>
        </div>
        <div className="flex justify-between">
          <span>Options Cost:</span>
          <span>{formatCurrency(parseFloat(costs.optionsCost))}</span>
        </div>
        <div className="flex justify-between">
          <span>Labor Cost:</span>
          <span>{formatCurrency(parseFloat(costs.laborCost))}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total Cost:</span>
          <span className="text-green-600">{formatCurrency(parseFloat(costs.totalCost))}</span>
        </div>
      </CardContent>
    </Card>
  );
};
