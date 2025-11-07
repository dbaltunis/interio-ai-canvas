import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, CreditCard, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useStripeConnect } from "@/hooks/useStripeConnect";

export const StripeIntegrationTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    isConnected,
    isChecking,
    isConnecting,
    connectedAccountId,
    initiateConnection,
    handleCallback,
    disconnect,
  } = useStripeConnect();

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const stripeCallback = searchParams.get('stripe_callback');
    
    if (code && stripeCallback === 'true') {
      // Clean up URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('code');
      newParams.delete('state');
      newParams.delete('stripe_callback');
      setSearchParams(newParams, { replace: true });
      
      // Handle the callback
      handleCallback(code);
    }
  }, [searchParams, setSearchParams, handleCallback]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Payment Integration
            </CardTitle>
            <CardDescription>
              Connect your Stripe account to receive payments directly from your clients
            </CardDescription>
          </div>
          {!isChecking && (
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                "Not Connected"
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isChecking ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Checking connection status...</p>
          </div>
        ) : isConnected ? (
          <>
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <div className="font-semibold">Stripe Connected Successfully!</div>
                {connectedAccountId && (
                  <div className="text-sm mt-1">Account ID: {connectedAccountId}</div>
                )}
                <div className="text-sm mt-1">Your clients can now pay you directly through Stripe</div>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">How It Works:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Your clients pay directly to <strong>your Stripe account</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Funds are deposited to <strong>your bank account</strong> automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Configure full payments or deposit percentages on each quote</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Payment status automatically tracked in the system</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">How to Use:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Create or open a quote</li>
                  <li>In the Payment Configuration section, choose full payment or deposit</li>
                  <li>Set the deposit percentage if needed</li>
                  <li>Save configuration - the "Pay Now" button will appear</li>
                  <li>Share the quote with your client</li>
                  <li>Client clicks "Pay Now" and pays via Stripe</li>
                  <li>Funds go directly to your bank account!</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Stripe Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={disconnect}
                  className="flex-1"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                Connect your Stripe account to start receiving payments directly from your clients.
                Payments go straight to your bank account.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Why Connect Stripe?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Get paid faster</strong> - Clients pay instantly online</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Your money, your account</strong> - Funds go directly to your bank</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Secure payments</strong> - Stripe handles all payment security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Accept cards & more</strong> - Credit cards, debit cards, and digital wallets</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Setup Steps:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Click "Connect Stripe Account" below</li>
                  <li>Create a Stripe account or sign in to your existing one</li>
                  <li>Complete the verification process (bank account, business details)</li>
                  <li>Return here and your account will be connected!</li>
                </ol>
              </div>

              <Button
                onClick={initiateConnection}
                disabled={isConnecting}
                className="w-full"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Connect Your Stripe Account
                  </>
                )}
              </Button>

              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs">
                  <strong>Free to get started:</strong> Stripe is free to sign up. You only pay a small fee when you receive payments (typically ~2.9% + 30¢ per transaction).
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
