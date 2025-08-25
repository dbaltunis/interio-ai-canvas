import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Grid, List, Package, Home, Minus, Palette, ArrowRightLeft } from "lucide-react";
import { InventoryStats } from "./InventoryStats";
import { FabricInventoryView } from "./FabricInventoryView";
import { HardwareInventoryView } from "./HardwareInventoryView";
import { AssemblyKitBuilder } from "./AssemblyKitBuilder";
import { InventoryAnalytics } from "./InventoryAnalytics";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { InventoryDemoData } from "./InventoryDemoData";
import { ReorderNotificationSystem } from "./ReorderNotificationSystem";
import { InventoryImportExport } from "./InventoryImportExport";
import { VendorDashboard } from "../vendors/VendorDashboard";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useVendors } from "@/hooks/useVendors";

export const ModernInventoryDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("overview");
  const [showSearch, setShowSearch] = useState(false);
  const { data: inventory, refetch } = useEnhancedInventory();
  const { data: vendors } = useVendors();

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage fabrics, hardware, and assemblies for your window treatment business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setActiveTab("analytics");
              setTimeout(() => {
                const importExportElement = document.querySelector('[data-import-export]');
                importExportElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            title="Import/Export Inventory"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
          <AddInventoryDialog 
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            }
            onSuccess={() => refetch()}
          />
        </div>
      </div>

      {/* Search and View Controls */}
      {showSearch && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="fabrics" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Fabrics
          </TabsTrigger>
          <TabsTrigger value="hardware" className="flex items-center gap-2">
            <Minus className="h-4 w-4" />
            Hardware
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="assemblies" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Assemblies
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Key Metrics */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Key Metrics</h2>
            <p className="text-sm text-muted-foreground">Overview of your inventory performance</p>
          </div>
          <InventoryStats />
          {/* Quick Access */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Quick Access</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20" onClick={() => setActiveTab("fabrics")}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Home className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Fabric Library</CardTitle>
                        <CardDescription className="text-xs">
                          Fabrics & materials
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {inventory?.filter(i => i.category === 'fabric' || i.category === 'curtain_fabric' || i.category === 'blind_fabric').length || 0} Items
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs group-hover:text-primary">
                      View →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20" onClick={() => setActiveTab("hardware")}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Minus className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Hardware</CardTitle>
                        <CardDescription className="text-xs">
                          Tracks & accessories
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {inventory?.filter(i => i.category === 'track' || i.category === 'rod' || i.category === 'bracket' || i.category === 'motor' || i.category === 'accessory').length || 0} Items
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs group-hover:text-primary">
                      View →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20" onClick={() => setActiveTab("vendors")}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Package className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Vendors</CardTitle>
                        <CardDescription className="text-xs">
                          Supplier management
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {vendors?.length || 0} Vendors
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs group-hover:text-primary">
                      Manage →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20" onClick={() => setActiveTab("assemblies")}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Assembly Kits</CardTitle>
                        <CardDescription className="text-xs">
                          Pre-configured kits
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      23 Kits
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs group-hover:text-primary">
                      Build →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Alerts & Notifications</h2>
            <ReorderNotificationSystem />
          </div>
        </TabsContent>

        <TabsContent value="fabrics" className="space-y-6">
          <FabricInventoryView searchQuery={searchQuery} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="hardware" className="space-y-6">
          <HardwareInventoryView searchQuery={searchQuery} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <VendorDashboard />
        </TabsContent>

        <TabsContent value="assemblies" className="space-y-6">
          <AssemblyKitBuilder />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <InventoryAnalytics />
          
          {/* Import/Export Tools */}
          <div data-import-export>
            <InventoryImportExport />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};