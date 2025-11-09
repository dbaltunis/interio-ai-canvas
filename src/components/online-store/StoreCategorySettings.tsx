import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useStoreCategorySettings } from "@/hooks/useStoreCategorySettings";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

interface StoreCategorySettingsProps {
  storeId: string;
}

export const StoreCategorySettings = ({ storeId }: StoreCategorySettingsProps) => {
  const { data: settings, isLoading: settingsLoading } = useStoreCategorySettings(storeId);
  const { data: inventory = [], isLoading: inventoryLoading } = useEnhancedInventory();
  const { updateCategorySetting } = useStoreCategorySettings(storeId);

  // Extract unique categories from inventory
  const categories = Array.from(
    new Set(inventory.map(item => item.category).filter(Boolean))
  ).sort();

  const isExcluded = (category: string) => {
    return settings?.some(s => s.category === category && s.is_excluded) || false;
  };

  if (settingsLoading || inventoryLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No product categories found in your inventory.</p>
            <p className="text-sm">Add products to your inventory to manage category visibility.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Category Settings</CardTitle>
        <CardDescription>
          Control which product categories appear in your online store
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map(category => (
            <div
              key={category}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <Label htmlFor={`category-${category}`} className="font-medium cursor-pointer">
                  {category}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {isExcluded(category)
                    ? "Hidden from online store"
                    : "Visible in online store"}
                </p>
              </div>
              <Switch
                id={`category-${category}`}
                checked={!isExcluded(category)}
                onCheckedChange={(checked) => {
                  updateCategorySetting.mutate({
                    category,
                    isExcluded: !checked,
                  });
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
