import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, X } from "lucide-react";
import { useState } from "react";

interface ShopifyQuickSetupBannerProps {
  onOpenIntegration: () => void;
  hasIntegration: boolean;
}

export const ShopifyQuickSetupBanner = ({ 
  onOpenIntegration, 
  hasIntegration 
}: ShopifyQuickSetupBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already set up or dismissed
  if (hasIntegration || dismissed) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              Want to Sell Your Products Online?
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Connect your Shopify store to automatically sync products, track online orders, and manage everything in one place. 
              Orders from Shopify will create work orders here, and you can push your inventory to your online store with one click.
            </p>
            <div className="flex gap-3">
              <Button onClick={onOpenIntegration}>
                Set Up Shopify Integration
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => setDismissed(true)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
