
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useUserRole } from "@/hooks/useUserRole";
import { calculateGrossMargin, getProfitStatus } from "@/utils/pricing/markupResolver";

interface QuotationSummaryProps {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  onTaxRateChange: (rate: number) => void;
  markupPercentage: number;
  treatmentTotal: number;
  costTotal?: number; // Base cost before markup
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
  costTotal,
  paymentAmount,
  paymentType,
  paymentStatus,
  onEditDiscount,
  onEditPayment,
}: QuotationSummaryProps) => {
  const { units } = useMeasurementUnits();
  const { data: roleData } = useUserRole();
  const canViewMarkup = roleData?.canViewMarkup || false;
  const currency = units.currency || 'USD';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const markupAmount = treatmentTotal * (markupPercentage / 100);
  // subtotal is already the discounted value when discount is applied
  // discountAmount is only for display purposes - do not subtract again
  const subtotalAfterDiscount = subtotal;
  
  // Calculate profit metrics for authorized users
  const effectiveCost = costTotal || treatmentTotal;
  const profit = subtotal - effectiveCost;
  const gpPercent = calculateGrossMargin(effectiveCost, subtotal);
  const profitStatus = getProfitStatus(gpPercent);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Quote Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profit Summary for Authorized Users */}
        {canViewMarkup && effectiveCost > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2 border border-border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>Profit Summary</span>
              <Badge variant="secondary" className={profitStatus.color}>
                {gpPercent.toFixed(1)}% GP
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Cost</span>
                <span className="font-medium">{formatCurrency(effectiveCost)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Selling</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Profit</span>
                <span className={`font-medium ${profit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                  {formatCurrency(profit)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Base Costs */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Treatment Base Cost:</span>
            <span>{formatCurrency(treatmentTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Markup ({markupPercentage}%):</span>
            <span className="text-emerald-600">+{formatCurrency(markupAmount)}</span>
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
              <span className="text-sm text-muted-foreground">({(taxRate * 100).toFixed(1)}%)</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST Amount:</span>
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
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p><strong>Valid for:</strong> 30 days</p>
          <p><strong>Terms:</strong> {paymentType === 'deposit' ? `${Math.round((paymentAmount || 0 / total) * 100)}% deposit` : '50% deposit'} required to commence work</p>
        </div>
      </CardContent>
    </Card>
  );
};
