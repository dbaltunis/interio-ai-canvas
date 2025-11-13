import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, User, ShoppingCart, FileText, PenTool } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { supabase } from "@/integrations/supabase/client";

interface QuoteProduct {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface QuoteContentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  projectId: string;
  clientId?: string;
  currency?: string;
  initialData: {
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientAddress?: string;
    quoteNumber?: string;
    orderNumber?: string;
    notes?: string;
    terms?: string;
    products?: QuoteProduct[];
    taxRate?: number;
  };
  onSave: () => void;
}

export const QuoteContentEditor = ({
  open,
  onOpenChange,
  quoteId,
  projectId,
  clientId,
  currency = 'AUD',
  initialData,
  onSave,
}: QuoteContentEditorProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Client details
  const [clientName, setClientName] = useState(initialData.clientName || '');
  const [clientEmail, setClientEmail] = useState(initialData.clientEmail || '');
  const [clientPhone, setClientPhone] = useState(initialData.clientPhone || '');
  const [clientAddress, setClientAddress] = useState(initialData.clientAddress || '');
  
  // Quote details
  const [quoteNumber, setQuoteNumber] = useState(initialData.quoteNumber || '');
  const [orderNumber, setOrderNumber] = useState(initialData.orderNumber || '');
  
  // Products (only quantities are editable)
  const [products, setProducts] = useState<QuoteProduct[]>(initialData.products || []);
  
  // Messages
  const [notes, setNotes] = useState(initialData.notes || '');
  const [terms, setTerms] = useState(initialData.terms || '');

  const taxRate = initialData.taxRate || 0;

  // Recalculate totals when quantities change
  const calculateTotals = () => {
    const subtotal = products.reduce((sum, p) => sum + p.total_price, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const total_price = newQuantity * p.unit_price;
        return { ...p, quantity: newQuantity, total_price };
      }
      return p;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update client details if clientId exists
      if (clientId) {
        const { error: clientError } = await supabase
          .from('clients')
          .update({
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
            address: clientAddress,
          })
          .eq('id', clientId);

        if (clientError) throw clientError;
      }

      // 2. Update quote details (skip order_number as it doesn't exist in schema)
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          quote_number: quoteNumber,
          notes: notes,
          subtotal: subtotal,
          tax: taxAmount,
          total: total,
        })
        .eq('id', quoteId);

      if (quoteError) throw quoteError;

      // 3. Update product quantities in treatments table
      for (const product of products) {
        const { error: treatmentError } = await supabase
          .from('treatments')
          .update({
            quantity: product.quantity,
          })
          .eq('id', product.id)
          .eq('quote_id', quoteId);

        if (treatmentError) {
          console.error('Error updating treatment:', treatmentError);
        }
      }

      toast({
        title: "Quote updated",
        description: "Your changes have been saved successfully.",
      });

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving quote:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Quote Content</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="client" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="client">
              <User className="h-4 w-4 mr-2" />
              Client
            </TabsTrigger>
            <TabsTrigger value="products">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Items
            </TabsTrigger>
            <TabsTrigger value="messages">
              <FileText className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="terms">
              <PenTool className="h-4 w-4 mr-2" />
              Terms
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="client" className="space-y-4 m-0">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quote Number</Label>
                    <Input
                      value={quoteNumber}
                      onChange={(e) => setQuoteNumber(e.target.value)}
                      placeholder="QT-2024-001"
                    />
                  </div>
                  <div>
                    <Label>Order Number</Label>
                    <Input
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="ORD-2024-001"
                    />
                  </div>
                </div>

                <div>
                  <Label>Client Name</Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+61 400 000 000"
                    />
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Textarea
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="123 Main St, Sydney NSW 2000"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4 m-0">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Edit quantities only. Unit prices are locked and totals auto-calculate.
                </div>

                {products.map((product, index) => (
                  <div key={product.id} className="p-4 border rounded-lg space-y-3">
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-muted-foreground">{product.description}</div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.quantity}
                          onChange={(e) => handleQuantityChange(product.id, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Unit Price</Label>
                        <Input
                          value={formatCurrency(product.unit_price, currency)}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total</Label>
                        <Input
                          value={formatCurrency(product.total_price, currency)}
                          disabled
                          className="bg-muted font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax ({taxRate}%):</span>
                    <span>{formatCurrency(taxAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(total, currency)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4 m-0">
              <div>
                <Label>Quote Notes / Message</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special notes or messages for the client..."
                  rows={10}
                />
              </div>
            </TabsContent>

            <TabsContent value="terms" className="space-y-4 m-0">
              <div>
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Enter your terms and conditions..."
                  rows={15}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
