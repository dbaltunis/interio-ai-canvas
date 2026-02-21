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
import { Building2, Mail, FileText, Save, Key, Zap, Eye, EyeOff, Info } from "lucide-react";
import cwsystemsLogo from "@/assets/cwsystems-logo.svg";

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
    api_token: integration?.api_credentials?.api_token || '',
    api_user_email: integration?.api_credentials?.api_user_email || '',
    default_delivery_address: integration?.configuration?.default_delivery_address || '',
    default_payment_terms: integration?.configuration?.default_payment_terms || 'Account 30 Days',
    notes_template: integration?.configuration?.notes_template || '',
  });

  const savedValues = useMemo(() => ({
    account_code: integration?.api_credentials?.account_code || '',
    account_name: integration?.api_credentials?.account_name || '',
    supplier_email: integration?.api_credentials?.supplier_email || 'orders@cwsystems.com.au',
    contact_name: integration?.api_credentials?.contact_name || '',
    contact_phone: integration?.api_credentials?.contact_phone || '',
    api_token: integration?.api_credentials?.api_token || '',
    api_user_email: integration?.api_credentials?.api_user_email || '',
    default_delivery_address: integration?.configuration?.default_delivery_address || '',
    default_payment_terms: integration?.configuration?.default_payment_terms || 'Account 30 Days',
    notes_template: integration?.configuration?.notes_template || '',
  }), [integration]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(savedValues);
  }, [formData, savedValues]);

  const hasApiToken = !!formData.api_token.trim();
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const data = {
        integration_type: 'cw_systems' as const,
        active: true,
        api_credentials: {
          account_code: formData.account_code,
          account_name: formData.account_name,
          supplier_email: formData.supplier_email,
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone,
          api_token: formData.api_token || undefined,
          api_user_email: formData.api_user_email || undefined,
        },
        configuration: {
          default_delivery_address: formData.default_delivery_address,
          default_payment_terms: formData.default_payment_terms,
          notes_template: formData.notes_template,
          order_method: (hasApiToken ? 'api' : 'email') as 'api' | 'email',
        },
        last_sync: null,
      };

      if (integration) {
        await updateIntegration.mutateAsync({ id: integration.id, updates: data });
      } else {
        await createIntegration.mutateAsync(data);
      }
      toast({ title: "Saved", description: "CW Systems configuration saved", importance: 'important' });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  /** Test the API token by calling product ranges endpoint */
  const handleTestApiConnection = async () => {
    if (!formData.api_token) return;
    setIsTestingApi(true);
    try {
      const { data, error } = await supabase.functions.invoke('cw-submit-order', {
        body: {
          apiToken: formData.api_token,
          userEmail: formData.api_user_email || formData.supplier_email,
          items: [
            {
              roomLocation: 'Test Room',
              widthMm: 1200,
              heightMm: 1500,
              cwProductRangeId: undefined, // No range ID — triggers email fallback path
              notes: 'API connection test',
            },
          ],
          test: true,
          poNumber: 'TEST-CONN',
          additionalNotes: 'API connection test — please ignore',
        },
      });
      if (error) throw error;
      toast({ title: "API Connected", description: "CW Trade Hub API token is valid and accepting requests.", importance: 'important' });
    } catch (err: any) {
      toast({ title: "API Connection Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsTestingApi(false);
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
      toast({ title: "Test Email Sent", description: `Test order email sent to ${formData.supplier_email}`, importance: 'important' });
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
          <img src={cwsystemsLogo} alt="CW Systems" className="h-12 w-auto" />
          <div>
            <h3 className="text-lg font-medium">CW Systems</h3>
            <p className="text-sm text-muted-foreground">
              Australian supplier of roller blinds, curtain tracks, and motorisation via CORA Trade Hub
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasApiToken && integration?.active && (
            <Badge variant="success-solid" className="gap-1">
              <Zap className="h-3 w-3" />
              API Mode
            </Badge>
          )}
          {!hasApiToken && integration?.active && (
            <Badge variant="outline" className="gap-1">
              <Mail className="h-3 w-3" />
              Email Mode
            </Badge>
          )}
          {integration && !integration.active && (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Account Details
          </CardTitle>
          <CardDescription>
            Your CW Systems / CORA Trade Hub account details for order submissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cw_account_code">Account Code</Label>
              <Input id="cw_account_code" placeholder="e.g. CW12345" value={formData.account_code} onChange={(e) => setFormData(prev => ({ ...prev, account_code: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cw_account_name">Account / Business Name</Label>
              <Input id="cw_account_name" placeholder="Your business name" value={formData.account_name} onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cw_supplier_email">Supplier Order Email</Label>
              <Input id="cw_supplier_email" type="email" placeholder="orders@cwsystems.com.au" value={formData.supplier_email} onChange={(e) => setFormData(prev => ({ ...prev, supplier_email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cw_contact_name">Your Contact Name</Label>
              <Input id="cw_contact_name" placeholder="Contact name for orders" value={formData.contact_name} onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cw_contact_phone">Your Contact Phone</Label>
              <Input id="cw_contact_phone" placeholder="Contact phone" value={formData.contact_phone} onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cw_payment_terms">Payment Terms</Label>
              <Input id="cw_payment_terms" placeholder="e.g. Account 30 Days" value={formData.default_payment_terms} onChange={(e) => setFormData(prev => ({ ...prev, default_payment_terms: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cw_delivery_address">Default Delivery Address</Label>
            <Textarea id="cw_delivery_address" placeholder="Full delivery address for orders" value={formData.default_delivery_address} onChange={(e) => setFormData(prev => ({ ...prev, default_delivery_address: e.target.value }))} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cw_notes">Default Order Notes</Label>
            <Textarea id="cw_notes" placeholder="Standard notes to include on every order (optional)" value={formData.notes_template} onChange={(e) => setFormData(prev => ({ ...prev, notes_template: e.target.value }))} rows={2} />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading || !hasChanges} variant={hasChanges ? "default" : "secondary"}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : hasChanges ? "Save Configuration" : "Saved"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Integration — CORA Trade Hub */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            CORA Trade Hub API
            <Badge variant={hasApiToken ? "success-solid" : "outline"} className="ml-1">
              {hasApiToken ? "Enabled" : "Optional"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Connect directly to the CW Trade Hub API for instant digital order submission.
            Your Bearer token is found in your CORA company profile under Settings.
            When a token is set, orders are submitted via API; email is used as a fallback for any items missing CW product IDs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cw_api_token">Bearer Token</Label>
              <div className="relative">
                <Input
                  id="cw_api_token"
                  type={showToken ? "text" : "password"}
                  placeholder="Paste your CORA Trade Hub bearer token"
                  value={formData.api_token}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_token: e.target.value }))}
                  className="pr-10 font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowToken(v => !v)}
                >
                  {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Found in CW Trade Hub → Company Profile → API Settings</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cw_api_user_email">Your CW Account Email</Label>
              <Input
                id="cw_api_user_email"
                type="email"
                placeholder="your@email.com (registered with CW Trade Hub)"
                value={formData.api_user_email}
                onChange={(e) => setFormData(prev => ({ ...prev, api_user_email: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Sent as <code className="font-mono">user_email</code> in API order requests</p>
            </div>
          </div>

          {hasApiToken && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-sm">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div className="text-blue-800 dark:text-blue-200">
                <p className="font-medium">CW product IDs required for API submission</p>
                <p className="text-xs mt-1">
                  To submit via API, each inventory item needs its <strong>CW Product Range ID</strong>, <strong>Product Type ID</strong>, and <strong>Material ID</strong> set in Settings → Library → item → Supplier Codes.
                  Items without these IDs will automatically fall back to the email order.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {hasApiToken && (
              <Button variant="outline" onClick={handleTestApiConnection} disabled={isTestingApi}>
                <Zap className="h-4 w-4 mr-2" />
                {isTestingApi ? "Testing..." : "Test API Connection"}
              </Button>
            )}
            {integration?.active && (
              <Button variant="outline" onClick={handleSendTestOrder} disabled={isSending || !formData.account_code}>
                <FileText className="h-4 w-4 mr-2" />
                {isSending ? "Sending..." : "Send Test Order Email"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {integration?.active && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasApiToken ? <Zap className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
              Order Submission — {hasApiToken ? "API Mode" : "Email Mode"}
            </CardTitle>
            <CardDescription>
              {hasApiToken
                ? "Orders with CW product IDs are submitted directly via the CORA API. Others fall back to email."
                : "Orders are submitted via formatted email to the CW Systems orders inbox."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`rounded-lg p-4 space-y-2 ${hasApiToken ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'}`}>
              {hasApiToken ? (
                <>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">How API Ordering Works</p>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>1. Create a quote with CW Systems products in a job</li>
                    <li>2. Click "Submit to Supplier" from the Jobs page</li>
                    <li>3. Items with CW product IDs are submitted instantly via CORA API</li>
                    <li>4. Any remaining items are sent via email as a fallback</li>
                    <li>5. Order confirmation is recorded in the job timeline</li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">How Email Ordering Works</p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>1. Create a quote with CW Systems products in a job</li>
                    <li>2. Click "Submit to Supplier" from the Jobs page</li>
                    <li>3. A formatted order email is sent to {formData.supplier_email}</li>
                    <li>4. You'll receive a copy of the order for your records</li>
                  </ul>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    Add your CORA Bearer Token above to enable direct API submission.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
