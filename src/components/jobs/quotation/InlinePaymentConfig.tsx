import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useQuotePayment } from "@/hooks/useQuotePayment";
import { formatCurrency } from "@/utils/formatters";
import { CreditCard, CheckCircle2, Clock, DollarSign, Percent } from "lucide-react";

interface InlinePaymentConfigProps {
  quoteId: string;
  total: number;
  currency?: string;
  currentPayment?: {
    type: 'full' | 'deposit';
    percentage?: number;
    amount: number;
    status?: 'pending' | 'paid' | 'deposit_paid' | 'failed';
  };
}

export const InlinePaymentConfig = ({
  quoteId,
  total,
  currency = 'USD',
  currentPayment,
}: InlinePaymentConfigProps) => {
  // Validate quoteId
  if (!quoteId) {
    return (
      <Card className="p-6 bg-muted/30 border-dashed">
        <p className="text-center text-muted-foreground">
          Save the quote first to configure payment options
        </p>
      </Card>
    );
  }

  const { createPayment, verifyPayment, updatePaymentConfig } = useQuotePayment();
  
  const [paymentType, setPaymentType] = useState<'full' | 'deposit'>('full');
  const [depositPercentage, setDepositPercentage] = useState<number>(50);
  const [useFixedAmount, setUseFixedAmount] = useState(false);
  const [fixedAmount, setFixedAmount] = useState<number>(0);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current payment config
  useEffect(() => {
    if (currentPayment) {
      setPaymentType(currentPayment.type);
      if (currentPayment.type === 'deposit' && currentPayment.percentage) {
        setDepositPercentage(currentPayment.percentage);
      }
    }
  }, [currentPayment]);

  // Track changes
  useEffect(() => {
    if (!currentPayment) {
      setHasChanges(paymentType === 'deposit' || depositPercentage !== 50);
      return;
    }
    
    const typeChanged = currentPayment.type !== paymentType;
    const percentageChanged = currentPayment.type === 'deposit' && 
      currentPayment.percentage !== depositPercentage;
    
    setHasChanges(typeChanged || percentageChanged);
  }, [paymentType, depositPercentage, currentPayment]);

  const calculatePaymentAmount = () => {
    if (paymentType === 'full') return total;
    if (useFixedAmount) return fixedAmount;
    return (total * depositPercentage) / 100;
  };

  const paymentAmount = calculatePaymentAmount();
  const isPaid = currentPayment?.status === 'paid' || currentPayment?.status === 'deposit_paid';

  const handleSaveConfig = async () => {
    await updatePaymentConfig.mutateAsync({
      quoteId,
      paymentType,
      paymentPercentage: paymentType === 'deposit' ? depositPercentage : undefined,
      total,
    });
    setHasChanges(false);
  };

  const handlePayNow = async () => {
    if (hasChanges) {
      await handleSaveConfig();
    }
    await createPayment.mutateAsync({ quoteId });
  };

  const handleVerify = async () => {
    await verifyPayment.mutateAsync({ quoteId });
  };

  const getStatusBadge = () => {
    if (!currentPayment?.status) return null;
    
    const variants = {
      pending: { icon: Clock, label: "Pending", variant: "outline" as const },
      paid: { icon: CheckCircle2, label: "Paid", variant: "default" as const },
      deposit_paid: { icon: CheckCircle2, label: "Deposit Paid", variant: "secondary" as const },
      failed: { icon: Clock, label: "Failed", variant: "destructive" as const },
    };
    
    const status = variants[currentPayment.status];
    if (!status) return null;
    
    const Icon = status.icon;
    return (
      <Badge variant={status.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.label}
      </Badge>
    );
  };

  return (
    <Card className="p-6 space-y-6 bg-muted/50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Payment Configuration</h3>
        {getStatusBadge()}
      </div>

      {!isPaid && (
        <>
          {/* Payment Type Selection */}
          <div className="space-y-3">
            <Label>Payment Type</Label>
            <RadioGroup value={paymentType} onValueChange={(v: 'full' | 'deposit') => setPaymentType(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" disabled={isPaid} />
                <Label htmlFor="full" className="cursor-pointer">Full Payment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deposit" id="deposit" disabled={isPaid} />
                <Label htmlFor="deposit" className="cursor-pointer">Deposit Payment</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Deposit Configuration */}
          {paymentType === 'deposit' && (
            <div className="space-y-3 pl-6 border-l-2 border-primary/20">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={!useFixedAmount ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseFixedAmount(false)}
                  className="gap-2"
                >
                  <Percent className="h-4 w-4" />
                  Percentage
                </Button>
                <Button
                  type="button"
                  variant={useFixedAmount ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseFixedAmount(true)}
                  className="gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Fixed Amount
                </Button>
              </div>

              {!useFixedAmount ? (
                <div className="space-y-2">
                  <Label>Deposit Percentage</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={depositPercentage}
                      onChange={(e) => setDepositPercentage(parseInt(e.target.value) || 50)}
                      className="w-24"
                      disabled={isPaid}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Fixed Deposit Amount</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max={total}
                      step="0.01"
                      value={fixedAmount}
                      onChange={(e) => setFixedAmount(parseFloat(e.target.value) || 0)}
                      className="w-32"
                      disabled={isPaid}
                    />
                    <span className="text-sm text-muted-foreground">{currency}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Payment Summary */}
      <div className="bg-background rounded-lg p-4 space-y-2 border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Amount:</span>
          <span className="font-medium">{formatCurrency(total, currency)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg border-t pt-2">
          <span>Payment Required:</span>
          <span className="text-primary">{formatCurrency(paymentAmount, currency)}</span>
        </div>
        {paymentType === 'deposit' && !isPaid && (
          <p className="text-xs text-muted-foreground">
            Remaining balance: {formatCurrency(total - paymentAmount, currency)}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {hasChanges && !isPaid && (
          <Button
            onClick={handleSaveConfig}
            variant="outline"
            disabled={updatePaymentConfig.isPending}
          >
            {updatePaymentConfig.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        )}
        
        {!isPaid && (
          <Button
            onClick={handlePayNow}
            disabled={createPayment.isPending || updatePaymentConfig.isPending}
            className="gap-2 flex-1"
          >
            <CreditCard className="h-4 w-4" />
            {createPayment.isPending ? "Processing..." : "Pay Now with Stripe"}
          </Button>
        )}
        
        {currentPayment?.status === 'pending' && (
          <Button
            onClick={handleVerify}
            variant="secondary"
            disabled={verifyPayment.isPending}
          >
            {verifyPayment.isPending ? "Verifying..." : "Verify Payment"}
          </Button>
        )}
      </div>

      {isPaid && (
        <div className="text-center py-4 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
          <p className="font-medium">Payment Complete</p>
          <p className="text-sm">Thank you for your payment!</p>
        </div>
      )}
    </Card>
  );
};
