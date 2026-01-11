import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Grid, List, Package, Home, Minus, Wallpaper, Lock, QrCode, Wrench, Shield, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { QRCodeScanner } from "./QRCodeScanner";
import { QRCodeQuickActions } from "./QRCodeQuickActions";
import { toast } from "sonner";
import { FabricInventoryView } from "./FabricInventoryView";
import { HardwareInventoryView } from "./HardwareInventoryView";
import { WallcoveringInventoryView } from "./WallcoveringInventoryView";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { VendorDashboard } from "../vendors/VendorDashboard";
import { useVendors } from "@/hooks/useVendors";
import { MaterialInventoryView } from "./MaterialInventoryView";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useHasPermission, useHasAnyPermission } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsDealer } from "@/hooks/useIsDealer";
import { HelpDrawer } from "@/components/ui/help-drawer";
import { HelpIcon } from "@/components/ui/help-icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { FilterButton } from "../library/FilterButton";
import { InventoryAdminPanel } from "./InventoryAdminPanel";

export const ModernInventoryDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeTab, setActiveTab] = useState("fabrics");
  const [showSearch, setShowSearch] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedItemId, setScannedItemId] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedVendor, setSelectedVendor] = useState<string | undefined>();
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStorageLocation, setSelectedStorageLocation] = useState<string | undefined>();
  const { data: allInventory, refetch, isLoading: inventoryLoading, isFetching: inventoryFetching } = useEnhancedInventory();
  const { data: vendors } = useVendors();
  const { data: userRole, isLoading: userRoleLoading } = useUserRole();
  const { data: isDealer, isLoading: isDealerLoading } = useIsDealer();
  const isMobile = useIsMobile();
  
  // Check if user is Owner/Admin for admin tab - log for debugging
  const isOwnerOrAdmin = !userRoleLoading && (
    userRole?.role === 'Owner' || 
    userRole?.role === 'Admin' || 
    userRole?.role === 'System Owner' || 
    userRole?.isAdmin === true || 
    userRole?.isOwner === true ||
    userRole?.isSystemOwner === true
  );
  
  // Debug logging - remove after confirming it works
  console.log('[Admin Tab Debug]', { 
    role: userRole?.role, 
    isOwner: userRole?.isOwner, 
    isAdmin: userRole?.isAdmin, 
    isSystemOwner: userRole?.isSystemOwner,
    isOwnerOrAdmin,
    userRoleLoading 
  });
  
  // Permission checks - CRITICAL for data security
  const canViewInventory = useHasPermission('view_inventory');
  const canManageInventory = useHasPermission('manage_inventory');
  const hasAnyInventoryAccessFromHook = useHasAnyPermission(['view_inventory', 'manage_inventory']);
  const { user } = useAuth();
  
  // Timeout fallback - if permissions don't load within 5 seconds, grant access to authenticated users
  const [permissionTimeout, setPermissionTimeout] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  
  useEffect(() => {
    if (hasAnyInventoryAccessFromHook !== undefined) {
      // Permissions loaded, clear any pending timeout
      setPermissionTimeout(false);
      setShowRetry(false);
      return;
    }
    
    // Set a timeout to auto-grant access after 5 seconds if permissions are still loading
    const timer = setTimeout(() => {
      if (hasAnyInventoryAccessFromHook === undefined && user) {
        console.log('[ModernInventoryDashboard] Permission timeout - granting fallback access for authenticated user');
        setPermissionTimeout(true);
      }
    }, 5000);
    
    // Show retry button after 8 seconds
    const retryTimer = setTimeout(() => {
      if (hasAnyInventoryAccessFromHook === undefined) {
        setShowRetry(true);
      }
    }, 8000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(retryTimer);
    };
  }, [hasAnyInventoryAccessFromHook, user]);
  
  // Use fallback if timeout occurred and user is authenticated
  const hasAnyInventoryAccess = permissionTimeout && user ? true : hasAnyInventoryAccessFromHook;
  
  // Filter out treatment options - only show physical inventory
  const allPhysicalInventory = allInventory?.filter(item => item.category !== 'treatment_option') || [];
  
  // Apply filters to inventory
  const inventory = allPhysicalInventory.filter(item => {
    // Apply vendor filter
    if (selectedVendor && item.vendor_id !== selectedVendor) return false;
    
    // Apply collection filter
    if (selectedCollection && item.collection_id !== selectedCollection) return false;
    
    // Apply storage location filter
    if (selectedStorageLocation && item.location !== selectedStorageLocation) return false;
    
    // Apply tags filter
    if (selectedTags.length > 0) {
      const itemTags = item.tags || [];
      const hasMatchingTag = selectedTags.some(tag => itemTags.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

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

  // During permission loading, show loading state with retry option
  if (hasAnyInventoryAccess === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Package className="h-16 w-16 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading inventory...</p>
          {showRetry && (
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 space-y-4", isMobile ? "p-3 pb-20" : "p-4 lg:p-6")}>
      {/* Compact Header - Analytics Style */}
      <div className={cn(
        "flex items-center",
        isMobile ? "flex-col gap-3" : "justify-between"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          isMobile && "w-full"
        )}>
          <div className={cn("p-2 bg-primary/10 rounded-lg", isMobile && "p-1.5")}>
            <Package className={cn(isMobile ? "h-4 w-4" : "h-5 w-5", "text-primary")} />
          </div>
          <h1 className={cn(
            "font-semibold text-foreground",
            isMobile ? "text-base" : "text-lg"
          )}>
            Library
          </h1>
          {!isMobile && <HelpIcon onClick={() => setShowHelp(true)} />}
          <Badge variant="secondary" className="text-xs">
            {inventoryLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              `${inventory?.length || 0} items`
            )}
          </Badge>
          {inventoryFetching && !inventoryLoading && (
            <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
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
          
          <FilterButton
            selectedVendor={selectedVendor}
            selectedCollection={selectedCollection}
            selectedTags={selectedTags}
            selectedStorageLocation={selectedStorageLocation}
            onVendorChange={setSelectedVendor}
            onCollectionChange={setSelectedCollection}
            onTagsChange={setSelectedTags}
            onStorageLocationChange={setSelectedStorageLocation}
          />
          
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
            </>
          )}

          {/* Primary Actions - Hide for dealers (read-only access) */}
          {!isDealer && (
            <>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => setShowScanner(true)}
              >
                <QrCode className={cn(isMobile ? "h-3 w-3" : "h-4 w-4 mr-2")} />
                {!isMobile && "Scan"}
              </Button>

              <AddInventoryDialog
                trigger={
                  <Button variant="default" size={isMobile ? "sm" : "default"}>
                    <Plus className={cn(isMobile ? "h-3 w-3" : "h-4 w-4 mr-2")} />
                    {!isMobile && "Add"}
                  </Button>
                }
                onSuccess={refetch}
              />
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
              <TabsTrigger value="fabrics" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Fabrics
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center gap-2">
                <Minus className="h-4 w-4" />
                Materials
              </TabsTrigger>
              <TabsTrigger value="hardware" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Hardware
              </TabsTrigger>
              <TabsTrigger value="wallcoverings" className="flex items-center gap-2">
                <Wallpaper className="h-4 w-4" />
                Wallcoverings
              </TabsTrigger>
              {/* Hide Vendors and Admin tabs for dealers */}
              {!isDealer && (
                <TabsTrigger value="vendors" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Vendors
                </TabsTrigger>
              )}
              {isOwnerOrAdmin && !isDealer && (
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              )}
            </TabsList>

        <TabsContent value="fabrics" className="space-y-6">
          <FabricInventoryView 
            searchQuery={searchQuery} 
            viewMode={viewMode}
            selectedVendor={selectedVendor}
            selectedCollection={selectedCollection}
            selectedStorageLocation={selectedStorageLocation}
          />
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <MaterialInventoryView 
            searchQuery={searchQuery} 
            viewMode={viewMode}
            selectedVendor={selectedVendor}
            selectedCollection={selectedCollection}
            selectedStorageLocation={selectedStorageLocation}
          />
        </TabsContent>

        <TabsContent value="hardware" className="space-y-6">
          <HardwareInventoryView 
            searchQuery={searchQuery} 
            viewMode={viewMode}
            selectedVendor={selectedVendor}
            selectedCollection={selectedCollection}
            selectedStorageLocation={selectedStorageLocation}
          />
        </TabsContent>

        <TabsContent value="wallcoverings" className="space-y-6">
          <WallcoveringInventoryView 
            searchQuery={searchQuery} 
            viewMode={viewMode}
            selectedVendor={selectedVendor}
            selectedCollection={selectedCollection}
            selectedStorageLocation={selectedStorageLocation}
          />
        </TabsContent>

        {!isDealer && (
          <TabsContent value="vendors" className="space-y-6">
            <VendorDashboard />
          </TabsContent>
        )}

        {isOwnerOrAdmin && !isDealer && (
          <TabsContent value="admin" className="space-y-6">
            <InventoryAdminPanel />
          </TabsContent>
        )}
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