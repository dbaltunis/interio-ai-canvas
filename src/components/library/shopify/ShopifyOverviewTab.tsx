
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Store, Zap, BarChart3, RefreshCw } from "lucide-react";
import { ShopifyIntegration } from "@/hooks/useShopifyIntegration";

interface ShopifyOverviewTabProps {
  integration?: ShopifyIntegration | null;
  onGetStarted?: () => void;
}

export const ShopifyOverviewTab = ({ integration, onGetStarted }: ShopifyOverviewTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Store className="h-5 w-5" />
            <span>Integration Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge variant={integration?.active ? "default" : "secondary"}>
                {integration?.active ? "Connected" : "Not Connected"}
              </Badge>
            </div>
            
            {integration?.shop_domain && (
              <div className="flex items-center justify-between">
                <span>Store:</span>
                <span className="font-medium">{integration.shop_domain}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span>Auto Sync:</span>
              <Badge variant={integration?.auto_sync_enabled ? "default" : "secondary"}>
                {integration?.auto_sync_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Product Sync</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Inventory Tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Real-time Updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span>Order Management</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {!integration?.active && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Connect your Shopify store to automatically sync products, inventory, and orders.
            </p>
            <Button onClick={onGetStarted} className="w-full">
              Connect Shopify Store
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
