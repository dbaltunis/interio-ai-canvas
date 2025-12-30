import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, HelpCircle } from "lucide-react";
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
  // Generate the custom apps URL based on the shop domain
  const getCustomAppsUrl = () => {
    if (!shopDomain || shopDomain.trim() === '') {
      return 'https://admin.shopify.com/store/YOUR-STORE/settings/apps/development';
    }
    // Extract store name from domain
    const storeName = shopDomain.replace('.myshopify.com', '').replace(/^https?:\/\//, '');
    return `https://admin.shopify.com/store/${storeName}/settings/apps/development`;
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
          To connect your Shopify store, you need to create a "Custom App" in your Shopify admin and get an API access token.
        </p>
        
        <Accordion type="single" collapsible className="w-full">
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
                    <p className="font-medium text-sm">Go to Shopify Apps Settings</p>
                    <p className="text-xs text-muted-foreground">
                      In your Shopify admin, go to <strong>Settings → Apps and sales channels → Develop apps</strong>
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => window.open(getCustomAppsUrl(), '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1.5" />
                      Open Apps Settings
                    </Button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Enable Custom App Development</p>
                    <p className="text-xs text-muted-foreground">
                      If you see a button "Allow custom app development", click it and confirm.
                      <br />This only needs to be done once.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Create a New Custom App</p>
                    <p className="text-xs text-muted-foreground">
                      Click <strong>"Create an app"</strong> button. Name it something like "InterioApp Integration".
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Configure Admin API Scopes</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Click <strong>"Configure Admin API scopes"</strong> and enable these permissions:
                    </p>
                    <div className="bg-muted/50 p-2 rounded text-xs font-mono space-y-0.5">
                      <p>☑️ read_products</p>
                      <p>☑️ write_products</p>
                      <p>☑️ read_orders</p>
                      <p>☑️ read_inventory</p>
                      <p>☑️ write_inventory</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Then click <strong>"Save"</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    5
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Install the App & Get Your Token</p>
                    <p className="text-xs text-muted-foreground">
                      Click <strong>"Install app"</strong> at the top right, then confirm.
                      <br />After installation, go to the <strong>"API credentials"</strong> tab.
                      <br />Under <strong>"Admin API access token"</strong>, click <strong>"Reveal token once"</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    6
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Copy & Paste Here</p>
                    <p className="text-xs text-muted-foreground">
                      Copy the token (starts with <code className="bg-muted px-1 rounded">shpat_</code>) and paste it in the field below.
                    </p>
                  </div>
                </div>

                <Alert className="bg-amber-50 border-amber-200 mt-4">
                  <AlertDescription className="text-xs text-amber-900">
                    <strong>⚠️ Important:</strong> The access token can only be viewed once! 
                    Copy it immediately and paste it below. If you lose it, you'll need to create a new custom app.
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
            onClick={() => window.open('https://help.shopify.com/en/manual/apps/app-types/custom-apps', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Official Shopify Documentation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
