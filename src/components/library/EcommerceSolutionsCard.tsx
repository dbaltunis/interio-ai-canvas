import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Store, ArrowRight, Check } from "lucide-react";
import { StoreCreationFlow } from "@/components/online-store/StoreCreationFlow";

interface EcommerceSolutionsCardProps {
  onOpenShopifyIntegration: () => void;
  hasShopifyIntegration: boolean;
}

export const EcommerceSolutionsCard = ({
  onOpenShopifyIntegration,
  hasShopifyIntegration,
}: EcommerceSolutionsCardProps) => {
  const [showStoreCreation, setShowStoreCreation] = useState(false);

  const features = {
    shopify: [
      "Sync with existing Shopify store",
      "Import products automatically",
      "Manage orders in one place",
      "Connect multiple sales channels"
    ],
    online: [
      "Launch in minutes with templates",
      "No monthly Shopify fees",
      "Full control of design & content",
      "Integrated with InterioApp"
    ]
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Shopify Option */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Connect Shopify Store</CardTitle>
                {hasShopifyIntegration && (
                  <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                    <Check className="h-4 w-4" />
                    Connected
                  </div>
                )}
              </div>
            </div>
            <CardDescription>
              Already have a Shopify store? Connect it to sync products and orders with InterioApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.shopify.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={onOpenShopifyIntegration}
              variant={hasShopifyIntegration ? "outline" : "default"}
              className="w-full"
            >
              {hasShopifyIntegration ? 'Manage Connection' : 'Connect Store'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Online Store Option */}
        <Card className="relative overflow-hidden border-2 border-primary/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Store className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-xl">Launch Online Store</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  New! Build your own store
                </div>
              </div>
            </div>
            <CardDescription>
              Don't have a store? Create a beautiful online store in minutes with our built-in templates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.online.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => setShowStoreCreation(true)}
              className="w-full"
            >
              Launch Online Store
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <StoreCreationFlow
        open={showStoreCreation}
        onOpenChange={setShowStoreCreation}
        onComplete={() => {}}
      />
    </>
  );
};
