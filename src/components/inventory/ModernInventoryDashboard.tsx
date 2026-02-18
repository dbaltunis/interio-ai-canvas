import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Grid, List, Package, Lock, QrCode, RefreshCw, PanelLeft } from "lucide-react";
import { QRCodeScanner } from "./QRCodeScanner";
import { QRCodeQuickActions } from "./QRCodeQuickActions";
import { toast } from "sonner";
import { FabricInventoryView } from "./FabricInventoryView";
import { HardwareInventoryView } from "./HardwareInventoryView";
import { WallcoveringInventoryView } from "./WallcoveringInventoryView";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { VendorDashboard } from "../vendors/VendorDashboard";
import { MaterialInventoryView } from "./MaterialInventoryView";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useHasPermission } from "@/hooks/usePermissions";
import { useIsDealer } from "@/hooks/useIsDealer";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { FilterButton } from "../library/FilterButton";
import { InventoryAdminPanel } from "./InventoryAdminPanel";
import { useCollectionsWithCounts } from "@/hooks/useCollections";
import { HeadingInventoryManager } from "@/components/settings/tabs/components/HeadingInventoryManager";
import { CategoryBrandSidebar, type LibraryNavState } from "../library/CategoryBrandSidebar";
import { BrandsOverviewGrid } from "../library/BrandsOverviewGrid";
import { BrandDetailView } from "../library/BrandDetailView";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const ModernInventoryDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // New sidebar-driven navigation state (replaces tabs)
  const [navState, setNavState] = useState<LibraryNavState>(() => {
    try {
      const saved = sessionStorage.getItem("library_nav_state");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      selectedCategory: null,
      selectedVendorId: null,
      selectedCollectionId: null,
      view: "brands-grid",
    };
  });

  // Persist nav state
  useEffect(() => {
    sessionStorage.setItem("library_nav_state", JSON.stringify(navState));
  }, [navState]);

  const [showScanner, setShowScanner] = useState(false);
  const [scannedItemId, setScannedItemId] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStorageLocation, setSelectedStorageLocation] = useState<string | undefined>();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const { data: allInventory, refetch, isLoading: inventoryLoading, isFetching: inventoryFetching } = useEnhancedInventory();
  const { data: collections = [] } = useCollectionsWithCounts();
  const { data: isDealer, isLoading: isDealerLoading } = useIsDealer();
  const isMobile = useIsMobile();

  // Permission checks
  const canViewInventory = useHasPermission('view_inventory') !== false;
  const canManageInventory = useHasPermission('manage_inventory') !== false;
  const canManageInventoryAdmin = useHasPermission('manage_inventory_admin') !== false;

  // Redirect away from admin if no permission
  useEffect(() => {
    if (navState.view === "admin" && !canManageInventoryAdmin) {
      setNavState(prev => ({ ...prev, view: "brands-grid" }));
    }
  }, [navState.view, canManageInventoryAdmin]);

  const hasAnyInventoryAccessFromHook = canViewInventory || canManageInventory;

  const hasAnyInventoryAccess = useMemo(() => {
    if (isDealerLoading) return undefined;
    if (isDealer === true) return true;
    return hasAnyInventoryAccessFromHook;
  }, [isDealerLoading, isDealer, hasAnyInventoryAccessFromHook]);

  // Filter out treatment options
  const allPhysicalInventory = allInventory?.filter(item => item.category !== 'treatment_option') || [];

  // Derive vendor/collection filters from navState
  const selectedVendor = navState.selectedVendorId === "unassigned" ? undefined : navState.selectedVendorId || undefined;
  const selectedCollection = navState.selectedCollectionId || undefined;

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

  // Render the main content area based on navigation state
  const renderContent = () => {
    // Vendors management view
    if (navState.view === "vendors") {
      return <VendorDashboard />;
    }

    // Admin panel
    if (navState.view === "admin") {
      return <InventoryAdminPanel />;
    }

    // Brands overview grid (default landing)
    if (navState.view === "brands-grid") {
      return (
        <BrandsOverviewGrid
          searchQuery={searchQuery}
          onSelectBrand={(vendorId) =>
            setNavState({
              selectedCategory: null,
              selectedVendorId: vendorId,
              selectedCollectionId: null,
              view: "brand-detail",
            })
          }
        />
      );
    }

    // Brand detail view
    if (navState.view === "brand-detail" && navState.selectedVendorId) {
      return (
        <BrandDetailView
          vendorId={navState.selectedVendorId}
          searchQuery={searchQuery}
          onBack={() =>
            setNavState({
              selectedCategory: null,
              selectedVendorId: null,
              selectedCollectionId: null,
              view: "brands-grid",
            })
          }
          onSelectCollection={(collectionId) =>
            setNavState((prev) => ({
              ...prev,
              selectedCollectionId: collectionId,
              view: "items",
            }))
          }
          onViewAllItems={() =>
            setNavState((prev) => ({
              ...prev,
              selectedCategory: null,
              view: "items",
            }))
          }
        />
      );
    }

    // Items view — route to appropriate category view
    const category = navState.selectedCategory;
    const sharedProps = {
      searchQuery,
      viewMode,
      selectedVendor,
      selectedCollection,
      selectedStorageLocation,
      canManageInventory,
    };

    if (category === "fabric") {
      return <FabricInventoryView {...sharedProps} />;
    }
    if (category === "hardware") {
      return <HardwareInventoryView {...sharedProps} />;
    }
    if (category === "material") {
      return <MaterialInventoryView {...sharedProps} />;
    }
    if (category === "wallcovering") {
      return (
        <WallcoveringInventoryView
          canManageInventory={canManageInventory}
          searchQuery={searchQuery}
          viewMode={viewMode}
          selectedVendor={selectedVendor}
          selectedCollection={selectedCollection}
          selectedStorageLocation={selectedStorageLocation}
        />
      );
    }

    // If a vendor is selected but no category, show a combined view (default to fabrics as most common)
    if (navState.selectedVendorId && !category) {
      return <FabricInventoryView {...sharedProps} />;
    }

    // Fallback: brands grid
    return (
      <BrandsOverviewGrid
        searchQuery={searchQuery}
        onSelectBrand={(vendorId) =>
          setNavState({
            selectedCategory: null,
            selectedVendorId: vendorId,
            selectedCollectionId: null,
            view: "brand-detail",
          })
        }
      />
    );
  };

  // Show view mode toggle only when viewing items
  const showViewToggle = navState.view === "items";
  // Show filter button only when viewing items
  const showFilters = navState.view === "items";

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

  const sidebarContent = (
    <CategoryBrandSidebar
      navState={navState}
      onNavigate={(newState) => {
        setNavState(newState);
        setMobileSheetOpen(false);
      }}
      canManageInventoryAdmin={canManageInventoryAdmin}
      isDealer={isDealer === true}
    />
  );

  return (
    <div className="h-[calc(100dvh-3.5rem)] flex overflow-hidden">
      {/* Apple-style sidebar — always visible on desktop */}
      {!isMobile && sidebarContent}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header bar */}
        <div className="sticky top-0 z-20 bg-background border-b flex-shrink-0">
          <div className={cn(
            "flex items-center gap-2",
            isMobile ? "px-3 py-2" : "px-4 py-2.5"
          )}>
            {/* Mobile sidebar toggle */}
            {isMobile && (
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px]">
                  {sidebarContent}
                </SheetContent>
              </Sheet>
            )}

            {/* Title area */}
            <div className="flex items-center gap-2 mr-auto">
              <div className={cn("p-1.5 bg-primary/10 rounded-lg")}>
                <Package className="h-4 w-4 text-primary" />
              </div>
              <h1 className="font-semibold text-foreground text-sm">
                Library
              </h1>
              <SectionHelpButton sectionId="library" size="sm" />
              <Badge variant="secondary" className="text-xs">
                {inventoryLoading ? (
                  <Skeleton className="h-3 w-10 inline-block" />
                ) : (
                  `${allPhysicalInventory?.length || 0} items`
                )}
              </Badge>
              {inventoryFetching && !inventoryLoading && (
                <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Search */}
            <div className="relative w-48 lg:w-64">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm bg-muted/40 border-0 focus-visible:ring-1"
              />
            </div>

            {/* Filters — only when viewing items */}
            {showFilters && (
              <FilterButton
                selectedVendor={selectedVendor}
                selectedCollection={selectedCollection}
                selectedTags={selectedTags}
                selectedStorageLocation={selectedStorageLocation}
                onVendorChange={(v) =>
                  setNavState((prev) => ({ ...prev, selectedVendorId: v || null }))
                }
                onCollectionChange={(c) =>
                  setNavState((prev) => ({ ...prev, selectedCollectionId: c || null }))
                }
                onTagsChange={setSelectedTags}
                onStorageLocationChange={setSelectedStorageLocation}
              />
            )}

            {/* View toggle — only when viewing items */}
            {showViewToggle && !isMobile && (
              <div className="flex items-center gap-0.5 border rounded-md p-0.5">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-6 w-6 p-0"
                >
                  <Grid className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-6 w-6 p-0"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Primary actions */}
            {!isDealer && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScanner(true)}
                  className="h-8"
                >
                  <QrCode className="h-3.5 w-3.5 mr-1.5" />
                  {!isMobile && "Scan"}
                </Button>

                {canManageInventory && (
                  <AddInventoryDialog
                    trigger={
                      <Button variant="default" size="sm" className="h-8">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
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

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {renderContent()}
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
