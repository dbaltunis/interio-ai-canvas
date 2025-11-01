import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const ShopifyOAuthGuide = () => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-900 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Before You Connect: Shopify App Configuration Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-white border-blue-300">
          <AlertDescription className="space-y-4">
            <p className="font-semibold text-blue-900">
              OAuth won't work until you configure your Shopify app. Follow these steps:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-sm">Go to Shopify Admin</p>
                  <p className="text-xs text-muted-foreground">
                    Open your Shopify store admin panel
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-sm">Navigate to Apps Settings</p>
                  <p className="text-xs text-muted-foreground">
                    Settings → Apps and sales channels → Develop apps
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Create or Edit Custom App</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Click "Create an app" (or select existing app)
                  </p>
                  <div className="bg-gray-100 p-2 rounded">
                    <p className="text-xs font-mono">App name: InterioApp Integration</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Set Redirect URL</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    On the "Configuration" tab, <strong>scroll down past "App settings"</strong> section
                  </p>
                  <div className="bg-amber-50 border border-amber-300 rounded p-3 space-y-2">
                    <p className="text-xs font-semibold text-amber-900">Find "Allowed redirection URL(s)" field</p>
                    <p className="text-xs text-amber-800 mb-1">
                      Keep scrolling down - it's below the app name/description area, look for a URLs or App URL section
                    </p>
                    <code className="text-xs bg-white p-2 rounded block break-all border border-amber-300">
                      https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/shopify-oauth-callback
                    </code>
                    <p className="text-xs text-red-600 font-semibold">
                      ⚠️ Paste this URL and save it
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  5
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Select API Scopes (Admin API Section)</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Scroll down to "Admin API integration" → Click "Configure"
                  </p>
                  <div className="bg-gray-100 p-3 rounded">
                    <p className="text-xs font-semibold mb-1">Select these scopes (you're on this page now!):</p>
                    <ul className="text-xs font-mono space-y-1">
                      <li>✓ read_products</li>
                      <li>✓ write_products</li>
                      <li>✓ read_orders</li>
                      <li>✓ read_inventory</li>
                      <li>✓ write_inventory</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      Click "Save" when done selecting scopes
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Save & Install App</p>
                  <p className="text-xs text-muted-foreground mb-1">
                    Click "Save" at the top of the Admin API configuration page
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Then go back to Overview tab and click "Install app" to activate it on your store
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-4">
              <p className="text-xs font-semibold text-amber-900 mb-1">
                💡 After Configuration:
              </p>
              <p className="text-xs text-amber-800">
                Once you've completed these steps in Shopify, come back here and enter your store domain
                (e.g., your-store.myshopify.com) then click "Connect via OAuth".
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
