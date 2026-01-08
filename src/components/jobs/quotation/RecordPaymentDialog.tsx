import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useInvoiceStatus } from "@/hooks/useInvoiceStatus";
import { formatCurrency } from "@/utils/formatters";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  total: number;
  amountPaid: number;
  currency?: string;
  paymentStatus?: string;
  dueDate?: string | null;
}

export const RecordPaymentDialog = ({
  open,
  onOpenChange,
  quoteId,
  total,
  amountPaid,
  currency = 'GBP',
  paymentStatus,
  dueDate,
}: RecordPaymentDialogProps) => {
  const { recordPayment, markAsPaid, getEffectiveStatus, calculateBalanceDue } = useInvoiceStatus();
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  
  const balanceDue = calculateBalanceDue(total, amountPaid);
  const effectiveStatus = getEffectiveStatus(paymentStatus || 'unpaid', dueDate || null);
  
  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    await recordPayment.mutateAsync({
      quoteId,
      paymentAmount: amount,
      totalAmount: total
    });
    
    setPaymentAmount('');
    onOpenChange(false);
  };
  
  const handleMarkAsPaid = async () => {
    await markAsPaid.mutateAsync({
      quoteId,
      totalAmount: total
    });
    onOpenChange(false);
  };
  
  const getStatusBadge = () => {
    switch (effectiveStatus) {
      case 'paid':
        return <Badge className="bg-green-500 text-white">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-blue-500 text-white">Partial</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500 text-white">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unpaid</Badge>;
    }
  };
  
  const isPaid = effectiveStatus === 'paid';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Record Payment</span>
            {getStatusBadge()}
          </DialogTitle>
          <DialogDescription>
            Record a payment received for this invoice
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Summary */}
          <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
            <div className="flex justify-between text-sm">
              <span>Invoice Total:</span>
              <span className="font-medium">{formatCurrency(total, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Amount Paid:</span>
              <span className="font-medium text-green-600">{formatCurrency(amountPaid, currency)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2 font-semibold">
              <span>Balance Due:</span>
              <span className={balanceDue > 0 ? 'text-destructive' : 'text-green-600'}>
                {formatCurrency(balanceDue, currency)}
              </span>
            </div>
          </div>

          {isPaid ? (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800 dark:text-green-200">
                This invoice has been fully paid.
              </p>
            </div>
          ) : (
            <>
              {/* Payment Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Payment Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$'}
                  </span>
                  <Input
                    id="payment-amount"
                    type="number"
                    min="0.01"
                    max={balanceDue}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the amount received. Maximum: {formatCurrency(balanceDue, currency)}
                </p>
              </div>

              {effectiveStatus === 'overdue' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    This invoice is overdue. Consider following up with the customer.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!isPaid && (
            <>
              <Button
                variant="outline"
                onClick={handleMarkAsPaid}
                disabled={markAsPaid.isPending || balanceDue === 0}
                className="w-full sm:w-auto"
              >
                {markAsPaid.isPending ? "Processing..." : "Mark as Paid in Full"}
              </Button>
              <Button
                onClick={handleRecordPayment}
                disabled={
                  recordPayment.isPending || 
                  !paymentAmount || 
                  parseFloat(paymentAmount) <= 0 ||
                  parseFloat(paymentAmount) > balanceDue
                }
                className="w-full sm:w-auto gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {recordPayment.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
