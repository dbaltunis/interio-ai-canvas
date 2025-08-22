
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DollarSign } from "lucide-react";

interface QuotationSummaryProps {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  onTaxRateChange: (rate: number) => void;
  markupPercentage: number;
  treatmentTotal: number;
}

export const QuotationSummary = ({
  subtotal,
  taxRate,
  taxAmount,
  total,
  onTaxRateChange,
  markupPercentage,
  treatmentTotal
}: QuotationSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const markupAmount = treatmentTotal * (markupPercentage / 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Quote Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Costs */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Treatment Base Cost:</span>
            <span>{formatCurrency(treatmentTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Markup ({markupPercentage}%):</span>
            <span className="text-green-600">+{formatCurrency(markupAmount)}</span>
          </div>
        </div>

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between font-medium">
          <span>Subtotal (excluding GST):</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {/* Tax Configuration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="tax-rate" className="text-sm">Tax Rate:</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="tax-rate"
                type="number"
                min="0"
                max="1"
                step="0.0001"
                value={taxRate}
                onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                className="w-20 h-8"
              />
              <span className="text-sm text-gray-500">({(taxRate * 100).toFixed(1)}%)</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST Amount:</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-xl font-bold">
          <span>Total (including GST):</span>
          <span className="text-brand-primary">{formatCurrency(total)}</span>
        </div>

        {/* Quote Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p><strong>Valid for:</strong> 30 days</p>
          <p><strong>Terms:</strong> 50% deposit required to commence work</p>
        </div>
      </CardContent>
    </Card>
  );
};
