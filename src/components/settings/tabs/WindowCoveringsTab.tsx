import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeadingInventoryManager } from "./components/HeadingInventoryManager";
import { OptionCategoriesManager } from "./products/OptionCategoriesManager";
import { MakingCostsManager } from "./products/MakingCostsManager";
import { ManufacturingDefaults } from "./products/ManufacturingDefaults";
import { TreatmentsManagementTab } from "./TreatmentsManagementTab";
import { Layers, Package, Tags, Settings } from "lucide-react";
export const WindowCoveringsTab = () => {
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Window Coverings Management</CardTitle>
          
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="headings" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Heading Library
              </TabsTrigger>
              <TabsTrigger value="options" className="flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Option Categories
              </TabsTrigger>
              <TabsTrigger value="making-costs" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Making Costs
              </TabsTrigger>
              <TabsTrigger value="defaults" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manufacturing Defaults
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <TreatmentsManagementTab />
            </TabsContent>

            <TabsContent value="headings" className="space-y-6">
              <HeadingInventoryManager />
            </TabsContent>

            <TabsContent value="options" className="space-y-6">
              <OptionCategoriesManager />
            </TabsContent>

            <TabsContent value="making-costs" className="space-y-6">
              <MakingCostsManager />
            </TabsContent>

            <TabsContent value="defaults" className="space-y-6">
              <ManufacturingDefaults />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};