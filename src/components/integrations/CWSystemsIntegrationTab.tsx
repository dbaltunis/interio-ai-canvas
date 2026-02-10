import { useState } from "react";
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

export const CWSystemsIntegrationTab = () => {
  const { integrations, createIntegration, updateIntegration } = useIntegrations();
  const { toast } = useToast();

  const integration = integrations.find(
    (i) => i.integration_type === "cw_systems"
  ) as any;

  const [formData, setFormData] = useState({
    account_code: integration?.api_credentials?.account_code || '',
    account_name: integration?.api_credentials?.account_name || '',
    supplier_email: integration?.api_credentials?.supplier_email || 'orders@cwsystems.com.au',
    contact_name: integration?.api_credentials?.contact_name || '',
    contact_phone: integration?.api_credentials?.contact_phone || '',
    default_delivery_address: integration?.configuration?.default_delivery_address || '',
    default_payment_terms: integration?.configuration?.default_payment_terms || 'Account 30 Days',
    notes_template: integration?.configuration?.notes_template || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const data = {
        integration_type: 'cw_systems',
        active: true,
        api_credentials: {
          account_code: formData.account_code,
          account_name: formData.account_name,
          supplier_email: formData.supplier_email,
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone,
        },
        configuration: {
          default_delivery_address: formData.default_delivery_address,
          default_payment_terms: formData.default_payment_terms,
          notes_template: formData.notes_template,
          order_method: 'email',
        },
        last_sync: null,
      };

      if (integration) {
        await updateIntegration.mutateAsync({ id: integration.id, updates: data });
      } else {
        await createIntegration.mutateAsync(data);
      }
      toast({ title: "Saved", description: "CW Systems configuration saved" });
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
          supplier: 'cw_systems',
          test: true,
          orderData: {
            accountCode: formData.account_code,
            accountName: formData.account_name,
            supplierEmail: formData.supplier_email,
            deliveryAddress: formData.default_delivery_address,
            paymentTerms: formData.default_payment_terms,
            items: [
              { code: 'TEST-001', description: 'Test Item - Roller Blind', quantity: 1, width: '1200mm', drop: '1500mm', color: 'White', notes: 'Test order - please ignore' }
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
        <div>
          <h3 className="text-lg font-medium">CW Systems</h3>
          <p className="text-sm text-muted-foreground">
            Australian supplier of roller blinds, curtain tracks, and motorisation via CORA Trade Hub
          </p>
        </div>
        {integration && (
          <Badge variant={integration.active ? "default" : "secondary"}>
            {integration.active ? "Active" : "Inactive"}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Account Details
          </CardTitle>
          <CardDescription>
            Your CW Systems / CORA Trade Hub account details for order submissions.
            Orders are sent via email as CW Systems does not offer a public API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cw_account_code">Account Code</Label>
              <Input
                id="cw_account_code"
                placeholder="e.g. CW12345"
                value={formData.account_code}
                onChange={(e) => setFormData(prev => ({ ...prev, account_code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cw_account_name">Account / Business Name</Label>
              <Input
                id="cw_account_name"
                placeholder="Your business name"
                value={formData.account_name}
                onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cw_supplier_email">Supplier Order Email</Label>
              <Input
                id="cw_supplier_email"
                type="email"
                placeholder="orders@cwsystems.com.au"
                value={formData.supplier_email}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier_email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cw_contact_name">Your Contact Name</Label>
              <Input
                id="cw_contact_name"
                placeholder="Contact name for orders"
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cw_contact_phone">Your Contact Phone</Label>
              <Input
                id="cw_contact_phone"
                placeholder="Contact phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cw_payment_terms">Payment Terms</Label>
              <Input
                id="cw_payment_terms"
                placeholder="e.g. Account 30 Days"
                value={formData.default_payment_terms}
                onChange={(e) => setFormData(prev => ({ ...prev, default_payment_terms: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cw_delivery_address">Default Delivery Address</Label>
            <Textarea
              id="cw_delivery_address"
              placeholder="Full delivery address for orders"
              value={formData.default_delivery_address}
              onChange={(e) => setFormData(prev => ({ ...prev, default_delivery_address: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cw_notes">Default Order Notes</Label>
            <Textarea
              id="cw_notes"
              placeholder="Standard notes to include on every order (optional)"
              value={formData.notes_template}
              onChange={(e) => setFormData(prev => ({ ...prev, notes_template: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Configuration"}
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
              Orders are submitted via formatted email. You can send a test order or submit from the Jobs page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                How Email Ordering Works
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1. Create a quote with CW Systems products in a job</li>
                <li>2. Click "Submit to Supplier" from the Jobs page</li>
                <li>3. A formatted order email is sent to {formData.supplier_email}</li>
                <li>4. You'll receive a copy of the order for your records</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSendTestOrder}
                disabled={isSending || !formData.account_code}
              >
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
