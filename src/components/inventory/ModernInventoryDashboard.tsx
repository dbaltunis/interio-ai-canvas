import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Grid, List, Package, Home, Minus, Palette, Wallpaper, Lock, QrCode } from "lucide-react";
import { QRCodeScanner } from "./QRCodeScanner";
import { QRCodeQuickActions } from "./QRCodeQuickActions";
import { EditInventoryDialog } from "./EditInventoryDialog";
import { toast } from "sonner";
import { BusinessInventoryOverview } from "./BusinessInventoryOverview";
import { FabricInventoryView } from "./FabricInventoryView";
import { HardwareInventoryView } from "./HardwareInventoryView";
import { WallcoveringInventoryView } from "./WallcoveringInventoryView";
import { HeadingInventoryView } from "./HeadingInventoryView";
import { TrimmingsInventoryView } from "./TrimmingsInventoryView";
import { RemnantsInventoryView } from "./RemnantsInventoryView";
import { InventoryAnalytics } from "./InventoryAnalytics";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { InventoryDemoData } from "./InventoryDemoData";
import { ReorderNotificationSystem } from "./ReorderNotificationSystem";
import { InventoryImportExport } from "./InventoryImportExport";
import { VendorDashboard } from "../vendors/VendorDashboard";
import { InventoryFilters } from "../library/InventoryFilters";

