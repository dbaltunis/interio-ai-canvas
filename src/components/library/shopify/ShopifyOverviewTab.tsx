import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Settings, ArrowRight } from "lucide-react";
import { ShopifyIntegration } from "@/hooks/useShopifyIntegration";

interface ShopifyOverviewTabProps {
  integration: ShopifyIntegration | null;
  onGetStarted: () => void;
}

export const ShopifyOverviewTab = ({ integration, onGetStarted }: ShopifyOverviewTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle className="text-brand-primary flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              What happens when you connect?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <h4 className="font-medium">Import Products</h4>
                <p className="text-sm text-muted-foreground">All your Shopify products will be synced to your inventory</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-brand-secondary text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h4 className="font-medium">Real-time Sync</h4>
                <p className="text-sm text-muted-foreground">Inventory levels update automatically when sales happen</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-brand-accent text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h4 className="font-medium">Unified Management</h4>
                <p className="text-sm text-muted-foreground">Manage all products from one dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-700 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              What you can sync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Product Information</span>
              <Badge variant="secondary">Automatic</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Inventory Levels</span>
              <Badge variant="secondary">Real-time</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pricing & Variants</span>
              <Badge variant="secondary">Bi-directional</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Product Images</span>
              <Badge variant="secondary">Optional</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sales Tracking</span>
              <Badge variant="secondary">Live</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {!integration && (
        <Card className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready to connect your store?</h3>
                <p className="text-brand-light/90">Get started in just a few minutes</p>
              </div>
              <Button variant="secondary" onClick={onGetStarted}>
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};