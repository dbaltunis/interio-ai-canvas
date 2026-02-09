import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInvoiceStatus } from "@/hooks/useInvoiceStatus";
import { formatCurrency } from "@/utils/formatters";
import { CreditCard, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Fetch payment history (gracefully handles missing table)
  const { data: paymentHistory = [] } = useQuery({
    queryKey: ['payment-records', quoteId],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase.from('payment_records' as any) as any)
          .select('id, amount, payment_method, reference, notes, created_at')
          .eq('quote_id', quoteId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      } catch {
        // Table may not exist yet (migration not run) - return empty
        return [];
      }
    },
    enabled: open && !!quoteId,
  });

  const balanceDue = calculateBalanceDue(total, amountPaid);
  const effectiveStatus = getEffectiveStatus(paymentStatus || 'unpaid', dueDate || null);

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    await recordPayment.mutateAsync({
      quoteId,
      paymentAmount: amount,
      totalAmount: total,
      paymentMethod,
      reference: reference || undefined,
      notes: notes || undefined,
    });

    setPaymentAmount('');
    setReference('');
    setNotes('');
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

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      bank_transfer: 'Bank Transfer',
      cash: 'Cash',
      card: 'Card',
      cheque: 'Cheque',
      stripe: 'Stripe',
      other: 'Other',
    };
    return labels[method] || method;
  };

  const isPaid = effectiveStatus === 'paid';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reference */}
              <div className="space-y-2">
                <Label htmlFor="payment-reference">Reference (optional)</Label>
                <Input
                  id="payment-reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., Transaction ID, cheque number"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="payment-notes">Notes (optional)</Label>
                <Input
                  id="payment-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Deposit payment"
                />
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

          {/* Payment History */}
          {paymentHistory.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Payment History
              </Label>
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {paymentHistory.map((record: any) => (
                  <div key={record.id} className="p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-green-600">
                        +{formatCurrency(record.amount, currency)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString(undefined, {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs h-5">
                        {getMethodLabel(record.payment_method)}
                      </Badge>
                      {record.reference && <span>Ref: {record.reference}</span>}
                    </div>
                    {record.notes && (
                      <p className="text-xs text-muted-foreground italic">{record.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
