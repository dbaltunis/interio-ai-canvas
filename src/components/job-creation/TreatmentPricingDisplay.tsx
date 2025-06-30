
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
  const totalPrice = (materialCost + laborCost) * quantity;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium">Total Price:</span>
        <span className="text-2xl font-bold text-green-600">${totalPrice.toFixed(2)}</span>
      </div>
      <div className="text-sm text-gray-600 mt-1">
        (${(materialCost + laborCost).toFixed(2)} × {quantity} {quantity === 1 ? 'unit' : 'units'})
      </div>
    </div>
  );
};
