import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const ShopifyOAuthGuide = () => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-900 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Quick Setup: Use Your API Credentials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-white border-green-300">
          <AlertDescription className="space-y-4">
            <p className="font-semibold text-green-900">
              ✅ Good news! I can see you have a custom app with API credentials ready. Just follow these simple steps:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div className="space-y-2 w-full">
                  <p className="font-semibold text-sm">Copy Your API Credentials</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    In your Shopify admin, go to the <strong>"API credentials"</strong> tab
                  </p>
                  <div className="bg-gray-100 p-3 rounded space-y-2">
                    <p className="text-xs font-semibold">You'll need:</p>
                    <ul className="text-xs space-y-1">
                      <li>• <strong>Admin API access token</strong> (starts with "shpat_...")</li>
                      <li>• Your <strong>shop domain</strong> (e.g., curtain-demo-store-2.myshopify.com)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-sm">Paste Credentials Below</p>
                  <p className="text-xs text-muted-foreground">
                    Scroll down and enter your shop domain and access token in the form below
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-sm">Click "Save Configuration"</p>
                  <p className="text-xs text-muted-foreground">
                    That's it! Your store will be connected and ready to sync products.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
              <p className="text-xs font-semibold text-blue-900 mb-1">
                ℹ️ About the API Scopes:
              </p>
              <p className="text-xs text-blue-800 mb-2">
                I can see you've already selected the API scopes in your Admin API configuration. Make sure you have:
              </p>
              <ul className="text-xs text-blue-800 font-mono space-y-1">
                <li>✓ read_products</li>
                <li>✓ write_products</li>
                <li>✓ read_orders</li>
                <li>✓ read_inventory</li>
                <li>✓ write_inventory</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
