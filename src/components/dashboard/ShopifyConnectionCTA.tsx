import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, TrendingUp, Package, BarChart3, ArrowRight, Sparkles } from "lucide-react";

interface ShopifyConnectionCTAProps {
  onConnect: () => void;
}

export const ShopifyConnectionCTA = ({ onConnect }: ShopifyConnectionCTAProps) => {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-lg hover:shadow-xl transition-all duration-500">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 opacity-50" />
      
      {/* Decorative blur elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <CardHeader className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-2">
              <Sparkles className="h-3 w-3" />
              E-Commerce Integration
            </div>
            <CardTitle className="flex items-center gap-3 text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <ShoppingBag className="h-6 w-6 text-primary-foreground" />
              </div>
              Connect Your Shopify Store
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground max-w-xl">
              Seamlessly integrate your e-commerce operations with powerful analytics, inventory management, and unified workflows
            </CardDescription>
          </div>
          <Button 
            onClick={onConnect} 
            size="lg" 
            className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <span>Connect Now</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {/* Feature 1 */}
          <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            <div className="relative space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 group-hover:from-green-500/30 group-hover:to-emerald-500/20 transition-all duration-300">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-base mb-1.5 text-foreground">Track Sales & Analytics</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Real-time insights into orders, revenue, and customer behavior
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            <div className="relative space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 group-hover:from-blue-500/30 group-hover:to-cyan-500/20 transition-all duration-300">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-base mb-1.5 text-foreground">Sync Products & Inventory</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Automatic synchronization of products and stock management
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-105 sm:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            <div className="relative space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 group-hover:from-purple-500/30 group-hover:to-pink-500/20 transition-all duration-300">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-base mb-1.5 text-foreground">Unified Dashboard</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Centralized control for projects and e-commerce operations
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
