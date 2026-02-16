import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Grid, List, Package, Lock, QrCode, Shield, RefreshCw, FolderOpen, ArrowLeft, Building2 } from "lucide-react";
import { PixelFabricIcon, PixelMaterialIcon, PixelHardwareIcon, PixelWallpaperIcon, PixelBriefcaseIcon } from "@/components/icons/PixelArtIcons";
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
import { useHasPermission } from "@/hooks/usePermissions";
import { useIsDealer } from "@/hooks/useIsDealer";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { FilterButton } from "../library/FilterButton";
import { InventoryAdminPanel } from "./InventoryAdminPanel";
import { CollectionsView } from "../library/CollectionsView";
import { useCollectionsWithCounts } from "@/hooks/useCollections";
import { LibrarySidebar } from "../library/LibrarySidebar";
import { HeadingInventoryManager } from "@/components/settings/tabs/components/HeadingInventoryManager";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const ModernInventoryDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem('library_active_tab');
    return savedTab || "collections";
  });
  const [showSearch, setShowSearch] = useState(false);

  // Persist library sub-tab to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('library_active_tab', activeTab);
  }, [activeTab]);
  
  const [showScanner, setShowScanner] = useState(false);
  const [scannedItemId, setScannedItemId] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedVendor, setSelectedVendor] = useState<string | undefined>();
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStorageLocation, setSelectedStorageLocation] = useState<string | undefined>();
  const [selectedColorTag, setSelectedColorTag] = useState<string | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  
  const { data: allInventory, refetch, isLoading: inventoryLoading, isFetching: inventoryFetching } = useEnhancedInventory();
  const { data: vendors } = useVendors();
  const { data: collections = [] } = useCollectionsWithCounts();
  const { data: isDealer, isLoading: isDealerLoading } = useIsDealer();
  const isMobile = useIsMobile();
  
  // Permission checks
  const canViewInventory = useHasPermission('view_inventory') !== false;
  const canManageInventory = useHasPermission('manage_inventory') !== false;
  const canManageInventoryAdmin = useHasPermission('manage_inventory_admin') !== false;

  // Redirect away from admin tab if user doesn't have permission
  useEffect(() => {
    if (activeTab === "admin" && !canManageInventoryAdmin) {
      setActiveTab("fabrics");
    }
  }, [activeTab, canManageInventoryAdmin]);

  const hasAnyInventoryAccessFromHook = canViewInventory || canManageInventory;
  
  const hasAnyInventoryAccess = useMemo(() => {
    if (isDealerLoading) return undefined;
    if (isDealer === true) return true;
    return hasAnyInventoryAccessFromHook;
  }, [isDealerLoading, isDealer, hasAnyInventoryAccessFromHook]);
  
  // Filter out treatment options - only show physical inventory
  const allPhysicalInventory = allInventory?.filter(item => item.category !== 'treatment_option') || [];
  
  // Apply filters to inventory
  const inventory = allPhysicalInventory.filter(item => {
    if (selectedVendor && item.vendor_id !== selectedVendor) return false;
    if (selectedCollection && item.collection_id !== selectedCollection) return false;
    if (selectedStorageLocation && item.location !== selectedStorageLocation) return false;
    
    if (selectedTags.length > 0) {
      const itemTags = item.tags || [];
      const hasMatchingTag = selectedTags.some(tag => itemTags.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
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

  // Handle sidebar brand selection
  const handleSelectBrand = (brandId: string | null) => {
    if (brandId) {
      setSelectedVendor(brandId === "unassigned" ? undefined : brandId);
    } else {
      setSelectedVendor(undefined);
      setSelectedCollection(undefined);
    }
    setMobileSheetOpen(false);
  };

  // Handle sidebar collection selection
  const handleSelectCollection = (collectionId: string) => {
    setSelectedCollection(collectionId);
    setActiveTab("fabrics");
    setMobileSheetOpen(false);
  };

  // If no inventory permissions at all, show access denied
  if (hasAnyInventoryAccess === false) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access the product library. Please contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  if (hasAnyInventoryAccess === undefined) {
    return null;
  }

  // Sidebar component shared between desktop and mobile sheet
  const sidebarContent = (
    <LibrarySidebar
      selectedBrand={selectedVendor || null}
      onSelectBrand={handleSelectBrand}
      selectedCollection={selectedCollection}
      onSelectCollection={handleSelectCollection}
      selectedColorTag={selectedColorTag}
      onSelectColorTag={setSelectedColorTag}
    />
  );

  return (
    <div className={cn(
      "h-[calc(100dvh-3.5rem)] flex overflow-hidden",
      isMobile && "pb-16"
    )}>
      {/* Persistent sidebar - desktop only */}
      {!isMobile && sidebarContent}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Compact Header */}
        <div className={cn(
          "flex items-center shrink-0 border-b bg-background",
          isMobile ? "flex-col gap-3 p-3" : "justify-between p-4"
        )}>
          <div className={cn(
            "flex items-center gap-3",
            isMobile && "w-full"
          )}>
            {/* Mobile: Sheet trigger for sidebar */}
            {isMobile && (
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Building2 className="h-4 w-4 mr-2" />
                    Brands
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  {sidebarContent}
                </SheetContent>
              </Sheet>
            )}
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
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isMobile ? "Search..." : "Search library..."}
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
            )}

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

        {/* Tabs + scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className={cn(isMobile ? "p-3" : "p-4 lg:p-6")}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
                <TabsTrigger value="collections" className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Collections
                </TabsTrigger>
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
                <TabsTrigger value="headings" className="flex items-center gap-2">
                  Headings
                </TabsTrigger>
                {!isDealer && (
                  <TabsTrigger value="vendors" className="flex items-center gap-2">
                    <PixelBriefcaseIcon size={18} />
                    Vendors
                  </TabsTrigger>
                )}
                {canManageInventoryAdmin && !isDealer && (
                  <TabsTrigger value="admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="fabrics" className="space-y-6">
                {selectedCollection && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedCollection(undefined);
                        setActiveTab("collections");
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Collections
                    </Button>
                    <span className="text-sm text-muted-foreground">|</span>
                    <span className="text-sm font-medium">
                      Viewing: {collections.find(c => c.id === selectedCollection)?.name || "Collection"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setSelectedCollection(undefined)}
                    >
                      Clear Filter
                    </Button>
                  </div>
                )}
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

              <TabsContent value="headings" className="space-y-6">
                <HeadingInventoryManager />
              </TabsContent>

              <TabsContent value="collections" className="space-y-0 -mt-2">
                <CollectionsView 
                  onSelectCollection={(collectionId) => {
                    setSelectedCollection(collectionId);
                    setActiveTab("fabrics");
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
          </div>
        </div>
      </div>

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
