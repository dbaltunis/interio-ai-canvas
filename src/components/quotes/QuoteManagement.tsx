
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Save, Send, FileText, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateQuote } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { QuoteLineItems } from "./QuoteLineItems";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  category: string;
}

interface QuoteManagementProps {
  quote: any;
  onBack: () => void;
}

export const QuoteManagement = ({ quote, onBack }: QuoteManagementProps) => {
  const [quoteData, setQuoteData] = useState({
    quote_number: quote.quote_number || "",
    status: quote.status || "draft",
    valid_until: quote.valid_until || "",
    notes: quote.notes || ""
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState(quote.tax_rate || 0);

  const { toast } = useToast();
  const updateQuote = useUpdateQuote();
  const { data: clients } = useClients();
  const { formatCurrency } = useFormattedCurrency();

  const selectedClient = quote.client_id ? clients?.find(c => c.id === quote.client_id) : null;

  // Calculate totals
  // Note: For quotes, we typically show prices as exclusive and add tax on top
  // But this should respect business settings if needed
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  useEffect(() => {
    // Initialize with empty line items for now
    setLineItems([]);
  }, [quote]);

  const handleSave = async () => {
    try {
      await updateQuote.mutateAsync({
        id: quote.id,
        ...quoteData,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: total
      });
      
      toast({
        title: "Quote Saved",
        description: "Quote has been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save quote:", error);
      toast({
        title: "Error",
        description: "Failed to save quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendQuote = async () => {
    try {
      await updateQuote.mutateAsync({
        id: quote.id,
        ...quoteData,
        status: "sent",
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: total
      });
      
      toast({
        title: "Quote Sent",
        description: "Quote has been marked as sent.",
      });
    } catch (error) {
      console.error("Failed to send quote:", error);
      toast({
        title: "Error",
        description: "Failed to send quote. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-white w-full">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Jobs</span>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Quote #{quoteData.quote_number}
              </h1>
              <p className="text-sm text-gray-500">
                {selectedClient ? `For ${selectedClient.name}` : 'No client assigned'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleSave} disabled={updateQuote.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Quote
            </Button>
            <Button 
              onClick={handleSendQuote} 
              disabled={updateQuote.isPending || lineItems.length === 0}
              className="bg-brand-primary hover:bg-brand-accent text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Quote
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quote Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quote_number">Quote Number</Label>
                <Input
                  id="quote_number"
                  value={quoteData.quote_number}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, quote_number: e.target.value }))}
                  placeholder="Enter quote number"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={quoteData.status} 
                  onValueChange={(value) => setQuoteData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={quoteData.valid_until}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedClient ? (
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">{selectedClient.name}</span>
                    {selectedClient.company_name && (
                      <div className="text-sm text-gray-500">{selectedClient.company_name}</div>
                    )}
                  </div>
                  {selectedClient.email && (
                    <div className="text-sm text-gray-600">{selectedClient.email}</div>
                  )}
                  {selectedClient.phone && (
                    <div className="text-sm text-gray-600">{selectedClient.phone}</div>
                  )}
                  {selectedClient.address && (
                    <div className="text-sm text-gray-600">
                      {selectedClient.address}
                      {selectedClient.city && `, ${selectedClient.city}`}
                      {selectedClient.state && `, ${selectedClient.state}`}
                      {selectedClient.zip_code && ` ${selectedClient.zip_code}`}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 italic">No client assigned</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(1)}%):</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total:</span>
                <span className="text-brand-primary">{formatCurrency(total)}</span>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {lineItems.length} line item{lineItems.length !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <QuoteLineItems
          items={lineItems}
          onItemsChange={setLineItems}
          subtotal={subtotal}
          taxRate={taxRate}
          taxAmount={taxAmount}
          total={total}
          onTaxRateChange={setTaxRate}
        />

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Quote Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={quoteData.notes}
              onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes, terms, or conditions for this quote..."
              rows={4}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
