import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, HelpCircle, CheckCircle2 } from "lucide-react";
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
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground flex items-center gap-2 text-base">
          <HelpCircle className="h-5 w-5 text-primary" />
          How to Get Your Client ID & Secret
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          To connect your Shopify store, you need to create an app in the <strong>Shopify Dev Dashboard</strong> and get your Client ID and Client Secret.
        </p>

        {/* What you need */}
        <Alert className="bg-blue-50 border-blue-200">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-900">
            <strong>You'll need these 2 values from the Dev Dashboard:</strong>
            <div className="mt-1 space-y-0.5">
              <p>✅ <strong>Client ID</strong> — visible on the Settings page</p>
              <p>✅ <strong>Client Secret</strong> — click "Manage client credentials" to reveal</p>
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
                      Go to <strong>dev.shopify.com</strong> and sign in with your Shopify account.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => window.open('https://dev.shopify.com/', '_blank')}
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
                      Click <strong>"Create an app"</strong>.
                      <br />Choose <strong>"Create app manually"</strong>.
                      <br />Name it something like <strong>"InterioApp Integration"</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Configure Admin API Scopes</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Go to <strong>"Configuration"</strong> tab → <strong>"Admin API integration"</strong> → Click <strong>"Configure"</strong>.
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

                {/* Step 4 - CRITICAL - Made prominent */}
                <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 -ml-1">
                  <div className="bg-amber-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm text-amber-900">⚠️ Install the App to Your Store (REQUIRED)</p>
                    <p className="text-xs text-amber-800">
                      <strong>This step is critical!</strong> Your credentials won't work until you install the app.
                      <br /><br />
                      Go to the <strong>"Overview"</strong> tab.
                      <br />Click <strong>"Select store"</strong> and choose your store.
                      <br />Click <strong>"Install"</strong> and approve the permissions.
                    </p>
                    <Alert className="bg-amber-100 border-amber-300 py-2">
                      <AlertDescription className="text-xs text-amber-900 font-medium">
                        ❗ If you skip this step, you'll get an "app_not_installed" error when testing the connection.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    5
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Get Your Client ID</p>
                    <p className="text-xs text-muted-foreground">
                      Go to the <strong>"Settings"</strong> tab.
                      <br />Copy the <strong>Client ID</strong> (it's visible on the page).
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    6
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Get Your Client Secret</p>
                    <p className="text-xs text-muted-foreground">
                      On the same <strong>"Settings"</strong> page:
                      <br />Click <strong>"Manage client credentials"</strong>
                      <br />Click to reveal and copy your <strong>Client Secret</strong>
                    </p>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    7
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Paste Both Values Above</p>
                    <p className="text-xs text-muted-foreground">
                      Paste your <strong>Client ID</strong> and <strong>Client Secret</strong> in the fields above, then click <strong>Test Connection</strong>.
                    </p>
                  </div>
                </div>

                <Alert className="bg-green-50 border-green-200 mt-4">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-xs text-green-900">
                    <strong>Tip:</strong> Unlike the old method, these credentials can be viewed again later in the Dev Dashboard if needed.
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
            onClick={() => window.open('https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/client-credentials-grant', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Official Shopify Documentation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
