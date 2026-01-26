import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Grid, List, Package, Lock, QrCode, Shield, RefreshCw, FolderOpen } from "lucide-react";
import { PixelFabricIcon, PixelMaterialIcon, PixelHardwareIcon, PixelWallpaperIcon, PixelBriefcaseIcon } from "@/components/icons/PixelArtIcons";
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
import { useHasPermission, useHasAnyPermission, useUserPermissions } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsDealer } from "@/hooks/useIsDealer";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { FilterButton } from "../library/FilterButton";
import { InventoryAdminPanel } from "./InventoryAdminPanel";
import { CollectionsView } from "../library/CollectionsView";
import { useCollectionsWithCounts } from "@/hooks/useCollections";

export const ModernInventoryDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeTab, setActiveTab] = useState("fabrics");
  const [showSearch, setShowSearch] = useState(false);
  
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
  const { data: collections = [] } = useCollectionsWithCounts();
  const { data: userRole, isLoading: userRoleLoading } = useUserRole();
  const { data: isDealer, isLoading: isDealerLoading } = useIsDealer();
  const isMobile = useIsMobile();
  
  // Permission checks - CRITICAL for data security
  // Check explicit permissions first, like jobs and clients
  const { user } = useAuth();
  const { data: userRoleData } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  const isOwnerOrAdmin = isOwner || isAdmin;
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-inventory-dashboard', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[ModernInventoryDashboard] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });
  
  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;
  const hasViewInventoryPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_inventory'
  ) ?? false;
  const hasManageInventoryPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'manage_inventory'
  ) ?? false;
  const hasManageInventoryAdminPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'manage_inventory_admin'
  ) ?? false;
  
  // Works like jobs and clients - check explicit permissions first
  const canViewInventory = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasViewInventoryPermission
        : hasViewInventoryPermission;
  
  const canManageInventory = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasManageInventoryPermission
        : hasManageInventoryPermission;

  // Only allow admin access if user is System Owner OR (Owner/Admin *without* explicit permissions) OR (explicit permissions include manage_inventory_admin)
  const canManageInventoryAdmin =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasManageInventoryAdminPermission
          : hasManageInventoryAdminPermission;

  // Redirect away from admin tab if user doesn't have permission
  useEffect(() => {
    if (activeTab === "admin" && !canManageInventoryAdmin && !permissionsLoading && !userRoleLoading && explicitPermissions !== undefined) {
      setActiveTab("fabrics");
    }
  }, [activeTab, canManageInventoryAdmin, permissionsLoading, userRoleLoading, explicitPermissions]);
  
  const hasAnyInventoryAccessFromHook = canViewInventory || canManageInventory;
  
  // Dealers always have browse-only access to the Library
  // Use direct dealer check instead of problematic timeout fallback
  const hasAnyInventoryAccess = useMemo(() => {
    // If dealer check is still loading, return undefined to show loading state
    if (isDealerLoading) return undefined;
    // Dealers always have browse access
    if (isDealer === true) return true;
    // Otherwise use the permission hook result
    return hasAnyInventoryAccessFromHook;
  }, [isDealerLoading, isDealer, hasAnyInventoryAccessFromHook]);
  
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

  // Let parent Suspense handle loading state
  if (hasAnyInventoryAccess === undefined) {
    return null;
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
          <SectionHelpButton sectionId="library" size="sm" />
          <Badge variant="secondary" className="text-xs">
            {inventoryLoading ? (
              <Skeleton className="h-3 w-10 inline-block" />
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

              {canManageInventory && (
                <AddInventoryDialog
                  trigger={
                    <Button variant="default" size={isMobile ? "sm" : "default"}>
                      <Plus className={cn(isMobile ? "h-3 w-3" : "h-4 w-4 mr-2")} />
                      {!isMobile && "Add"}
                    </Button>
                  }
                  onSuccess={refetch}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
              <TabsTrigger value="fabrics" className="flex items-center gap-2">
                <PixelFabricIcon size={18} />
                Fabrics
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center gap-2">
                <PixelMaterialIcon size={18} />
                Materials
              </TabsTrigger>
              <TabsTrigger value="hardware" className="flex items-center gap-2">
                <PixelHardwareIcon size={18} />
                Hardware
              </TabsTrigger>
              <TabsTrigger value="wallcoverings" className="flex items-center gap-2">
                <PixelWallpaperIcon size={18} />
                Wallcoverings
              </TabsTrigger>
              {/* Collections Tab - Browse by vendor ranges */}
              <TabsTrigger value="collections" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Collections
                {collections.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
                    {collections.length}
                  </Badge>
                )}
              </TabsTrigger>
              {/* Hide Vendors and Admin tabs for dealers */}
              {!isDealer && (
                <TabsTrigger value="vendors" className="flex items-center gap-2">
                  <PixelBriefcaseIcon size={18} />
                  Vendors
                </TabsTrigger>
              )}
              {canManageInventoryAdmin && !isDealer && (
                <TabsTrigger 
                  value="admin" 
                  className="flex items-center gap-2"
                  disabled={!canManageInventoryAdmin && !permissionsLoading && !userRoleLoading && explicitPermissions !== undefined}
                  title={!canManageInventoryAdmin && !permissionsLoading && !userRoleLoading && explicitPermissions !== undefined ? "You don't have permission to access inventory administration" : undefined}
                >
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
            canManageInventory={canManageInventory}
          />
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <MaterialInventoryView 
            searchQuery={searchQuery} 
            viewMode={viewMode}
            selectedVendor={selectedVendor}
            selectedCollection={selectedCollection}
            selectedStorageLocation={selectedStorageLocation}
            canManageInventory={canManageInventory}
          />
        </TabsContent>

        <TabsContent value="hardware" className="space-y-6">
          <HardwareInventoryView 
            searchQuery={searchQuery} 
            viewMode={viewMode}
            selectedVendor={selectedVendor}
            selectedCollection={selectedCollection}
            selectedStorageLocation={selectedStorageLocation}
            canManageInventory={canManageInventory}
          />
        </TabsContent>

        <TabsContent value="wallcoverings" className="space-y-6">
          <WallcoveringInventoryView
            canManageInventory={canManageInventory} 
            searchQuery={searchQuery} 
            viewMode={viewMode}
            selectedVendor={selectedVendor}
            selectedCollection={selectedCollection}
            selectedStorageLocation={selectedStorageLocation}
          />
        </TabsContent>

        {/* Collections Tab - Browse by vendor ranges like Shopify */}
        <TabsContent value="collections" className="space-y-6">
          <CollectionsView 
            onSelectCollection={(collectionId) => {
              setSelectedCollection(collectionId);
              setActiveTab("fabrics"); // Switch to fabrics and filter by collection
            }}
            selectedVendor={selectedVendor}
          />
        </TabsContent>

        {!isDealer && (
          <TabsContent value="vendors" className="space-y-6">
            <VendorDashboard />
          </TabsContent>
        )}

        {canManageInventoryAdmin && !isDealer && (
          <TabsContent value="admin" className="space-y-6">
            <InventoryAdminPanel />
          </TabsContent>
        )}
      </Tabs>

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