import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, AlertCircle, Download } from "lucide-react";
import { useUpcomingPayments, CustomInvoice } from "@/hooks/useCustomInvoices";
import { format, isPast, isWithinInterval, addDays } from "date-fns";

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const getPaymentTypeLabel = (type: string): string => {
  switch (type) {
    case 'setup': return 'Setup payment';
    case 'subscription': return 'Annual subscription';
    case 'custom': return 'Payment';
    default: return type;
  }
};

const PaymentCard = ({ payment }: { payment: CustomInvoice }) => {
  const isOverdue = payment.due_date && isPast(new Date(payment.due_date));
  const isDueSoon = payment.due_date && isWithinInterval(new Date(payment.due_date), {
    start: new Date(),
    end: addDays(new Date(), 14)
  });

  return (
    <Card className={`${isOverdue ? 'border-destructive bg-destructive/5' : isDueSoon ? 'border-warning bg-warning/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {formatCurrency(payment.amount, payment.currency)}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Overdue
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {getPaymentTypeLabel(payment.payment_type)}
          </p>
          {payment.due_date && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              <span>Due: {format(new Date(payment.due_date), 'MMMM d, yyyy')}</span>
            </div>
          )}
          {payment.pdf_url && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => window.open(payment.pdf_url!, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const UpcomingPayments = () => {
  const { data: upcomingPayments, isLoading, error } = useUpcomingPayments();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Upcoming Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !upcomingPayments || upcomingPayments.length === 0) {
    return null; // Don't show section if no upcoming payments
  }

  // Sort by due date
  const sortedPayments = [...upcomingPayments].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Upcoming Payments
        </CardTitle>
        <CardDescription>
          Scheduled payments for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedPayments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingPayments;
