import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Mail, FileText, Save } from "lucide-react";
import normanLogo from "@/assets/norman-logo.svg";

export const NormanIntegrationTab = () => {
  const { integrations, createIntegration, updateIntegration } = useIntegrations();
  const { toast } = useToast();

  const integration = integrations.find(
    (i) => i.integration_type === "norman_australia"
  ) as any;

  const [formData, setFormData] = useState({
    account_number: integration?.api_credentials?.account_number || '',
    account_name: integration?.api_credentials?.account_name || '',
    supplier_email: integration?.api_credentials?.supplier_email || 'orders@normanaustralia.com.au',
    contact_name: integration?.api_credentials?.contact_name || '',
    contact_phone: integration?.api_credentials?.contact_phone || '',
    default_delivery_address: integration?.configuration?.default_delivery_address || '',
    default_payment_terms: integration?.configuration?.default_payment_terms || 'Account 30 Days',
    notes_template: integration?.configuration?.notes_template || '',
  });

  const savedValues = useMemo(() => ({
    account_number: integration?.api_credentials?.account_number || '',
    account_name: integration?.api_credentials?.account_name || '',
    supplier_email: integration?.api_credentials?.supplier_email || 'orders@normanaustralia.com.au',
    contact_name: integration?.api_credentials?.contact_name || '',
    contact_phone: integration?.api_credentials?.contact_phone || '',
    default_delivery_address: integration?.configuration?.default_delivery_address || '',
    default_payment_terms: integration?.configuration?.default_payment_terms || 'Account 30 Days',
    notes_template: integration?.configuration?.notes_template || '',
  }), [integration]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(savedValues);
  }, [formData, savedValues]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const data = {
        integration_type: 'norman_australia' as const,
        active: true,
        api_credentials: {
          account_number: formData.account_number,
          account_name: formData.account_name,
          supplier_email: formData.supplier_email,
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone,
        },
        configuration: {
          default_delivery_address: formData.default_delivery_address,
          default_payment_terms: formData.default_payment_terms,
          notes_template: formData.notes_template,
          order_method: 'email' as const,
        },
        last_sync: null,
      };

      if (integration) {
        await updateIntegration.mutateAsync({ id: integration.id, updates: data });
      } else {
        await createIntegration.mutateAsync(data);
      }
      toast({ title: "Saved", description: "Norman Australia configuration saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestOrder = async () => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-supplier-order-email', {
        body: {
          supplier: 'norman_australia',
          test: true,
          orderData: {
            accountNumber: formData.account_number,
            accountName: formData.account_name,
            supplierEmail: formData.supplier_email,
            deliveryAddress: formData.default_delivery_address,
            paymentTerms: formData.default_payment_terms,
            items: [
              { code: 'TEST-001', description: 'Test Item - Plantation Shutter', quantity: 1, width: '900mm', height: '1200mm', color: 'Silk White', notes: 'Test order - please ignore' }
            ],
            notes: 'THIS IS A TEST ORDER - PLEASE IGNORE',
          },
        },
      });

      if (error) throw error;
      toast({ title: "Test Email Sent", description: `Test order email sent to ${formData.supplier_email}` });
    } catch (err: any) {
      toast({ title: "Send Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={normanLogo} alt="Norman" className="h-12 w-auto" />
          <div>
            <h3 className="text-lg font-medium">Norman Australia</h3>
            <p className="text-sm text-muted-foreground">Premium shutters, blinds, and awnings supplier</p>
          </div>
        </div>
        {integration && (
          (() => {
            if (!integration.active) return <Badge variant="secondary">Inactive</Badge>;
            if (integration.last_sync) return <Badge variant="success-solid">Connected</Badge>;
            return <Badge variant="outline">Configured</Badge>;
          })()
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Account Details
          </CardTitle>
          <CardDescription>
            Your Norman Australia account details for order submissions.
            Orders are sent via email as Norman uses a portal-based ordering system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nm_account_number">Account Number</Label>
              <Input id="nm_account_number" placeholder="Your Norman account number" value={formData.account_number} onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nm_account_name">Account / Business Name</Label>
              <Input id="nm_account_name" placeholder="Your business name" value={formData.account_name} onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nm_supplier_email">Supplier Order Email</Label>
              <Input id="nm_supplier_email" type="email" placeholder="orders@normanaustralia.com.au" value={formData.supplier_email} onChange={(e) => setFormData(prev => ({ ...prev, supplier_email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nm_contact_name">Your Contact Name</Label>
              <Input id="nm_contact_name" placeholder="Contact name for orders" value={formData.contact_name} onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nm_contact_phone">Your Contact Phone</Label>
              <Input id="nm_contact_phone" placeholder="Contact phone" value={formData.contact_phone} onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nm_payment_terms">Payment Terms</Label>
              <Input id="nm_payment_terms" placeholder="e.g. Account 30 Days" value={formData.default_payment_terms} onChange={(e) => setFormData(prev => ({ ...prev, default_payment_terms: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nm_delivery_address">Default Delivery Address</Label>
            <Textarea id="nm_delivery_address" placeholder="Full delivery address for orders" value={formData.default_delivery_address} onChange={(e) => setFormData(prev => ({ ...prev, default_delivery_address: e.target.value }))} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nm_notes">Default Order Notes</Label>
            <Textarea id="nm_notes" placeholder="Standard notes to include on every order (optional)" value={formData.notes_template} onChange={(e) => setFormData(prev => ({ ...prev, notes_template: e.target.value }))} rows={2} />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading || !hasChanges} variant={hasChanges ? "default" : "secondary"}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : hasChanges ? "Save Configuration" : "Saved"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {integration?.active && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Order Submission
            </CardTitle>
            <CardDescription>
              Orders are submitted via formatted email. You can also upload orders through the Norman portal at orders.normanaustralia.com.au.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">How Email Ordering Works</p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1. Create a quote with Norman products (shutters, blinds, awnings)</li>
                <li>2. Click "Submit to Supplier" from the Jobs page</li>
                <li>3. A formatted order email is sent to {formData.supplier_email}</li>
                <li>4. You'll receive a copy of the order for your records</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSendTestOrder} disabled={isSending || !formData.account_number}>
                <FileText className="h-4 w-4 mr-2" />
                {isSending ? "Sending..." : "Send Test Order Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
