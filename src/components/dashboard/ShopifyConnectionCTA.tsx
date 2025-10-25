import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, TrendingUp, Package, BarChart3, ArrowRight } from "lucide-react";

interface ShopifyConnectionCTAProps {
  onConnect: () => void;
}

export const ShopifyConnectionCTA = ({ onConnect }: ShopifyConnectionCTAProps) => {
  return (
    <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShoppingBag className="h-6 w-6 text-primary" />
              Connect Your Shopify Store
            </CardTitle>
            <CardDescription className="text-base">
              Sync your online store and manage everything in one place
            </CardDescription>
          </div>
          <Button onClick={onConnect} size="lg" className="gap-2">
            Connect Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Track Sales & Analytics</h4>
              <p className="text-sm text-muted-foreground">
                View orders, revenue, and customer metrics in real-time
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Sync Products & Inventory</h4>
              <p className="text-sm text-muted-foreground">
                Automatically sync products and manage stock levels
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Unified Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Manage both projects and e-commerce from one interface
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
