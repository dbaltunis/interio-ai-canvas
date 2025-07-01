
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calculator, Info, Ruler, Scissors, Settings } from "lucide-react";
import { TreatmentFormData, CalculationResult, DetailedCalculation } from './types';
import { formatCurrency } from './calculationUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CalculationTabProps {
  formData: TreatmentFormData;
  calculation: CalculationResult & { details: DetailedCalculation };
}

export const CalculationTab = ({ formData, calculation }: CalculationTabProps) => {
  return (
    <div className="space-y-6">
      {/* Manufacturing Instructions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Settings className="mr-2 h-5 w-5" />
            Manufacturing Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-blue-700 mb-2">Treatment Details:</h5>
              <ul className="space-y-1 text-blue-600">
                <li>• Style: {formData.headingStyle || 'Not specified'}</li>
                <li>• Fullness: {formData.headingFullness}:1 ratio</li>
                <li>• Lining: {formData.lining || 'None'}</li>
                <li>• Mounting: {formData.mounting || 'Not specified'}</li>
                <li>• Quantity: {formData.quantity} panel(s)</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-700 mb-2">Key Measurements:</h5>
              <ul className="space-y-1 text-blue-600">
                <li>• Rail Width: {formData.railWidth}cm</li>
                <li>• Finished Drop: {formData.curtainDrop}cm</li>
                {formData.curtainPooling && formData.curtainPooling !== "0" && (
                  <li>• Pooling: {formData.curtainPooling}cm</li>
                )}
                <li>• Return Depth: {formData.returnDepth}cm</li>
                <li>• Fabric Width: {formData.fabricWidth}cm</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Detailed Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fabric Calculation */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Scissors className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-700">Fabric Calculation</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{calculation.details.fabricCalculation}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Width Required:</strong> {calculation.details.fabricWidthRequired.toFixed(0)}cm</p>
                  <p><strong>Length Required:</strong> {calculation.details.fabricLengthRequired.toFixed(0)}cm</p>
                  <p><strong>Drops per Width:</strong> {calculation.details.dropsPerWidth}</p>
                </div>
                <div>
                  <p><strong>Fabric Widths Needed:</strong> {calculation.details.widthsRequired}</p>
                  <p><strong>Total Fabric:</strong> {calculation.fabricYards} yards</p>
                  <p><strong>Price per Yard:</strong> {formatCurrency(calculation.details.fabricPricePerYard)}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-green-200">
                <p className="font-medium text-green-700">
                  Fabric Cost: {calculation.fabricYards} yards × {formatCurrency(calculation.details.fabricPricePerYard)} = {formatCurrency(calculation.fabricCost)}
                </p>
              </div>
            </div>
          </div>

          {/* Labor Calculation */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Ruler className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-700">Labor Calculation</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{calculation.details.laborCalculation}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600">
                <strong>Total Labor:</strong> {calculation.laborHours} hours × £{formData.laborRate}/hour = {formatCurrency(calculation.laborCost)}
              </p>
            </div>
          </div>

          {/* Features Breakdown */}
          {calculation.details.featureBreakdown.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-purple-700">Additional Features (Per Unit Pricing)</h4>
              <div className="bg-purple-50 p-3 rounded-lg space-y-2">
                {calculation.details.featureBreakdown.map((feature, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-purple-600">{feature.name}:</span>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(feature.totalPrice)}</p>
                      <p className="text-xs text-purple-500">{feature.calculation}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-purple-200">
                  <div className="flex justify-between font-medium text-purple-700">
                    <span>Total Features Cost:</span>
                    <span>{formatCurrency(calculation.featuresCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Final Totals */}
          <div className="space-y-3">
            <h4 className="font-medium">Final Pricing</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Fabric Cost:</span>
                <span>{formatCurrency(calculation.fabricCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Labor Cost:</span>
                <span>{formatCurrency(calculation.laborCost)}</span>
              </div>
              {calculation.featuresCost > 0 && (
                <div className="flex justify-between">
                  <span>Features Cost:</span>
                  <span>{formatCurrency(calculation.featuresCost)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculation.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Markup ({formData.markupPercentage}%):</span>
                <span>{formatCurrency(calculation.total - calculation.subtotal)}</span>
              </div>
              <div className="flex justify-between border-t-2 pt-2 text-xl font-bold">
                <span>Total Price:</span>
                <span className="text-green-600">{formatCurrency(calculation.total)}</span>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                <p><strong>Unit Price:</strong> {formatCurrency(calculation.total / formData.quantity)} per panel</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
