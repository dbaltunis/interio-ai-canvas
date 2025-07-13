import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  DollarSign, 
  Mail,
  Download,
  Plus,
  Trash2,
  Calculator
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuoteGenerationStepProps {
  workflowData: any;
  onComplete: () => void;
}

export const QuoteGenerationStep = ({ workflowData, onComplete }: QuoteGenerationStepProps) => {
  const [quoteData, setQuoteData] = useState({
    discount: 0,
    taxRate: 10,
    validUntil: "",
    notes: "",
    additionalServices: [] as Array<{ name: string; price: number }>
  });
  
  const [newService, setNewService] = useState({ name: "", price: 0 });
  const [showAddService, setShowAddService] = useState(false);
  const { toast } = useToast();

  const { client, project, rooms = [], treatments = [] } = workflowData;

  // Calculate totals
  const treatmentsTotal = treatments.reduce((sum: number, t: any) => sum + (t.totalPrice || 0), 0);
  const servicesTotal = quoteData.additionalServices.reduce((sum, s) => sum + s.price, 0);
  const subtotal = treatmentsTotal + servicesTotal;
  const discountAmount = (subtotal * quoteData.discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * quoteData.taxRate) / 100;
  const total = afterDiscount + taxAmount;

  const handleAddService = () => {
    if (newService.name && newService.price > 0) {
      setQuoteData(prev => ({
        ...prev,
        additionalServices: [...prev.additionalServices, newService]
      }));
      setNewService({ name: "", price: 0 });
      setShowAddService(false);
    }
  };

  const handleRemoveService = (index: number) => {
    setQuoteData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateQuote = () => {
    toast({
      title: "Quote Generated",
      description: "Professional quote created successfully!"
    });
    // In real implementation, this would create the quote in the database
    onComplete();
  };

  const handleEmailQuote = () => {
    toast({
      title: "Quote Emailed",
      description: `Quote sent to ${client?.email || 'client'}`
    });
  };

  const handleDownloadQuote = () => {
    toast({
      title: "Quote Downloaded",
      description: "PDF quote saved to downloads"
    });
  };

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-800">{project?.name}</h3>
              <p className="text-sm text-blue-600">
                {client?.name} • {rooms.length} rooms • {treatments.length} treatments
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">Estimated Value</p>
              <p className="text-xl font-semibold text-blue-800">
                ${total.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quote Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Quote Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={quoteData.discount}
                  onChange={(e) => setQuoteData(prev => ({ 
                    ...prev, 
                    discount: parseFloat(e.target.value) || 0 
                  }))}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={quoteData.taxRate}
                  onChange={(e) => setQuoteData(prev => ({ 
                    ...prev, 
                    taxRate: parseFloat(e.target.value) || 0 
                  }))}
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={quoteData.validUntil}
                onChange={(e) => setQuoteData(prev => ({ 
                  ...prev, 
                  validUntil: e.target.value 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={quoteData.notes}
                onChange={(e) => setQuoteData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Additional terms, conditions, or notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                rows={3}
              />
            </div>

            {/* Additional Services */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Additional Services</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddService(!showAddService)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Service
                </Button>
              </div>

              {showAddService && (
                <div className="border rounded-lg p-3 mb-3">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="Service name"
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ 
                        ...prev, 
                        name: e.target.value 
                      }))}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={newService.price}
                      onChange={(e) => setNewService(prev => ({ 
                        ...prev, 
                        price: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddService}>Add</Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowAddService(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {quoteData.additionalServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">${service.price}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveService(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quote Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quote Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Line Items */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Window Treatments:</h4>
              {treatments.map((treatment: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{treatment.windowName} - {treatment.treatmentType}</span>
                  <span>${treatment.totalPrice?.toLocaleString() || 0}</span>
                </div>
              ))}

              {quoteData.additionalServices.length > 0 && (
                <>
                  <h4 className="font-medium text-sm mt-4">Additional Services:</h4>
                  {quoteData.additionalServices.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{service.name}</span>
                      <span>${service.price.toLocaleString()}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              {quoteData.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({quoteData.discount}%):</span>
                  <span>-${discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax ({quoteData.taxRate}%):</span>
                <span>${taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Quote Actions */}
            <div className="space-y-2 pt-4">
              <Button
                onClick={handleGenerateQuote}
                className="w-full bg-brand-primary hover:bg-brand-accent flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Generate Quote
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleEmailQuote}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email Quote
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadQuote}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Client Info */}
            {client && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs">
                <p><strong>Client:</strong> {client.name}</p>
                <p><strong>Email:</strong> {client.email}</p>
                <p><strong>Phone:</strong> {client.phone}</p>
                {quoteData.validUntil && (
                  <p><strong>Valid Until:</strong> {new Date(quoteData.validUntil).toLocaleDateString()}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};