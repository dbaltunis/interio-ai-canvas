
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Mail, Printer, DollarSign, MapPin } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { formatCurrency } from "@/utils/currency";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { buildClientBreakdown } from "@/utils/quotes/buildClientBreakdown";
import QuoteItemBreakdown from "@/components/quotes/QuoteItemBreakdown";
import { useQuotationSync } from "@/hooks/useQuotationSync";
interface ProjectQuoteTabProps {
  project: any;
  shouldHighlightNewQuote?: boolean;
}

export const ProjectQuoteTab = ({ project, shouldHighlightNewQuote = false }: ProjectQuoteTabProps) => {
  const { data: clients } = useClients();
  const { data: treatments = [] } = useTreatments(project?.id);
  const { data: rooms = [] } = useRooms(project?.id);
  const { data: surfaces = [] } = useSurfaces(project?.id);
  const { data: projectSummaries } = useProjectWindowSummaries(project?.id);
  const { buildQuotationItems } = useQuotationSync({
    projectId: project?.id || "",
    clientId: project?.client_id || "",
    autoCreateQuote: false,
    markupPercentage: 25,
    taxRate: 0.08,
  });

  // Build quotation items from sync data
  const quotationData = buildQuotationItems();
  const { toast } = useToast();

  const client = clients?.find(c => c.id === project.client_id);
  
  // Use built quotation items
  const displayQuoteItems = quotationData.items || [];
  
  const markupPercentage = 25; // Default 25% markup to match QuotationTab
  const taxRate = 0.08; // 8% tax rate to match QuotationTab
  const baseSubtotal = quotationData.subtotal || 0;
  const subtotal = baseSubtotal * (1 + markupPercentage / 100);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;


  const handleEmailQuote = () => {
    toast({ title: "Email sent", description: "Quote has been emailed to client" });
  };

  return (
    <div className="space-y-6">
      {/* Quote Status */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Quote Ready</h3>
              <p className="text-sm text-blue-700">
                {client ? `Ready to send to ${client.name}` : "Assign a client to send quote"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleEmailQuote} disabled={!client}>
              <Mail className="h-4 w-4 mr-2" />
              Email Quote
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </Card>

      {/* Quote Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="text-lg font-semibold">{formatCurrency(subtotal)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Tax (8%)</p>
              <p className="text-lg font-semibold">{formatCurrency(tax)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold">{formatCurrency(total)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quote Items */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Quote Items</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item & Location</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayQuoteItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No treatments added yet. Add treatments in the Jobs tab to generate quote items.
                </TableCell>
              </TableRow>
            ) : (
              displayQuoteItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{item.description}</div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.location} • {item.window}
                      </div>
                      {item.fabric_type && (
                        <div className="text-xs text-gray-500">
                          {item.fabric_type} • {item.treatment_type}
                        </div>
                      )}
                      {Array.isArray(item.breakdown) && item.breakdown.length > 0 && (
                        <QuoteItemBreakdown
                          breakdown={item.breakdown}
                          currency={item.currency || 'GBP'}
                          formatCurrencyFn={(n) => formatCurrency(n, item.currency || 'GBP')}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Client Information */}
      {client && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-3">Bill To:</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{client.name}</p>
              {client.email && <p>{client.email}</p>}
              {client.phone && <p>{client.phone}</p>}
              {client.address && <p>{client.address}</p>}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
