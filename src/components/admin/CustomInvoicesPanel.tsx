import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Check, Loader2, Receipt, ExternalLink, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface CustomInvoice {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string;
  due_date: string | null;
  paid_at: string | null;
  stripe_invoice_id: string | null;
  hosted_url: string | null;
  pdf_url: string | null;
  payment_type: 'setup' | 'subscription' | 'custom';
  notes: string | null;
  created_at: string;
}

interface CustomInvoicesPanelProps {
  userId: string;
}

export function CustomInvoicesPanel({ userId }: CustomInvoicesPanelProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<CustomInvoice | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'GBP',
    status: 'pending' as 'pending' | 'paid',
    invoice_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: '',
    payment_type: 'custom' as 'setup' | 'subscription' | 'custom',
    hosted_url: '',
    pdf_url: '',
    notes: '',
  });

  // Fetch invoices for this user
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['admin-custom-invoices', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_invoices')
        .select('*')
        .eq('user_id', userId)
        .order('invoice_date', { ascending: false });

      if (error) throw error;
      return data as CustomInvoice[];
    },
  });

  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: async (data: { description: string; amount: number; currency: string; status: string; invoice_date: string; due_date: string | null; payment_type: string; hosted_url: string | null; pdf_url: string | null; notes: string | null; paid_at: string | null }) => {
      const { data: result, error } = await supabase
        .from('custom_invoices')
        .insert([{ ...data, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-invoices', userId] });
      toast.success('Invoice created successfully');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    },
  });

  // Update invoice mutation
  const updateInvoice = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CustomInvoice> }) => {
      const { data: result, error } = await supabase
        .from('custom_invoices')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-invoices', userId] });
      toast.success('Invoice updated successfully');
      resetForm();
      setIsDialogOpen(false);
      setEditingInvoice(null);
    },
    onError: (error) => {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
    },
  });

  // Mark as paid mutation
  const markAsPaid = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from('custom_invoices')
        .update({ 
          status: 'paid', 
          paid_at: new Date().toISOString() 
        })
        .eq('id', invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-invoices', userId] });
      toast.success('Invoice marked as paid');
    },
    onError: (error) => {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to update invoice');
    },
  });

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      currency: 'GBP',
      status: 'pending',
      invoice_date: format(new Date(), 'yyyy-MM-dd'),
      due_date: '',
      payment_type: 'custom',
      hosted_url: '',
      pdf_url: '',
      notes: '',
    });
  };

  const handleEdit = (invoice: CustomInvoice) => {
    setEditingInvoice(invoice);
    setFormData({
      description: invoice.description,
      amount: String(invoice.amount),
      currency: invoice.currency,
      status: invoice.status === 'paid' ? 'paid' : 'pending',
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date || '',
      payment_type: invoice.payment_type,
      hosted_url: invoice.hosted_url || '',
      pdf_url: invoice.pdf_url || '',
      notes: invoice.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      status: formData.status,
      invoice_date: formData.invoice_date,
      due_date: formData.due_date || null,
      payment_type: formData.payment_type,
      hosted_url: formData.hosted_url || null,
      pdf_url: formData.pdf_url || null,
      notes: formData.notes || null,
      paid_at: formData.status === 'paid' ? new Date().toISOString() : null,
    };

    if (editingInvoice) {
      updateInvoice.mutate({ id: editingInvoice.id, data });
    } else {
      createInvoice.mutate(data);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
      overdue: { label: 'Overdue', className: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Custom Invoices
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
            setEditingInvoice(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create Custom Invoice'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Annual Software 50% payment"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="1550.00"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Type</Label>
                  <Select
                    value={formData.payment_type}
                    onValueChange={(value: 'setup' | 'subscription' | 'custom') => 
                      setFormData({ ...formData, payment_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="setup">Setup</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'pending' | 'paid') => 
                      setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Due Date (optional)</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Hosted Invoice URL (optional)</Label>
                <Input
                  value={formData.hosted_url}
                  onChange={(e) => setFormData({ ...formData, hosted_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>PDF URL (optional)</Label>
                <Input
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes about this invoice"
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={createInvoice.isPending || updateInvoice.isPending || !formData.description || !formData.amount}
              >
                {(createInvoice.isPending || updateInvoice.isPending) ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !invoices || invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No custom invoices for this account
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.description}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {invoice.payment_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {invoice.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsPaid.mutate(invoice.id)}
                            disabled={markAsPaid.isPending}
                            title="Mark as Paid"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(invoice)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {invoice.hosted_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(invoice.hosted_url!, '_blank')}
                            title="View"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.pdf_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(invoice.pdf_url!, '_blank')}
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
        )}
      </CardContent>
    </Card>
  );
}
