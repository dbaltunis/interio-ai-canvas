import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, HelpCircle, AlertTriangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ShopifyOAuthGuideProps {
  shopDomain?: string;
}

export const ShopifyOAuthGuide = ({ shopDomain }: ShopifyOAuthGuideProps) => {
  // Generate the Dev Dashboard URL
  const getDevDashboardUrl = () => {
    return 'https://partners.shopify.com/';
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground flex items-center gap-2 text-base">
          <HelpCircle className="h-5 w-5 text-primary" />
          How to Get Your API Access Token
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          To connect your Shopify store, you need to create an app in the <strong>Shopify Dev Dashboard</strong> and get an Admin API access token.
        </p>

        {/* Token type clarification */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-900">
            <strong>Which token to use?</strong>
            <div className="mt-1 space-y-0.5">
              <p className="text-green-700">✅ <strong>Admin API access token</strong> (starts with <code className="bg-white/50 px-1 rounded">shpat_</code>)</p>
              <p className="text-red-700">❌ <strong>NOT</strong> the API secret key / Shared secret (starts with <code className="bg-white/50 px-1 rounded">shpss_</code>)</p>
            </div>
          </AlertDescription>
        </Alert>
        
        <Accordion type="single" collapsible className="w-full" defaultValue="steps">
          <AccordionItem value="steps" className="border-none">
            <AccordionTrigger className="text-sm font-medium text-primary hover:no-underline py-2">
              📖 Show me the step-by-step instructions
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {/* Step 1 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-2 w-full">
                    <p className="font-medium text-sm">Open Shopify Dev Dashboard</p>
                    <p className="text-xs text-muted-foreground">
                      In your Shopify admin, go to <strong>Settings → Apps → App development</strong>, then click <strong>"Build apps in Dev Dashboard"</strong>.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => window.open(getDevDashboardUrl(), '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1.5" />
                      Open Shopify Dev Dashboard
                    </Button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Create a New App</p>
                    <p className="text-xs text-muted-foreground">
                      In the Dev Dashboard, click <strong>"Create an app"</strong>.
                      <br />Choose <strong>"Create app manually"</strong>.
                      <br />Name it something like <strong>"InterioApp Integration"</strong>.
                      <br />Select your store to install on.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Configure Admin API Access</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Go to the <strong>"Configuration"</strong> tab in your app.
                      <br />Under <strong>"Admin API integration"</strong>, click <strong>"Configure"</strong>.
                      <br />Enable these required scopes:
                    </p>
                    <div className="bg-muted/50 p-2 rounded text-xs font-mono space-y-0.5">
                      <p>☑️ read_products</p>
                      <p>☑️ write_products</p>
                      <p>☑️ read_orders</p>
                      <p>☑️ read_inventory</p>
                      <p>☑️ write_inventory</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click <strong>"Save"</strong> to save the configuration.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Install the App to Your Store</p>
                    <p className="text-xs text-muted-foreground">
                      Go to the <strong>"Overview"</strong> tab.
                      <br />Click <strong>"Select store"</strong> and choose your store.
                      <br />Click <strong>"Install app"</strong> and approve the permissions.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    5
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Get Your Admin API Access Token</p>
                    <p className="text-xs text-muted-foreground">
                      After installation, go to the <strong>"API credentials"</strong> tab.
                      <br />Find <strong>"Admin API access token"</strong>.
                      <br />Click <strong>"Reveal token once"</strong> and copy it immediately.
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    6
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Paste the Token Here</p>
                    <p className="text-xs text-muted-foreground">
                      Copy the token (starts with <code className="bg-muted px-1 rounded">shpat_</code>) and paste it in the field below.
                    </p>
                  </div>
                </div>

                <Alert className="bg-amber-50 border-amber-200 mt-4">
                  <AlertDescription className="text-xs text-amber-900">
                    <strong>⚠️ Important:</strong> The access token can only be viewed once! 
                    Copy it immediately and paste it below. If you lose it, you'll need to uninstall and reinstall the app.
                  </AlertDescription>
                </Alert>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center gap-2 pt-1">
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-xs"
            onClick={() => window.open('https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/generate-app-access-tokens-admin', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Official Shopify Documentation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
