
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Mail, Printer, DollarSign } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface ProjectQuoteTabProps {
  project: any;
  shouldHighlightNewQuote?: boolean;
}

export const ProjectQuoteTab = ({ project, shouldHighlightNewQuote = false }: ProjectQuoteTabProps) => {
  const { data: clients } = useClients();
  const { toast } = useToast();

  const client = clients?.find(c => c.id === project.client_id);
  
  // Mock quote data - in real app this would come from project rooms/products
  const quoteItems = [
    { id: 1, description: "Living Room Curtains", quantity: 2, unitPrice: 450, total: 900 },
    { id: 2, description: "Bedroom Blinds", quantity: 3, unitPrice: 280, total: 840 },
    { id: 3, description: "Installation Service", quantity: 1, unitPrice: 200, total: 200 }
  ];
  
  const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
              <p className="text-sm text-gray-600">Tax (10%)</p>
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
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quoteItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No items added yet. Complete the job setup to generate quote items.
                </TableCell>
              </TableRow>
            ) : (
              quoteItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
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
