import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, Grid3x3, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

export const ShopifyProductCategoriesWidget = () => {
  const { units } = useMeasurementUnits();
  const currency = units.currency || 'USD';

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
      <Card variant="analytics" className="h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-36" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card variant="analytics" className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Grid3x3 className="h-4 w-4 text-primary shrink-0" />
            Product Categories
          </CardTitle>
          <Badge variant="secondary" className="text-xs shrink-0">
            {categoryData?.totalCategories || 0} categories
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {categoryData?.categories && categoryData.categories.length > 0 ? (
          <ScrollArea className="h-[280px] pr-3">
            <div className="space-y-2">
              {categoryData.categories.map((category) => (
                <div 
                  key={category.name}
                  className="p-3 rounded-lg border border-border bg-background hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm capitalize truncate">{category.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {category.count} products
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {category.totalQty} units
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {formatCurrency(category.totalValue)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
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
