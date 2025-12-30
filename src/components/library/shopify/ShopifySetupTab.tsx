import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { ShopifyOAuthGuide } from "./ShopifyOAuthGuide";

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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);
  
  const [shopDomain, setShopDomain] = useState(integration?.shop_domain || "");
  const [accessToken, setAccessToken] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  
  // Connection test state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Token validation
  const getTokenValidation = () => {
    if (!accessToken) return { valid: true, message: null, type: null };
    
    if (accessToken.startsWith('shpat_')) {
      return { valid: true, message: 'Valid token format ✓', type: 'success' };
    }
    
    if (accessToken.startsWith('shpss_')) {
      return { 
        valid: false, 
        message: 'This is a Shared Secret, not the Access Token. Look for the "Admin API access token" in the API credentials tab.',
        type: 'shared_secret'
      };
    }
    
    if (accessToken.startsWith('shpca_') || accessToken.startsWith('shppa_')) {
      return { 
        valid: false, 
        message: 'This token type is not supported. Please use the Admin API Access Token (starts with shpat_).',
        type: 'wrong_type'
      };
    }
    
    if (accessToken.length > 10) {
      return { 
        valid: false, 
        message: 'Invalid format. The Admin API access token should start with "shpat_".',
        type: 'invalid'
      };
    }
    
    return { valid: true, message: null, type: null };
  };

  const tokenValidation = getTokenValidation();

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
    if (!shopDomain || !accessToken) {
      toast({
        title: "Missing Information",
        description: "Please enter both your store URL and access token",
        variant: "destructive"
      });
      return;
    }

    if (!tokenValidation.valid) {
      toast({
        title: "Invalid Token Format",
        description: tokenValidation.message,
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
          access_token: accessToken 
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

  const handleOAuthConnect = async () => {
    if (!shopDomain) {
      toast({
        title: "Error",
        description: "Please enter your shop domain first (e.g., your-store.myshopify.com)",
        variant: "destructive"
      });
      return;
    }

    const normalizedDomain = extractShopDomain(shopDomain);
    console.log('Normalized domain:', normalizedDomain);

    setIsConnectingOAuth(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('shopify-oauth-initiate', {
        body: { userId: user.id, shopDomain: normalizedDomain }
      });

      if (error) throw error;

      if (data?.authUrl) {
        console.log('Opening OAuth URL:', data.authUrl);
        
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          data.authUrl,
          'shopify-oauth',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,resizable=yes,scrollbars=yes`
        );

        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          console.error('Popup blocked');
          toast({
            title: "Popup Blocked",
            description: "Please allow popups for this site and try again.",
            variant: "destructive",
          });
          setIsConnectingOAuth(false);
          
          setTimeout(() => {
            if (confirm('Popup was blocked. Open Shopify authorization in this window instead?')) {
              window.location.href = data.authUrl;
            } else {
              setIsConnectingOAuth(false);
            }
          }, 2000);
          return;
        }

        console.log('Popup opened, waiting for OAuth completion...');

        const handleMessage = (event: MessageEvent) => {
          console.log('Received message:', event.data);
          if (event.data?.type === 'shopify-oauth-success') {
            popup?.close();
            setIsConnectingOAuth(false);
            queryClient.invalidateQueries({ queryKey: ["shopify-integration"] });
            toast({
              title: "Success",
              description: "Shopify store connected successfully!",
            });
            onSuccess?.();
            window.removeEventListener('message', handleMessage);
          } else if (event.data?.type === 'shopify-oauth-error') {
            popup?.close();
            setIsConnectingOAuth(false);
            toast({
              title: "Error",
              description: event.data.message || "Failed to connect Shopify store",
              variant: "destructive",
            });
            window.removeEventListener('message', handleMessage);
          }
        };

        window.addEventListener('message', handleMessage);

        const checkPopupClosed = setInterval(() => {
          if (popup?.closed) {
            console.log('Popup closed');
            clearInterval(checkPopupClosed);
            setIsConnectingOAuth(false);
            window.removeEventListener('message', handleMessage);
          }
        }, 500);
      } else {
        throw new Error('Failed to generate OAuth URL');
      }
    } catch (error: any) {
      console.error('OAuth error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate OAuth",
        variant: "destructive"
      });
      setIsConnectingOAuth(false);
    }
  };

  const handleSave = async () => {
    if (!shopDomain) {
      toast({
        title: "Error",
        description: "Shop domain is required",
        variant: "destructive"
      });
      return;
    }

    if (!tokenValidation.valid) {
      toast({
        title: "Invalid Token",
        description: tokenValidation.message,
        variant: "destructive"
      });
      return;
    }

    // If token provided but not tested, test first
    if (accessToken && connectionStatus !== 'success') {
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
      
      const { data, error } = await supabase
        .from('shopify_integrations')
        .upsert([{
          user_id: user.id,
          shop_domain: normalizedDomain,
          access_token: accessToken || undefined,
          webhook_secret: webhookSecret || undefined,
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

  const handleSyncSettingChange = async (field: keyof ShopifyIntegrationUpdate, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('shopify_integrations')
        .update({ [field]: value })
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["shopify-integration"] });
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect this Shopify store? This will stop all syncing.')) {
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

  const handleSwitchStore = () => {
    if (confirm('Switch to a different store? You can enter new credentials below.')) {
      setShopDomain("");
      setAccessToken("");
      setWebhookSecret("");
      setConnectionStatus('idle');
      setTestResult(null);
    }
  };

  const isDisconnected = integration?.shop_domain && !integration?.is_connected;
  const canConnect = shopDomain && accessToken && tokenValidation.valid && connectionStatus === 'success';

  return (
    <div className="space-y-6">
      {integration?.is_connected && !integration?.access_token && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <p className="font-semibold text-orange-900 mb-1">Connection Incomplete</p>
            <p className="text-sm text-orange-800">
              Your store ({integration.shop_domain}) shows as connected but is missing API credentials. 
              Please re-enter your access token below to complete the connection.
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
                  className="w-full"
                >
                  Change Store
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDisconnect} 
                  disabled={isLoading}
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
              : "Enter your Shopify store credentials. Follow the guide below to get your API token."
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
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              This is your store's <code className="bg-muted px-1 rounded">.myshopify.com</code> URL (not your custom domain)
            </p>
          </div>

          {/* Help Guide */}
          <ShopifyOAuthGuide shopDomain={shopDomain} />

          {/* Access Token with validation feedback */}
          <div>
            <Label htmlFor="access-token">
              Admin API Access Token <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="access-token"
                type="password"
                value={accessToken}
                onChange={(e) => {
                  setAccessToken(e.target.value);
                  setConnectionStatus('idle');
                  setTestResult(null);
                }}
                placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
                className={`font-mono pr-10 ${
                  !tokenValidation.valid ? 'border-destructive focus-visible:ring-destructive' : 
                  tokenValidation.type === 'success' ? 'border-green-500 focus-visible:ring-green-500' : ''
                }`}
              />
              {accessToken && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {tokenValidation.valid && tokenValidation.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : !tokenValidation.valid ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : null}
                </div>
              )}
            </div>
            
            {/* Token validation messages */}
            {tokenValidation.type === 'success' && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {tokenValidation.message}
              </p>
            )}
            
            {!tokenValidation.valid && (
              <Alert variant="destructive" className="mt-2">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {tokenValidation.message}
                </AlertDescription>
              </Alert>
            )}

            {!accessToken && (
              <p className="text-xs text-muted-foreground mt-1.5">
                The token starts with <code className="bg-muted px-1 rounded font-semibold">shpat_</code> — see the guide above for how to get it
              </p>
            )}
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

          <div>
            <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
            <Input
              id="webhook-secret"
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Optional for added security"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional: Add webhook signature verification for enhanced security
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleTestConnection} 
              disabled={connectionStatus === 'testing' || !shopDomain || !accessToken || !tokenValidation.valid}
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
              disabled={isLoading || !canConnect} 
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
          
          {shopDomain && accessToken && tokenValidation.valid && connectionStatus !== 'success' && (
            <p className="text-xs text-muted-foreground text-center">
              👆 Please test your connection before connecting
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
