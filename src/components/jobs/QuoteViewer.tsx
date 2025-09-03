import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateQuote } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { Eye, Edit, Mail, Download, Save, X } from "lucide-react";
import { QuoteErrorBoundary } from "@/components/performance/QuoteErrorBoundary";

interface Quote {
  id: string;
  quote_number?: string;
  status: string;
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  total_amount?: number;
  valid_until?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface QuoteViewerProps {
  quote: Quote;
  isEditable?: boolean;
  children?: React.ReactNode;
}

export const QuoteViewer = ({ quote, isEditable = false, children }: QuoteViewerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: quote.status,
    subtotal: quote.subtotal || 0,
    tax_rate: quote.tax_rate || 0,
    tax_amount: quote.tax_amount || 0,
    total_amount: quote.total_amount || 0,
    valid_until: quote.valid_until || '',
    notes: quote.notes || '',
  });

  const updateQuote = useUpdateQuote();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSave = async () => {
    try {
      await updateQuote.mutateAsync({
        id: quote.id,
        ...editData,
      });
      setIsEditing(false);
      toast({
        title: "Quote Updated",
        description: "Quote has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      status: quote.status,
      subtotal: quote.subtotal || 0,
      tax_rate: quote.tax_rate || 0,
      tax_amount: quote.tax_amount || 0,
      total_amount: quote.total_amount || 0,
      valid_until: quote.valid_until || '',
      notes: quote.notes || '',
    });
    setIsEditing(false);
  };

  const handleEmailQuote = () => {
    toast({
      title: "Email Quote",
      description: "Email functionality would be implemented here",
    });
  };

  const handleDownloadQuote = () => {
    toast({
      title: "Download Quote",
      description: "Download functionality would be implemented here",
    });
  };

  return (
    <QuoteErrorBoundary>
      <Dialog>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Quote
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                Quote {quote.quote_number}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created: {new Date(quote.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(quote.status)}>
                {quote.status}
              </Badge>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={editData.status}
                      onValueChange={(value) => setEditData({ ...editData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valid Until</label>
                    <Input
                      type="date"
                      value={editData.valid_until}
                      onChange={(e) => setEditData({ ...editData, valid_until: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subtotal ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.subtotal}
                      onChange={(e) => setEditData({ ...editData, subtotal: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tax Rate (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.tax_rate * 100}
                      onChange={(e) => {
                        const rate = parseFloat(e.target.value) / 100 || 0;
                        const taxAmount = editData.subtotal * rate;
                        setEditData({ 
                          ...editData, 
                          tax_rate: rate,
                          tax_amount: taxAmount,
                          total_amount: editData.subtotal + taxAmount
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tax Amount ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.tax_amount}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Amount ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.total_amount}
                      disabled
                      className="bg-muted font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Valid Until</p>
                    <p className="font-medium">
                      {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="font-medium">${quote.subtotal?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tax ({((quote.tax_rate || 0) * 100).toFixed(1)}%)</p>
                    <p className="font-medium">${quote.tax_amount?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold text-primary">${quote.total_amount?.toFixed(2) || '0.00'}</p>
                  </div>
                  {quote.notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm">{quote.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              {!isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={handleEmailQuote}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Quote
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadQuote}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </>
              )}
            </div>
            
            {isEditing && (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateQuote.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateQuote.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </QuoteErrorBoundary>
  );
};