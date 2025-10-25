import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, TrendingUp, Package, BarChart3, ArrowRight } from "lucide-react";

interface ShopifyConnectionCTAProps {
  onConnect: () => void;
}

export const ShopifyConnectionCTA = ({ onConnect }: ShopifyConnectionCTAProps) => {
  return (
    <Card className="relative overflow-hidden glass-morphism border-primary/30 hover:border-primary/50 transition-all duration-300 group">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-secondary/5 to-primary/8 opacity-80" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30">
                <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Connect Your Shopify Store</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Sync your online store and manage everything in one place
            </CardDescription>
          </div>
          <Button 
            onClick={onConnect} 
            size="lg" 
            className="gap-2 shadow-lg hover:shadow-xl transition-all hover-lift shrink-0"
          >
            Connect Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/30">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm mb-1">Track Sales & Analytics</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                View orders, revenue, and customer metrics in real-time
              </p>
            </div>
          </div>
          
          <div className="flex gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-purple-500/30">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm mb-1">Sync Products & Inventory</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                Automatically sync products and manage stock levels
              </p>
            </div>
          </div>
          
          <div className="flex gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border border-orange-500/30">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm mb-1">Unified Dashboard</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                Manage both projects and e-commerce from one interface
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
