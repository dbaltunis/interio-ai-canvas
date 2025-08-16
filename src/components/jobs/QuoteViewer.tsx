
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUpdateQuote } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { Eye, Edit, Mail, Download, Save, X, Copy, User, MapPin, Calendar, FileText, Package } from "lucide-react";

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
  clients?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  projects?: {
    id: string;
    name: string;
    address?: string;
  };
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

  const handleCopyQuote = () => {
    toast({
      title: "Copy Quote",
      description: "Create a new quote based on this one - functionality would be implemented here",
    });
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
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Quote
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
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
          {/* Client & Project Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="font-medium">{quote.clients?.name || 'No client assigned'}</p>
                  {quote.clients?.email && (
                    <p className="text-sm text-muted-foreground">{quote.clients.email}</p>
                  )}
                  {quote.clients?.phone && (
                    <p className="text-sm text-muted-foreground">{quote.clients.phone}</p>
                  )}
                </div>
                {quote.clients?.address && (
                  <div className="flex items-start gap-2 mt-2">
                    <MapPin className="h-3 w-3 mt-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{quote.clients.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="font-medium">{quote.projects?.name || 'No project assigned'}</p>
                  {quote.projects?.address && (
                    <div className="flex items-start gap-2 mt-2">
                      <MapPin className="h-3 w-3 mt-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{quote.projects.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quote Status & Validity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Quote Status & Validity
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valid Until</p>
                    <p className="font-medium">
                      {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote Line Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quote Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Quote line items would be displayed here
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">${quote.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({((quote.tax_rate || 0) * 100).toFixed(1)}%):</span>
                    <span className="font-medium">${quote.tax_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">${quote.total_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={3}
                  placeholder="Add notes about this quote..."
                />
              ) : (
                <p className="text-sm">
                  {quote.notes || 'No notes added to this quote.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between border-t pt-4">
            <div className="flex space-x-2">
              {!isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={handleCopyQuote}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Quote
                  </Button>
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
  );
};
