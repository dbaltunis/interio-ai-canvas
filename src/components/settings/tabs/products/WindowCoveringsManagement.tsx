
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WindowCoveringCategoryManager } from "./WindowCoveringCategoryManager";
import { CategoryQuickAdd } from "./category-manager/CategoryQuickAdd";

export const WindowCoveringsManagement = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCategoriesAdded = () => {
    // Force refresh of the category manager
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-brand-primary">Window Coverings</h3>
        <p className="text-brand-neutral">
          Manage window covering categories, options, and product configurations
        </p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Option Categories</TabsTrigger>
          <TabsTrigger value="products">Product Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <CategoryQuickAdd onCategoriesAdded={handleCategoriesAdded} />
          <div key={refreshKey}>
            <WindowCoveringCategoryManager />
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Templates</CardTitle>
              <CardDescription>
                Create and manage window covering product templates with specific category mappings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Product template management will be integrated here to work with the option categories.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
