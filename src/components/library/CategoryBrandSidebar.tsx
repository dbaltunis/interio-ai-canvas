import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, Package, Building2, Shield, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PixelFabricIcon, PixelMaterialIcon, PixelHardwareIcon, PixelWallpaperIcon, PixelBriefcaseIcon } from "@/components/icons/PixelArtIcons";
import { useCategoryVendorTree, type CategoryNode, type BrandNode } from "@/hooks/useCategoryVendorTree";
import { cn } from "@/lib/utils";

export interface LibraryNavState {
  selectedCategory: string | null;
  selectedVendorId: string | null;
  selectedCollectionId: string | null;
  view: "brands-grid" | "brand-detail" | "items" | "vendors" | "admin";
}

interface CategoryBrandSidebarProps {
  navState: LibraryNavState;
  onNavigate: (state: LibraryNavState) => void;
  canManageInventoryAdmin?: boolean;
  isDealer?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  fabric: <PixelFabricIcon size={14} />,
  hardware: <PixelHardwareIcon size={14} />,
  material: <PixelMaterialIcon size={14} />,
  wallcovering: <PixelWallpaperIcon size={14} />,
  service: <PixelBriefcaseIcon size={14} />,
  heading: <PixelFabricIcon size={14} />,
};

export const CategoryBrandSidebar = ({
  navState,
  onNavigate,
  canManageInventoryAdmin = false,
  isDealer = false,
}: CategoryBrandSidebarProps) => {
  const { categories, totalItems, isLoading } = useCategoryVendorTree();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("library.sidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("library.sidebarCollapsed", String(next));
      } catch {}
      return next;
    });
  };

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleBrand = (key: string) => {
    setExpandedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Filter categories/brands/collections by search
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    const search = searchTerm.toLowerCase();

    return categories
      .map((cat) => {
        const filteredBrands = cat.brands
          .map((brand) => {
            const brandMatches = brand.vendorName.toLowerCase().includes(search);
            const filteredColls = brand.collections.filter((c) =>
              c.name.toLowerCase().includes(search)
            );

            if (brandMatches) return brand; // show all collections if brand matches
            if (filteredColls.length > 0) {
              return { ...brand, collections: filteredColls };
            }
            return null;
          })
          .filter(Boolean) as BrandNode[];

        const catMatches = cat.label.toLowerCase().includes(search);
        if (catMatches) return cat; // show all brands if category matches
        if (filteredBrands.length > 0) {
          return { ...cat, brands: filteredBrands };
        }
        return null;
      })
      .filter(Boolean) as CategoryNode[];
  }, [categories, searchTerm]);

  // Auto-expand categories when searching
  const effectiveExpandedCategories = useMemo(() => {
    if (searchTerm) {
      return new Set(filteredCategories.map((c) => c.key));
    }
    return expandedCategories;
  }, [searchTerm, filteredCategories, expandedCategories]);

  const effectiveExpandedBrands = useMemo(() => {
    if (searchTerm) {
      const all = new Set<string>();
      filteredCategories.forEach((cat) =>
        cat.brands.forEach((b) => all.add(`${cat.key}-${b.vendorId}`))
      );
      return all;
    }
    return expandedBrands;
  }, [searchTerm, filteredCategories, expandedBrands]);

  const isActive = (
    category: string | null,
    vendorId: string | null,
    collectionId: string | null
  ) => {
    return (
      navState.selectedCategory === category &&
      navState.selectedVendorId === vendorId &&
      navState.selectedCollectionId === collectionId
    );
  };

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className="w-12 min-w-12 border-r bg-background flex flex-col h-full flex-shrink-0 transition-all duration-300 overflow-hidden">
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="w-8 h-8"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-[280px] min-w-[280px] max-w-[280px] border-r bg-background flex flex-col h-full flex-shrink-0">
        <div className="px-3 py-4 space-y-3">
          <Skeleton className="h-9 w-full" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[280px] min-w-[280px] max-w-[280px] border-r bg-background flex flex-col h-full flex-shrink-0 transition-all duration-300 overflow-hidden">
      <ScrollArea className="flex-1 min-h-0" style={{ overflowX: "hidden" }}>
        <div
          className="flex flex-col px-3 py-4 overflow-x-hidden"
          style={{ width: "256px", maxWidth: "256px" }}
        >
          {/* Header with collapse */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Library</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="h-7 w-7 p-0"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
            <Input
              placeholder="Search library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-sm bg-muted/40 border-0 focus-visible:ring-1"
            />
          </div>

          {/* All Items */}
          <button
            type="button"
            className={cn(
              "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md transition-colors text-left mb-1",
              navState.view === "brands-grid" && !navState.selectedCategory
                ? "bg-primary/10 text-primary"
                : "hover:bg-accent/40"
            )}
            onClick={() =>
              onNavigate({
                selectedCategory: null,
                selectedVendorId: null,
                selectedCollectionId: null,
                view: "brands-grid",
              })
            }
          >
            <FolderOpen className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">All Items</span>
            <span className="text-[10px] text-muted-foreground/50 tabular-nums">
              {totalItems}
            </span>
          </button>

          {/* Separator */}
          <div className="h-px bg-border/60 my-3" />

          {/* Categories section header */}
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 px-0.5">
            Categories
          </div>

          {/* Category tree */}
          <div className="space-y-0.5">
            {filteredCategories.map((category) => {
              const isCatExpanded = effectiveExpandedCategories.has(category.key);
              const isCatActive = isActive(category.key, null, null);

              return (
                <Collapsible
                  key={category.key}
                  open={isCatExpanded}
                  onOpenChange={() => toggleCategory(category.key)}
                >
                  <div className="flex items-center">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 p-0"
                      >
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 transition-transform text-muted-foreground/60",
                            isCatExpanded && "rotate-90"
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <button
                      type="button"
                      className={cn(
                        "flex items-center gap-2.5 flex-1 px-2 py-1.5 rounded-md transition-colors text-left",
                        isCatActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent/40"
                      )}
                      onClick={() =>
                        onNavigate({
                          selectedCategory: category.key,
                          selectedVendorId: null,
                          selectedCollectionId: null,
                          view: "items",
                        })
                      }
                    >
                      <span className="flex-shrink-0">
                        {CATEGORY_ICONS[category.key] || (
                          <Package className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="text-sm font-medium flex-1 truncate">
                        {category.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                        {category.totalCount}
                      </span>
                    </button>
                  </div>

                  <CollapsibleContent>
                    <div className="ml-4 pl-3 border-l border-border/40 space-y-0.5 py-0.5">
                      {category.brands.map((brand) => {
                        const brandKey = `${category.key}-${brand.vendorId}`;
                        const isBrandExpanded =
                          effectiveExpandedBrands.has(brandKey);
                        const isBrandActive = isActive(
                          category.key,
                          brand.vendorId,
                          null
                        );

                        return (
                          <Collapsible
                            key={brand.vendorId}
                            open={isBrandExpanded}
                            onOpenChange={() => toggleBrand(brandKey)}
                          >
                            <div className="flex items-center">
                              {brand.collections.length > 0 && (
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0 p-0"
                                  >
                                    <ChevronRight
                                      className={cn(
                                        "h-2.5 w-2.5 transition-transform text-muted-foreground/50",
                                        isBrandExpanded && "rotate-90"
                                      )}
                                    />
                                  </Button>
                                </CollapsibleTrigger>
                              )}
                              {brand.collections.length === 0 && (
                                <div className="w-6 shrink-0" />
                              )}
                              <button
                                type="button"
                                className={cn(
                                  "flex items-center gap-2 flex-1 px-1.5 py-1 rounded-md transition-colors text-left",
                                  isBrandActive
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-accent/40"
                                )}
                                onClick={() =>
                                  onNavigate({
                                    selectedCategory: category.key,
                                    selectedVendorId: brand.vendorId,
                                    selectedCollectionId: null,
                                    view: "brand-detail",
                                  })
                                }
                              >
                                <Building2 className="h-3 w-3 flex-shrink-0 text-muted-foreground/60" />
                                <span className="text-xs font-medium flex-1 truncate">
                                  {brand.vendorName}
                                </span>
                                <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                                  {brand.totalCount}
                                </span>
                              </button>
                            </div>

                            {brand.collections.length > 0 && (
                              <CollapsibleContent>
                                <div className="ml-6 pl-2 border-l border-border/30 space-y-0.5 py-0.5">
                                  {brand.collections.map((collection) => {
                                    const isCollActive = isActive(
                                      category.key,
                                      brand.vendorId,
                                      collection.id
                                    );

                                    return (
                                      <button
                                        key={collection.id}
                                        type="button"
                                        className={cn(
                                          "flex items-center gap-2 w-full px-1.5 py-1 rounded-md transition-colors text-left",
                                          isCollActive
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-accent/40"
                                        )}
                                        onClick={() =>
                                          onNavigate({
                                            selectedCategory: category.key,
                                            selectedVendorId: brand.vendorId,
                                            selectedCollectionId: collection.id,
                                            view: "items",
                                          })
                                        }
                                      >
                                        <Package className="h-2.5 w-2.5 flex-shrink-0 text-muted-foreground/40" />
                                        <span className="text-[11px] flex-1 truncate text-muted-foreground hover:text-foreground">
                                          {collection.name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                                          {collection.itemCount}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </CollapsibleContent>
                            )}
                          </Collapsible>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}

            {filteredCategories.length === 0 && searchTerm && (
              <div className="text-center py-4 text-xs text-muted-foreground/60">
                No results for "{searchTerm}"
              </div>
            )}
          </div>

          {/* Management section */}
          {!isDealer && (
            <>
              <div className="h-px bg-border/60 my-3" />
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 px-0.5">
                Management
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md transition-colors text-left",
                    navState.view === "vendors"
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent/40"
                  )}
                  onClick={() =>
                    onNavigate({
                      selectedCategory: null,
                      selectedVendorId: null,
                      selectedCollectionId: null,
                      view: "vendors",
                    })
                  }
                >
                  <PixelBriefcaseIcon size={14} />
                  <span className="text-sm flex-1">Vendors</span>
                </button>

                {canManageInventoryAdmin && (
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md transition-colors text-left",
                      navState.view === "admin"
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent/40"
                    )}
                    onClick={() =>
                      onNavigate({
                        selectedCategory: null,
                        selectedVendorId: null,
                        selectedCollectionId: null,
                        view: "admin",
                      })
                    }
                  >
                    <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-sm flex-1">Admin</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
