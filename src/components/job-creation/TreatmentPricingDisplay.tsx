
import { PriceDisplay } from "@/components/ui/PriceDisplay";

interface TreatmentPricingDisplayProps {
  materialCost: number;
  laborCost: number;
  quantity: number;
  category?: string;
}

export const TreatmentPricingDisplay = ({ 
  materialCost, 
  laborCost, 
  quantity,
  category = "curtains"
}: TreatmentPricingDisplayProps) => {
  const baseCost = materialCost + laborCost;
  const totalPrice = baseCost * quantity;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium">Total Price (excluding GST):</span>
        <PriceDisplay 
          baseCost={totalPrice} 
          category={category}
          size="lg"
          variant="prominent"
        />
      </div>
      <div className="text-sm text-gray-600 mt-1">
        <PriceDisplay 
          baseCost={baseCost} 
          category={category}
          size="sm"
          variant="subtle"
        /> × {quantity} {quantity === 1 ? 'unit' : 'units'}
      </div>
    </div>
  );
};
