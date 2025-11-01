import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Package, TrendingUp, Settings } from "lucide-react";

interface ShopifySuccessScreenProps {
  shopDomain: string;
  onStartSync: () => void;
  onViewAnalytics: () => void;
  onConfigureSettings: () => void;
}

export const ShopifySuccessScreen = ({
  shopDomain,
  onStartSync,
  onViewAnalytics,
  onConfigureSettings,
}: ShopifySuccessScreenProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <CardTitle className="text-green-900">🎉 Store Connected Successfully!</CardTitle>
              <p className="text-sm text-green-700 mt-1">
                {shopDomain} is now connected to InterioApp
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-lg">Next Steps to Start Selling:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Sync Your Products</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Import your Shopify products into InterioApp. This will pull in your product catalog, prices, inventory levels, and images.
                  </p>
                  <Button onClick={onStartSync} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Package className="h-4 w-4 mr-2" />
                    Sync Products Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 mb-1">View Store Analytics</h4>
                  <p className="text-sm text-purple-700 mb-2">
                    Monitor your store performance - orders, revenue, customers, and more - all from your InterioApp dashboard.
                  </p>
                  <Button onClick={onViewAnalytics} variant="outline" size="sm" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 mb-1">Configure Sync Settings</h4>
                  <p className="text-sm text-orange-700 mb-2">
                    Choose what data to sync automatically: inventory levels, prices, images, and order updates.
                  </p>
                  <Button onClick={onConfigureSettings} variant="outline" size="sm" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">💡 Pro Tips:</h4>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Enable <strong>Auto Sync</strong> to keep inventory levels updated automatically between Shopify and InterioApp</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Orders from your Shopify store will appear as new leads in InterioApp with "Online Store Sale" status</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>You can push inventory from InterioApp to Shopify to list new products in your online store</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
