import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, Grid3x3, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const ShopifyProductCategoriesWidget = () => {
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: inventory, error } = await supabase
        .from('inventory')
        .select('category, quantity, unit_price')
        .eq('user_id', user.id);

      if (error) throw error;

      // Process categories
      const categoryMap: Record<string, {
        count: number;
        totalValue: number;
        totalQty: number;
      }> = {};

      inventory?.forEach(item => {
        const category = item.category || 'Uncategorized';
        if (!categoryMap[category]) {
          categoryMap[category] = {
            count: 0,
            totalValue: 0,
            totalQty: 0,
          };
        }
        
        categoryMap[category].count++;
        categoryMap[category].totalValue += (item.unit_price || 0) * (item.quantity || 0);
        categoryMap[category].totalQty += item.quantity || 0;
      });

      // Convert to array and sort by count
      const categories = Object.entries(categoryMap)
        .map(([name, data]) => ({
          name,
          count: data.count,
          totalValue: data.totalValue,
          totalQty: data.totalQty,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        categories,
        totalProducts: inventory?.length || 0,
        totalCategories: categories.length,
      };
    },
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-primary" />
            Product Categories
          </div>
          <Badge variant="secondary">
            {categoryData?.totalCategories || 0} categories
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {categoryData?.categories && categoryData.categories.length > 0 ? (
          <div className="space-y-3">
            {categoryData.categories.map((category) => (
              <div 
                key={category.name}
                className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold capitalize">{category.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Package className="h-3 w-3 mr-1" />
                        {category.count} products
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(category.totalValue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {category.totalQty} units
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-secondary h-1.5 rounded-full mt-3">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ 
                      width: `${(category.count / (categoryData?.totalProducts || 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Grid3x3 className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              No product categories yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add products to see category breakdown
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
