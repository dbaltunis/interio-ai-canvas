import React, { useState } from "react";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, CheckCircle2, XCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { ShopifyOAuthGuide } from "./ShopifyOAuthGuide";
import { useAuth } from "@/components/auth/AuthProvider";
import { useHasPermission } from "@/hooks/usePermissions";

type ShopifyIntegration = Database['public']['Tables']['shopify_integrations']['Row'];
type ShopifyIntegrationUpdate = Database['public']['Tables']['shopify_integrations']['Update'];

interface ShopifySetupTabProps {
  integration?: ShopifyIntegration | null;
  onSuccess?: () => void;
}

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

interface TestResult {
  success: boolean;
  shop?: {
    name: string;
    email: string;
    domain: string;
    myshopify_domain: string;
    plan_name: string;
    currency: string;
  };
  error?: string;
  error_type?: string;
}

export const ShopifySetupTab = ({ integration, onSuccess }: ShopifySetupTabProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirm = useConfirmDialog();
  const [isLoading, setIsLoading] = useState(false);
  
  const [shopDomain, setShopDomain] = useState(integration?.shop_domain || "");
  const [clientId, setClientId] = useState(integration?.client_id || "");
  const [clientSecret, setClientSecret] = useState("");
  const [showClientSecret, setShowClientSecret] = useState(false);
  
  // Connection test state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Permission check using centralized hook
  const canManageShopify = useHasPermission('manage_shopify') !== false;

  // Extract myshopify.com domain from various formats
  const extractShopDomain = (input: string): string => {
    let domain = input.replace(/^https?:\/\//, '');
    const adminMatch = domain.match(/admin\.shopify\.com\/store\/([^\/]+)/);
    if (adminMatch) {
      return `${adminMatch[1]}.myshopify.com`;
    }
    domain = domain.split('/')[0];
    if (domain.includes('.myshopify.com')) {
      return domain;
    }
    if (!domain.includes('.')) {
      return `${domain}.myshopify.com`;
    }
    return domain;
  };

  const handleTestConnection = async () => {
    if (!canManageShopify) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage Shopify settings.",
        variant: "destructive"
      });
      return;
    }
    if (!shopDomain || !clientId || !clientSecret) {
      toast({
        title: "Missing Information",
        description: "Please enter your store URL, Client ID, and Client Secret",
        variant: "destructive"
      });
      return;
    }

    setConnectionStatus('testing');
    setTestResult(null);

    try {
      const normalizedDomain = extractShopDomain(shopDomain);
      
      const { data, error } = await supabase.functions.invoke('shopify-test-connection', {
        body: { 
          shop_domain: normalizedDomain, 
          client_id: clientId,
          client_secret: clientSecret
        }
      });

      if (error) throw error;

      setTestResult(data);
      
      if (data.success) {
        setConnectionStatus('success');
        toast({
          title: "Connection Successful! 🎉",
          description: `Connected to ${data.shop?.name || normalizedDomain}`,
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection Failed",
          description: data.error || "Could not connect to Shopify",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Test connection error:', error);
      setConnectionStatus('error');
      setTestResult({ success: false, error: error.message });
      toast({
        title: "Connection Test Failed",
        description: error.message || "An error occurred while testing the connection",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!canManageShopify) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage Shopify settings.",
        variant: "destructive"
      });
      return;
    }
    if (!shopDomain || !clientId || !clientSecret) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    // If not tested, test first
    if (connectionStatus !== 'success') {
      toast({
        title: "Please Test Connection First",
        description: "Click 'Test Connection' to verify your credentials before connecting.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const normalizedDomain = extractShopDomain(shopDomain);
      
      // Get the access token from the test result (it was already fetched)
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('shopify-test-connection', {
        body: { 
          shop_domain: normalizedDomain, 
          client_id: clientId,
          client_secret: clientSecret,
          save_token: true
        }
      });

      if (tokenError) throw tokenError;
      if (!tokenData.success) throw new Error(tokenData.error);

      const { data, error } = await supabase
        .from('shopify_integrations')
        .upsert([{
          user_id: user.id,
          shop_domain: normalizedDomain,
          client_id: clientId,
          client_secret: clientSecret,
          access_token: tokenData.access_token,
          token_expires_at: tokenData.token_expires_at,
          is_connected: true,
        }], {
          onConflict: 'user_id,shop_domain',
        })
        .select()
        .single();

      if (error) throw error;

      // Ensure Shopify job statuses exist for this user
      const { error: statusError } = await supabase.rpc('ensure_shopify_statuses', {
        p_user_id: user.id
      });

      if (statusError) {
        console.error('Failed to create Shopify statuses:', statusError);
      }

      queryClient.invalidateQueries({ queryKey: ["shopify-integration"] });
      queryClient.invalidateQueries({ queryKey: ["job_statuses"] });
      toast({
        title: "Success! 🎉",
        description: `Connected to ${testResult?.shop?.name || normalizedDomain}`,
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!canManageShopify) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage Shopify settings.",
        variant: "destructive"
      });
      return;
    }
    const confirmed = await confirm({
      title: "Disconnect Store",
      description: "Are you sure you want to disconnect this Shopify store? This will stop all syncing.",
      confirmLabel: "Disconnect",
      variant: "destructive",
    });
    if (!confirmed) {
      return;
    }
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase
        .from('shopify_integrations')
        .update({ is_connected: false })
        .eq('user_id', user.id);

      queryClient.invalidateQueries({ queryKey: ["shopify-integration"] });
      toast({
        title: "Success",
        description: "Shopify store disconnected successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchStore = async () => {
    if (!canManageShopify) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage Shopify settings.",
        variant: "destructive"
      });
      return;
    }
    const confirmed = await confirm({
      title: "Switch Store",
      description: "Switch to a different store? You can enter new credentials below.",
      confirmLabel: "Switch",
    });
    if (confirmed) {
      setShopDomain("");
      setClientId("");
      setClientSecret("");
      setConnectionStatus('idle');
      setTestResult(null);
    }
  };

  const isDisconnected = integration?.shop_domain && !integration?.is_connected;
  const canConnect = shopDomain && clientId && clientSecret && connectionStatus === 'success';

  return (
    <div className="space-y-6">
      {!canManageShopify && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <p className="font-semibold text-orange-900 mb-1">Permission Required</p>
            <p className="text-sm text-orange-800">
              You don't have permission to manage Shopify settings. Contact your administrator to configure Shopify integration.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {integration?.is_connected && !integration?.access_token && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <p className="font-semibold text-orange-900 mb-1">Connection Incomplete</p>
            <p className="text-sm text-orange-800">
              Your store ({integration.shop_domain}) shows as connected but is missing API credentials. 
              Please re-enter your credentials below to complete the connection.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {integration?.is_connected && integration?.access_token && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">✅ Store Connected</p>
                  <p className="text-sm text-green-800">{integration.shop_domain}</p>
                  <p className="text-xs text-green-700 mt-1">
                    Last synced: {integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSwitchStore}
                  disabled={!canManageShopify}
                  className="w-full"
                >
                  Change Store
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDisconnect} 
                  disabled={isLoading || (!canManageShopify)}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                  Disconnect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isDisconnected && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <p className="font-semibold text-yellow-900 mb-1">Store Disconnected</p>
            <p className="text-sm text-yellow-800 mb-3">
              Your previous store ({integration.shop_domain}) is no longer connected. 
              You can reconnect this store or connect a different one below.
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleSwitchStore}
              disabled={!canManageShopify}
              className="bg-white"
            >
              Connect Different Store
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>
            {isDisconnected ? "Reconnect or Change Store" : "Connect Your Shopify Store"}
          </CardTitle>
          <CardDescription>
            {isDisconnected 
              ? "Enter credentials below to reconnect or connect a different store"
              : "Enter your Shopify app credentials. Follow the guide below to get them."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Shop Domain */}
          <div>
            <Label htmlFor="shop-domain">
              Your Shopify Store URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="shop-domain"
              value={shopDomain}
              onChange={(e) => {
                setShopDomain(e.target.value);
                setConnectionStatus('idle');
                setTestResult(null);
              }}
              placeholder="my-store.myshopify.com"
              className="font-mono mt-1.5"
              disabled={!canManageShopify}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              This is your store's <code className="bg-muted px-1 rounded">.myshopify.com</code> URL (not your custom domain)
            </p>
          </div>

          {/* Help Guide */}
          <ShopifyOAuthGuide shopDomain={shopDomain} />

          {/* Client ID */}
          <div>
            <Label htmlFor="client-id">
              Client ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client-id"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setConnectionStatus('idle');
                setTestResult(null);
              }}
              placeholder="Copy from Settings page in Dev Dashboard"
              className="font-mono mt-1.5"
              disabled={!canManageShopify}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Found on the <strong>Settings</strong> page of your app in the Dev Dashboard
            </p>
          </div>

          {/* Client Secret */}
          <div>
            <Label htmlFor="client-secret">
              Client Secret <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="client-secret"
                type={showClientSecret ? "text" : "password"}
                value={clientSecret}
                onChange={(e) => {
                  setClientSecret(e.target.value);
                  setConnectionStatus('idle');
                  setTestResult(null);
                }}
                placeholder="Click 'Manage client credentials' to reveal"
                className="font-mono pr-10"
                disabled={!canManageShopify}
              />
              <button
                type="button"
                onClick={() => setShowClientSecret(!showClientSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Click <strong>"Manage client credentials"</strong> on Settings page, then copy the secret
            </p>
          </div>

          {/* Connection test result */}
          {testResult && (
            <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-destructive/20 bg-destructive/5'}>
              {testResult.success ? (
                <ShieldCheck className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <AlertDescription>
                {testResult.success ? (
                  <div className="text-green-900">
                    <p className="font-semibold mb-1">✅ Connection verified!</p>
                    <p className="text-sm">
                      Store: <strong>{testResult.shop?.name}</strong>
                      {testResult.shop?.plan_name && ` (${testResult.shop.plan_name})`}
                    </p>
                  </div>
                ) : (
                  <div className="text-destructive">
                    <p className="font-semibold mb-1">❌ Connection failed</p>
                    <p className="text-sm">{testResult.error}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleTestConnection} 
              disabled={connectionStatus === 'testing' || !shopDomain || !clientId || !clientSecret || (!canManageShopify)}
              className="flex-1"
            >
              {connectionStatus === 'testing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : connectionStatus === 'success' ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  Verified ✓
                </>
              ) : connectionStatus === 'error' ? (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Retry Test
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !canConnect || (!canManageShopify)} 
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                isDisconnected ? "Reconnect Store" : "Connect Store"
              )}
            </Button>
          </div>
          
          {shopDomain && clientId && clientSecret && connectionStatus !== 'success' && (
            <p className="text-xs text-muted-foreground text-center">
              👆 Please test your connection before connecting
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
