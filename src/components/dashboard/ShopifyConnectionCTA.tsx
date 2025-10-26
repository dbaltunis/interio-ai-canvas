import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, TrendingUp, Package, BarChart3, ArrowRight } from "lucide-react";

interface ShopifyConnectionCTAProps {
  onConnect: () => void;
}

export const ShopifyConnectionCTA = ({ onConnect }: ShopifyConnectionCTAProps) => {
  return (
    <Card className="border border-border/50 bg-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground mb-2">
              <ShoppingBag className="h-3.5 w-3.5" />
              E-Commerce Integration
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Connect Your Shopify Store
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Seamlessly integrate your e-commerce operations with powerful analytics, inventory management, and unified workflows
            </p>
          </div>
          <Button 
            onClick={onConnect} 
            size="sm"
            className="gap-1.5 shrink-0"
          >
            Connect Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Track Sales */}
        <div className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex-shrink-0 w-9 h-9 rounded-md bg-green-500/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground mb-0.5">Track Sales & Analytics</h4>
            <p className="text-xs text-muted-foreground">
              Real-time insights into orders, revenue, and customer behavior
            </p>
          </div>
        </div>

        {/* Sync Products */}
        <div className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex-shrink-0 w-9 h-9 rounded-md bg-blue-500/10 flex items-center justify-center">
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground mb-0.5">Sync Products & Inventory</h4>
            <p className="text-xs text-muted-foreground">
              Automatic synchronization of products and stock management
            </p>
          </div>
        </div>

        {/* Unified Dashboard */}
        <div className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex-shrink-0 w-9 h-9 rounded-md bg-purple-500/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground mb-0.5">Unified Dashboard</h4>
            <p className="text-xs text-muted-foreground">
              Centralized control for projects and e-commerce operations
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