import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useVendors } from "@/hooks/useVendors";
import { useHasPermission, useHasAnyPermission } from "@/hooks/usePermissions";
import { HelpDrawer } from "@/components/ui/help-drawer";
import { HelpIcon } from "@/components/ui/help-icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const ModernInventoryDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeTab, setActiveTab] = useState("overview");
  const [showSearch, setShowSearch] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedItemId, setScannedItemId] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedVendor, setSelectedVendor] = useState<string | undefined>();
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>();
  const { data: allInventory, refetch } = useEnhancedInventory();
  const { data: vendors } = useVendors();
  const isMobile = useIsMobile();
  
  // Permission checks - CRITICAL for data security
  const canViewInventory = useHasPermission('view_inventory');
  const canManageInventory = useHasPermission('manage_inventory');
  const hasAnyInventoryAccess = useHasAnyPermission(['view_inventory', 'manage_inventory']);
  
  // Filter out treatment options - only show physical inventory
  const inventory = allInventory?.filter(item => item.category !== 'treatment_option') || [];

  const handleScan = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    if (item) {
      setScannedItemId(itemId);
      setSelectedItem(item);
      setShowQuickActions(true);
    } else {
      toast.error('Item not found');
    }
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setShowQuickActions(false);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setShowQuickActions(false);
  };

  // If no inventory permissions at all, show access denied
  if (hasAnyInventoryAccess === false) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access the inventory library. Please contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  // During permission loading, show loading state
  if (hasAnyInventoryAccess === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Package className="h-16 w-16 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 space-y-4", isMobile ? "p-3 pb-20" : "p-6")}>
      {/* Header - Minimal */}
      <div className={cn(
        "flex items-center",
        isMobile ? "flex-col gap-3" : "justify-between"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          isMobile && "w-full"
        )}>
          <div className={cn("p-2 bg-primary/10 rounded-lg", isMobile && "p-1.5")}>
            <Package className={cn(isMobile ? "h-5 w-5" : "h-6 w-6", "text-primary")} />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <h1 className={cn(
              "font-bold text-foreground",
              isMobile ? "text-lg" : "text-2xl"
            )}>
              Library
            </h1>
            {!isMobile && <HelpIcon onClick={() => setShowHelp(true)} />}
          </div>
          <Badge className={cn(
            "bg-accent/10 text-accent border-accent/20",
            isMobile && "text-xs"
          )}>
            {inventory?.length || 0}
          </Badge>
        </div>
        <div className={cn(
          "flex items-center gap-2",
          isMobile && "w-full"
        )}>
          {/* Compact Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isMobile ? "Search..." : "Search inventory..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("pl-9", isMobile ? "h-9 text-sm" : "h-9")}
            />
          </div>
          
          {!isMobile && (
            <>
              {/* View Toggle */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-7 w-7 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-7 w-7 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Primary Actions */}
              <Button
                variant="outline"
                onClick={() => setShowScanner(true)}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Scan
              </Button>

              <AddInventoryDialog
                trigger={
                  <Button variant="default">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                }
                onSuccess={refetch}
              />

              <Button 
                variant="outline"
                onClick={() => setActiveTab("analytics")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Import/Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={cn(
          "bg-background border-b border-border/50 rounded-none p-0 h-auto flex w-full gap-0",
          isMobile ? "overflow-x-auto justify-start" : "justify-start"
        )}>
          <TabsTrigger value="overview" className={cn(
            "flex items-center gap-2 transition-all duration-200 font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50",
            isMobile ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
          )}>
            <Package className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="fabrics" className={cn(
            "flex items-center gap-2 transition-all duration-200 font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50",
            isMobile ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
          )}>
            <Home className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
            <span>Fabrics</span>
          </TabsTrigger>
          <TabsTrigger value="hardware" className={cn(
            "flex items-center gap-2 transition-all duration-200 font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50",
            isMobile ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
          )}>
            <Minus className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
            <span>Hardware</span>
          </TabsTrigger>
          <TabsTrigger value="wallcoverings" className={cn(
            "flex items-center gap-2 transition-all duration-200 font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50",
            isMobile ? "px-3 py-2 text-xs whitespace-nowrap" : "px-4 py-3 text-sm"
          )}>
            <Wallpaper className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
            <span>{isMobile ? "Walls" : "Wallcoverings"}</span>
          </TabsTrigger>
          <TabsTrigger value="headings" className={cn(
            "flex items-center gap-2 transition-all duration-200 font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50",
            isMobile ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
          )}>
            <Minus className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
            <span>Tapes</span>
          </TabsTrigger>
          <TabsTrigger value="trimmings" className={cn(
            "flex items-center gap-2 transition-all duration-200 font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50",
            isMobile ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
          )}>
            <Palette className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
            <span>Trimmings</span>
          </TabsTrigger>
          <TabsTrigger value="remnants" className={cn(
            "flex items-center gap-2 transition-all duration-200 font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50",
            isMobile ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
          )}>
            <Package className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
            <span>Remnants</span>
          </TabsTrigger>
          <TabsTrigger value="vendors" className={cn(
            "flex items-center gap-2 transition-all duration-200 font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50",
            isMobile ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
          )}>
            <Package className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
            <span>Vendors</span>
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="analytics" className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50">
                <Palette className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BusinessInventoryOverview />
          
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
                      {inventory.filter(i => i.category === 'fabric').length || 0} Items
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
                      {inventory.filter(i => i.category === 'hardware').length || 0} Items
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs group-hover:text-primary">
                      View →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20" onClick={() => setActiveTab("wallcoverings")}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Wallpaper className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Wallcoverings</CardTitle>
                        <CardDescription className="text-xs">
                          Wallpaper & coverings
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {inventory.filter(i => i.category === 'wallcovering').length || 0} Items
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
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Alerts</h2>
            <ReorderNotificationSystem />
          </div>
        </TabsContent>

        <TabsContent value="fabrics" className="space-y-6">
          <InventoryFilters
            selectedVendor={selectedVendor}
            selectedCollection={selectedCollection}
            searchTerm={searchQuery}
            onVendorChange={setSelectedVendor}
            onCollectionChange={setSelectedCollection}
            onSearchChange={setSearchQuery}
          />
          <FabricInventoryView searchQuery={searchQuery} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="hardware" className="space-y-6">
          <InventoryFilters
            selectedVendor={selectedVendor}
            selectedCollection={selectedCollection}
            searchTerm={searchQuery}
            onVendorChange={setSelectedVendor}
            onCollectionChange={setSelectedCollection}
            onSearchChange={setSearchQuery}
          />
          <HardwareInventoryView searchQuery={searchQuery} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="wallcoverings" className="space-y-6">
          <InventoryFilters
            selectedVendor={selectedVendor}
            selectedCollection={selectedCollection}
            searchTerm={searchQuery}
            onVendorChange={setSelectedVendor}
            onCollectionChange={setSelectedCollection}
            onSearchChange={setSearchQuery}
          />
          <WallcoveringInventoryView searchQuery={searchQuery} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="headings" className="space-y-6">
          <InventoryFilters
            selectedVendor={selectedVendor}
            selectedCollection={selectedCollection}
            searchTerm={searchQuery}
            onVendorChange={setSelectedVendor}
            onCollectionChange={setSelectedCollection}
            onSearchChange={setSearchQuery}
          />
          <HeadingInventoryView searchQuery={searchQuery} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="trimmings" className="space-y-6">
          <TrimmingsInventoryView searchQuery={searchQuery} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="remnants" className="space-y-6">
          <RemnantsInventoryView searchQuery={searchQuery} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <VendorDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <InventoryAnalytics />
          
          {/* Import/Export Tools */}
          <div data-import-export className="mt-6">
            <InventoryImportExport />
          </div>
        </TabsContent>
      </Tabs>
      
      <HelpDrawer
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Inventory Management"
        sections={{
          purpose: {
            title: "What this page is for",
            content: "Track and manage all your window treatment materials including fabrics, hardware, tracks, and pre-configured assembly kits. Monitor stock levels and vendor relationships."
          },
          actions: {
            title: "Common actions",
            content: "Add new inventory items, track stock levels, create assembly kits, manage vendor relationships, import/export inventory data, and set reorder alerts."
          },
          tips: {
            title: "Tips & best practices",
            content: "Set reorder points for critical items. Use categories consistently. Keep vendor information updated. Regular stock audits help maintain accuracy."
          },
          shortcuts: [
            { key: "Ctrl + A", description: "Add new item" },
            { key: "Ctrl + F", description: "Toggle search" },
            { key: "Tab", description: "Switch between tabs" }
          ]
        }}
      />

      <QRCodeScanner
        open={showScanner}
        onOpenChange={setShowScanner}
        onScan={handleScan}
      />

      {selectedItem && (
        <QRCodeQuickActions
          open={showQuickActions}
          onOpenChange={setShowQuickActions}
          itemId={selectedItem.id}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};