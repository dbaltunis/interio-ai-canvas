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
    <Card className="p-8 space-y-6 bg-card border-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">Configure Payment</h3>
          <p className="text-sm text-muted-foreground">Set up how you want to receive payment for this quote</p>
        </div>
        {getStatusBadge()}
      </div>

      {!isPaid && (
        <>
          {/* Payment Type Selection - Focused Group */}
          <div className="space-y-4 p-6 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Payment Type</Label>
            </div>
            <RadioGroup value={paymentType} onValueChange={(v: 'full' | 'deposit') => setPaymentType(v)}>
              <div className="grid grid-cols-2 gap-4">
                <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentType === 'full' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                  <RadioGroupItem value="full" id="full" disabled={isPaid} />
                  <Label htmlFor="full" className="cursor-pointer flex-1">
                    <div className="font-medium">Full Payment</div>
                    <div className="text-xs text-muted-foreground">Receive entire amount upfront</div>
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentType === 'deposit' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                  <RadioGroupItem value="deposit" id="deposit" disabled={isPaid} />
                  <Label htmlFor="deposit" className="cursor-pointer flex-1">
                    <div className="font-medium">Deposit Payment</div>
                    <div className="text-xs text-muted-foreground">Partial payment now, rest later</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Deposit Configuration */}
          {paymentType === 'deposit' && (
            <div className="space-y-4 p-6 border rounded-lg bg-accent/30 animate-in fade-in-50 slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                <Label className="text-base font-medium">Deposit Amount</Label>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={!useFixedAmount ? "default" : "outline"}
                  size="lg"
                  onClick={() => setUseFixedAmount(false)}
                  className="gap-2 flex-1"
                >
                  <Percent className="h-4 w-4" />
                  Percentage
                </Button>
                <Button
                  type="button"
                  variant={useFixedAmount ? "default" : "outline"}
                  size="lg"
                  onClick={() => setUseFixedAmount(true)}
                  className="gap-2 flex-1"
                >
                  <DollarSign className="h-4 w-4" />
                  Fixed Amount
                </Button>
              </div>

              {!useFixedAmount ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Deposit Percentage</Label>
                    <span className="text-2xl font-bold text-primary">{depositPercentage}%</span>
                  </div>
                  <Input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={depositPercentage}
                    onChange={(e) => setDepositPercentage(parseInt(e.target.value))}
                    disabled={isPaid}
                    className="w-full"
                  />
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
                <div className="space-y-3">
                  <Label>Fixed Deposit Amount</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">{currency}</span>
                    <Input
                      type="number"
                      min="0"
                      max={total}
                      step="0.01"
                      value={fixedAmount}
                      onChange={(e) => setFixedAmount(parseFloat(e.target.value) || 0)}
                      className="text-lg font-semibold"
                      disabled={isPaid}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Payment Summary - Enhanced */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 space-y-3 border-2 border-primary/20">
        <h4 className="font-semibold text-base mb-4">Payment Summary</h4>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Quote Total:</span>
          <span className="font-medium">{formatCurrency(total, currency)}</span>
        </div>
        <div className="flex justify-between font-semibold text-xl border-t-2 pt-3 mt-2">
          <span>Payment Required:</span>
          <span className="text-primary">{formatCurrency(paymentAmount, currency)}</span>
        </div>
        {paymentType === 'deposit' && !isPaid && (
          <div className="text-sm pt-2 border-t">
            <div className="flex justify-between text-muted-foreground">
              <span>Remaining balance:</span>
              <span>{formatCurrency(total - paymentAmount, currency)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {hasChanges && !isPaid && (
          <Button
            onClick={handleSaveConfig}
            variant="outline"
            size="lg"
            disabled={updatePaymentConfig.isPending}
            className="flex-1"
          >
            {updatePaymentConfig.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        )}
      </div>

      {isPaid && (
        <div className="text-center py-6 text-muted-foreground animate-in fade-in-50 zoom-in-95">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-3 text-green-600" />
          <p className="font-semibold text-lg">Payment Complete</p>
          <p className="text-sm">Thank you for your payment!</p>
        </div>
      )}
    </Card>
  );
};
