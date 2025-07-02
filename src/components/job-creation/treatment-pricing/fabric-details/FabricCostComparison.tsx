
import { TrendingDown } from "lucide-react";

interface FabricCostComparisonProps {
  costComparison: {
    horizontal: {
      totalYards: number;
      totalCost: number;
      seamsRequired: number;
    };
    vertical: {
      totalYards: number;
      totalCost: number;
      seamsRequired: number;
    };
    recommendation: string;
    savings: number;
  };
}

export const FabricCostComparison = ({ costComparison }: FabricCostComparisonProps) => {
  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;

  return (
    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
      <div className="flex items-center mb-2">
        <TrendingDown className="w-4 h-4 text-green-600 mr-2" />
        <span className="text-sm font-medium text-green-800">Cost Optimization Available</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white p-2 rounded border">
          <div className="font-medium">Horizontal Orientation</div>
          <div>Fabric: {costComparison.horizontal.totalYards.toFixed(1)} yards</div>
          <div>Cost: {formatCurrency(costComparison.horizontal.totalCost)}</div>
          <div>Seams: {costComparison.horizontal.seamsRequired}</div>
        </div>
        <div className="bg-white p-2 rounded border">
          <div className="font-medium">Vertical Orientation</div>
          <div>Fabric: {costComparison.vertical.totalYards.toFixed(1)} yards</div>
          <div>Cost: {formatCurrency(costComparison.vertical.totalCost)}</div>
          <div>Seams: {costComparison.vertical.seamsRequired}</div>
        </div>
      </div>
      <div className="mt-2 p-2 bg-green-100 rounded">
        <div className="text-xs text-green-700">
          <strong>Recommended:</strong> {costComparison.recommendation} orientation
        </div>
        <div className="text-xs text-green-600">
          Potential savings: {formatCurrency(costComparison.savings)}
        </div>
      </div>
    </div>
  );
};
