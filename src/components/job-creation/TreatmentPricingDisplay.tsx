
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface TreatmentPricingDisplayProps {
  materialCost: number;
  laborCost: number;
  quantity: number;
}

export const TreatmentPricingDisplay = ({ 
  materialCost, 
  laborCost, 
  quantity 
}: TreatmentPricingDisplayProps) => {
  const { units } = useMeasurementUnits();
  const totalPrice = (materialCost + laborCost) * quantity;

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
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium">Total Price (excluding GST):</span>
        <span className="text-2xl font-bold text-green-600">{formatCurrency(totalPrice)}</span>
      </div>
      <div className="text-sm text-gray-600 mt-1">
        ({formatCurrency(materialCost + laborCost)} × {quantity} {quantity === 1 ? 'unit' : 'units'})
      </div>
    </div>
  );
};
