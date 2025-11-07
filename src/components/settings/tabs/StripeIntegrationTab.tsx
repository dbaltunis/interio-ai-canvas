import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, CreditCard, ExternalLink, Info, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const StripeIntegrationTab = () => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkStripeConfiguration();
  }, []);

  const checkStripeConfiguration = async () => {
    setIsChecking(true);
    try {
      // Try to call an edge function to verify Stripe is configured
      const { error } = await supabase.functions.invoke('verify-quote-payment', {
        body: { quote_id: 'test' }
      });
      
      // If we get a specific error about missing quote, Stripe is configured
      // If we get an error about STRIPE_SECRET_KEY, it's not configured
      if (error) {
        const errorMsg = error.message || '';
        setIsConfigured(!errorMsg.includes('STRIPE_SECRET_KEY'));
      } else {
        setIsConfigured(true);
      }
    } catch (error) {
      console.error('Error checking Stripe config:', error);
      setIsConfigured(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConfigureStripe = () => {
    toast.info("Opening Stripe configuration...", {
      description: "You'll need to add your STRIPE_SECRET_KEY in Supabase secrets"
    });
    // Open Supabase secrets page
    window.open(
      'https://supabase.com/dashboard/project/ldgrcodffsalkevafbkb/settings/functions',
      '_blank'
    );
  };

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
              Accept payments for quotes and invoices via Stripe
            </CardDescription>
          </div>
          {!isChecking && (
            <Badge variant={isConfigured ? "default" : "secondary"}>
              {isConfigured ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                "Not Configured"
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isChecking ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Checking Stripe configuration...</p>
          </div>
        ) : isConfigured ? (
          <>
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Stripe is configured!</strong> You can now accept payments for quotes.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Features Available</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Accept full payments and deposits via Stripe Checkout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Automatic payment verification and status updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Configurable deposit percentages or fixed amounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Secure payment processing with Stripe's infrastructure</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">How to Use</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Create or open a quote in the Quotes tab</li>
                  <li>Configure payment options (full payment or deposit)</li>
                  <li>Share the quote with your client</li>
                  <li>Client clicks "Pay Now" button to complete payment via Stripe</li>
                </ol>
              </div>

              <Button
                variant="outline"
                onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Stripe Dashboard
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                To enable Stripe payments, you need to configure your Stripe API key in Supabase.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Setup Steps</h4>
                <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                  <li>
                    Get your Stripe Secret Key from{" "}
                    <a
                      href="https://dashboard.stripe.com/apikeys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Stripe Dashboard
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    Add the key as <code className="bg-muted px-1 py-0.5 rounded">STRIPE_SECRET_KEY</code> in Supabase Edge Function Secrets
                  </li>
                  <li>
                    Refresh this page to verify the configuration
                  </li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleConfigureStripe} className="flex-1">
                  <Key className="h-4 w-4 mr-2" />
                  Configure Stripe Key
                </Button>
                <Button variant="outline" onClick={checkStripeConfiguration}>
                  Check Status
                </Button>
              </div>
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-xs">
                <strong>Important:</strong> Use your Stripe <strong>Secret Key</strong>, not the Publishable Key.
                The secret key starts with <code className="bg-yellow-100 px-1 py-0.5 rounded">sk_</code>
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
};
