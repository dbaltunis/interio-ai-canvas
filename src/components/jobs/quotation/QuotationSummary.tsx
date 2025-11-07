
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface QuotationSummaryProps {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  onTaxRateChange: (rate: number) => void;
  markupPercentage: number;
  treatmentTotal: number;
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  paymentAmount?: number;
  paymentType?: 'full' | 'deposit';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'deposit_paid';
  onEditDiscount?: () => void;
  onEditPayment?: () => void;
}

export const QuotationSummary = ({
  subtotal,
  taxRate,
  taxAmount,
  total,
  onTaxRateChange,
  markupPercentage,
  treatmentTotal,
  discountAmount = 0,
  discountType,
  discountValue,
  paymentAmount,
  paymentType,
  paymentStatus,
  onEditDiscount,
  onEditPayment,
}: QuotationSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const markupAmount = treatmentTotal * (markupPercentage / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;

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

        {/* Discount */}
        {discountAmount > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm items-center">
              <span className="text-destructive flex items-center gap-2">
                Discount {discountType === 'percentage' && discountValue ? `(${discountValue}%)` : ''}:
                {onEditDiscount && (
                  <button onClick={onEditDiscount} className="text-xs underline hover:no-underline">
                    Edit
                  </button>
                )}
              </span>
              <span className="text-destructive">-{formatCurrency(discountAmount)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>After Discount:</span>
              <span>{formatCurrency(subtotalAfterDiscount)}</span>
            </div>
          </div>
        )}

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

        {/* Payment Required */}
        {paymentAmount && (
          <div className="mt-2 p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Payment Required: {formatCurrency(paymentAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {paymentType === 'deposit' 
                    ? `Deposit (${Math.round((paymentAmount / total) * 100)}% of total)` 
                    : 'Full Payment'}
                </p>
                {paymentStatus && (
                  <Badge 
                    className={
                      paymentStatus === 'paid' || paymentStatus === 'deposit_paid'
                        ? 'bg-green-500'
                        : paymentStatus === 'failed'
                        ? 'bg-destructive'
                        : 'bg-yellow-500'
                    }
                  >
                    {paymentStatus === 'deposit_paid' ? 'Deposit Paid' : paymentStatus}
                  </Badge>
                )}
              </div>
              {onEditPayment && (
                <Button size="sm" variant="outline" onClick={onEditPayment}>
                  {paymentStatus === 'pending' ? 'Pay Now' : 'View'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Quote Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p><strong>Valid for:</strong> 30 days</p>
          <p><strong>Terms:</strong> {paymentType === 'deposit' ? `${Math.round((paymentAmount || 0 / total) * 100)}% deposit` : '50% deposit'} required to commence work</p>
        </div>
      </CardContent>
    </Card>
  );
};
