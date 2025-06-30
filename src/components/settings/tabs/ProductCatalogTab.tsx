
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Palette, Crown, Calculator } from "lucide-react";
import { HeadingManagement } from "./products/HeadingManagement";
import { WindowCoveringsManagement } from "./products/WindowCoveringsManagement";

export const ProductCatalogTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-brand-primary">Product Catalog</h3>
        <p className="text-brand-neutral">Manage your products, categories, and specifications</p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="headings" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Headings
          </TabsTrigger>
          <TabsTrigger value="window-coverings" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Window Coverings
          </TabsTrigger>
          <TabsTrigger value="fabrics" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Fabric Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Create and manage your product catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-brand-neutral">Product management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="headings">
          <HeadingManagement />
        </TabsContent>

        <TabsContent value="window-coverings">
          <WindowCoveringsManagement />
        </TabsContent>

        <TabsContent value="fabrics">
          <Card>
            <CardHeader>
              <CardTitle>Fabric Library</CardTitle>
              <CardDescription>Manage your fabric collection and specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-brand-neutral">Fabric library interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
