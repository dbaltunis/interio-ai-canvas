import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useQuotePayment } from "@/hooks/useQuotePayment";
import { formatCurrency } from "@/utils/formatters";
import { CreditCard, CheckCircle2, XCircle, Clock } from "lucide-react";

interface QuotePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  total: number;
  currency?: string;
  currentPayment?: {
    type: 'full' | 'deposit';
    percentage?: number;
    amount: number;
    status: 'pending' | 'paid' | 'failed' | 'deposit_paid';
  };
}

export const QuotePaymentDialog = ({
  open,
  onOpenChange,
  quoteId,
  total,
  currency = 'USD',
  currentPayment,
}: QuotePaymentDialogProps) => {
  const { createPayment, updatePaymentConfig, verifyPayment } = useQuotePayment();

  const [paymentType, setPaymentType] = useState<'full' | 'deposit'>(
    currentPayment?.type || 'full'
  );
  const [depositPercentage, setDepositPercentage] = useState<number>(
    currentPayment?.percentage || 50
  );

  const paymentAmount = paymentType === 'full' 
    ? total 
    : (total * depositPercentage) / 100;

  const paymentStatus = currentPayment?.status || 'pending';

  useEffect(() => {
    if (currentPayment) {
      setPaymentType(currentPayment.type);
      if (currentPayment.percentage) {
        setDepositPercentage(currentPayment.percentage);
      }
    }
  }, [currentPayment]);

  const handleUpdateConfig = async () => {
    await updatePaymentConfig.mutateAsync({
      quoteId,
      paymentType,
      paymentPercentage: paymentType === 'deposit' ? depositPercentage : undefined,
      total,
    });
  };

  const handlePayNow = async () => {
    // First update config if needed
    if (paymentType !== currentPayment?.type || 
        (paymentType === 'deposit' && depositPercentage !== currentPayment?.percentage)) {
      await handleUpdateConfig();
    }
    
    // Then create payment
    await createPayment.mutateAsync({ quoteId });
  };

  const handleVerify = async () => {
    await verifyPayment.mutateAsync({ quoteId });
  };

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'deposit_paid':
        return <Badge className="bg-blue-500"><CheckCircle2 className="h-3 w-3 mr-1" />Deposit Paid</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const isPaid = paymentStatus === 'paid' || paymentStatus === 'deposit_paid';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Payment Configuration
            {getStatusBadge()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Type */}
          <div className="space-y-3">
            <Label>Payment Type</Label>
            <RadioGroup 
              value={paymentType} 
              onValueChange={(v: any) => setPaymentType(v)}
              disabled={isPaid}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="cursor-pointer">Full Payment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deposit" id="deposit" />
                <Label htmlFor="deposit" className="cursor-pointer">Deposit</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Deposit Percentage */}
          {paymentType === 'deposit' && (
            <div className="space-y-2">
              <Label>Deposit Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={depositPercentage}
                  onChange={(e) => setDepositPercentage(Math.min(100, Math.max(1, parseFloat(e.target.value) || 50)))}
                  className="flex-1"
                  disabled={isPaid}
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
          )}

          {/* Payment Calculation */}
          <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
            <h4 className="font-semibold text-sm mb-2">Payment Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Quote Total:</span>
                <span className="font-medium">{formatCurrency(total, currency)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-semibold">
                <span>Payment Required:</span>
                <span className="text-primary">{formatCurrency(paymentAmount, currency)}</span>
              </div>
              {paymentType === 'deposit' && (
                <p className="text-xs text-muted-foreground pt-1">
                  Remaining: {formatCurrency(total - paymentAmount, currency)}
                </p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
              <CreditCard className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">Stripe</p>
                <p className="text-xs text-muted-foreground">Credit/Debit Card</p>
              </div>
            </div>
          </div>

          {isPaid && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                {paymentStatus === 'paid' 
                  ? 'Full payment has been received.'
                  : 'Deposit has been received. Remaining balance due upon completion.'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {!isPaid && (
            <>
              {(paymentType !== currentPayment?.type || 
                (paymentType === 'deposit' && depositPercentage !== currentPayment?.percentage)) && (
                <Button
                  variant="outline"
                  onClick={handleUpdateConfig}
                  disabled={updatePaymentConfig.isPending}
                >
                  {updatePaymentConfig.isPending ? "Saving..." : "Save Configuration"}
                </Button>
              )}
              <Button
                onClick={handlePayNow}
                disabled={createPayment.isPending}
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {createPayment.isPending ? "Processing..." : "Pay Now with Stripe"}
              </Button>
            </>
          )}
          {paymentStatus === 'pending' && currentPayment && (
            <Button
              variant="outline"
              onClick={handleVerify}
              disabled={verifyPayment.isPending}
            >
              {verifyPayment.isPending ? "Verifying..." : "Verify Payment"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
