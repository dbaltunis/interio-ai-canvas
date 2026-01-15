import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, ExternalLink, Loader2, Receipt } from "lucide-react";
import { useInvoices, StripeInvoice } from "@/hooks/useInvoices";
import { usePaidCustomInvoices, CustomInvoice } from "@/hooks/useCustomInvoices";
import { format } from "date-fns";

// Unified invoice type for display
interface UnifiedInvoice {
  id: string;
  number: string;
  date: Date;
  description: string;
  amount: number;
  currency: string;
  status: string;
  hostedUrl: string | null;
  pdfUrl: string | null;
  source: 'stripe' | 'custom';
}

// Convert Stripe invoice to unified format
const normalizeStripeInvoice = (invoice: StripeInvoice): UnifiedInvoice => ({
  id: invoice.id,
  number: invoice.number || invoice.id.slice(-8).toUpperCase(),
  date: new Date(invoice.created * 1000),
  description: invoice.lines?.data?.[0]?.description || 'Subscription payment',
  amount: (invoice.amount_paid || invoice.amount_due) / 100,
  currency: invoice.currency.toUpperCase(),
  status: invoice.status,
  hostedUrl: invoice.hosted_invoice_url,
  pdfUrl: invoice.invoice_pdf,
  source: 'stripe',
});

// Convert custom invoice to unified format
const normalizeCustomInvoice = (invoice: CustomInvoice): UnifiedInvoice => ({
  id: invoice.id,
  number: (invoice as any).invoice_number || invoice.description,
  date: new Date(invoice.invoice_date),
  description: invoice.description,
  amount: invoice.amount,
  currency: invoice.currency,
  status: invoice.status,
  hostedUrl: invoice.hosted_url,
  pdfUrl: invoice.pdf_url,
  source: 'custom',
});

export function InvoicesTable() {
  const { data: stripeInvoices, isLoading: stripeLoading, error: stripeError } = useInvoices();
  const { data: customInvoices, isLoading: customLoading, error: customError } = usePaidCustomInvoices();

  const isLoading = stripeLoading || customLoading;
  const error = stripeError || customError;

  // Merge and sort invoices
  const allInvoices: UnifiedInvoice[] = [
    ...(stripeInvoices?.map(normalizeStripeInvoice) || []),
    ...(customInvoices?.map(normalizeCustomInvoice) || []),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      open: { label: 'Open', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
      uncollectible: { label: 'Uncollectible', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      void: { label: 'Void', className: 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-500' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>Your invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>Your invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load invoices. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (allInvoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>Your invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No invoices yet</p>
          <p className="text-sm text-muted-foreground">Your invoices will appear here after your first billing cycle.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Billing History
        </CardTitle>
        <CardDescription>Your invoices and payment history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allInvoices.map((invoice) => (
                <TableRow key={`${invoice.source}-${invoice.id}`}>
                  <TableCell className="font-mono text-sm">
                    {invoice.number}
                  </TableCell>
                  <TableCell className="font-medium">
                    {invoice.description}
                  </TableCell>
                  <TableCell>
                    {format(invoice.date, 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {invoice.hostedUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(invoice.hostedUrl!, '_blank')}
                          title="View Invoice"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {invoice.pdfUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(invoice.pdfUrl!, '_blank')}
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
