import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Search, 
  ChevronRight, 
  Building2, 
  Plus, 
  Package,
  FolderOpen
} from "lucide-react";
import { useVendorsWithCollections } from "@/hooks/useCollections";

interface BrandCollectionsSidebarProps {
  selectedBrand: string | null;
  onSelectBrand: (brandId: string | null) => void;
  selectedCollection?: string;
  onSelectCollection?: (collectionId: string) => void;
  className?: string;
  onAddBrand?: () => void;
}

export const BrandCollectionsSidebar = ({
  selectedBrand,
  onSelectBrand,
  selectedCollection,
  onSelectCollection,
  className,
  onAddBrand,
}: BrandCollectionsSidebarProps) => {
  const { data: vendorsWithCollections = [], isLoading } = useVendorsWithCollections();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);

  // Auto-expand first brand with collections on initial load
  useEffect(() => {
    if (!isLoading && vendorsWithCollections.length > 0 && !hasAutoExpanded) {
      const firstBrandWithCollections = vendorsWithCollections.find(v => v.collections.length > 0);
      if (firstBrandWithCollections) {
        const brandId = firstBrandWithCollections.vendor?.id || "unassigned";
        setExpandedBrands(new Set([brandId]));
      }
      setHasAutoExpanded(true);
    }
  }, [isLoading, vendorsWithCollections, hasAutoExpanded]);

  // Filter brands by search term
  const filteredBrands = useMemo(() => {
    if (!searchTerm) return vendorsWithCollections;
    const search = searchTerm.toLowerCase();
    return vendorsWithCollections.filter(
      (v) =>
        v.vendor?.name?.toLowerCase().includes(search) ||
        v.collections.some((c) => c.name?.toLowerCase().includes(search))
    );
  }, [vendorsWithCollections, searchTerm]);

  // Calculate total collections count
  const totalCollections = useMemo(() => {
    return vendorsWithCollections.reduce((sum, v) => sum + v.collections.length, 0);
  }, [vendorsWithCollections]);

  const toggleExpanded = (brandId: string) => {
    setExpandedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brandId)) {
        next.delete(brandId);
      } else {
        next.add(brandId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className={cn("flex flex-col border-r bg-muted/30", className)}>
        <div className="p-3 border-b">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="p-3 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col border-r bg-muted/30", className)}>
      {/* Header */}
      <div className="p-3 border-b space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Brands
          </h3>
          {onAddBrand && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAddBrand}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* All Collections option */}
          <Button
            variant={selectedBrand === null ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start h-9 px-3 text-sm font-medium",
              selectedBrand === null && "bg-primary/10 text-primary"
            )}
            onClick={() => onSelectBrand(null)}
          >
            <FolderOpen className="h-4 w-4 mr-2 shrink-0" />
            All Collections
            <Badge variant="secondary" className="ml-auto text-xs">
              {totalCollections}
            </Badge>
          </Button>

          {/* Brand list */}
          {filteredBrands.map((brandData) => {
            const brandId = brandData.vendor?.id || "unassigned";
            const brandName = brandData.vendor?.name || "Unassigned";
            const isExpanded = expandedBrands.has(brandId);
            const isSelected = selectedBrand === brandId;
            const collectionCount = brandData.collections.length;

            return (
              <Collapsible
                key={brandId}
                open={isExpanded}
                onOpenChange={() => toggleExpanded(brandId)}
              >
                <div className="flex items-center">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                    >
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <Button
                    variant={isSelected ? "secondary" : "ghost"}
                    className={cn(
                      "flex-1 justify-start h-9 px-2 text-sm font-medium",
                      isSelected && "bg-primary/10 text-primary"
                    )}
                    onClick={() => onSelectBrand(brandId)}
                  >
                    <Building2 className="h-3.5 w-3.5 mr-2 shrink-0 text-muted-foreground" />
                    <span className="truncate">{brandName}</span>
                    <Badge 
                      variant="secondary" 
                      className="ml-auto text-xs shrink-0"
                    >
                      {collectionCount}
                    </Badge>
                  </Button>
                </div>

                <CollapsibleContent>
                  <div className="ml-7 pl-2 border-l border-border/50 space-y-0.5 py-1">
                    {brandData.collections.map((collection) => (
                      <Button
                        key={collection.id}
                        variant={selectedCollection === collection.id ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-8 px-2 text-xs",
                          selectedCollection === collection.id && "bg-primary/10 text-primary"
                        )}
                        onClick={() => {
                          onSelectBrand(brandId);
                          onSelectCollection?.(collection.id);
                        }}
                      >
                        <Package className="h-3 w-3 mr-2 shrink-0 text-muted-foreground" />
                        <span className="truncate">{collection.name}</span>
                        <span className="ml-auto text-muted-foreground text-xs shrink-0">
                          {collection.itemCount || 0}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          {filteredBrands.length === 0 && searchTerm && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No brands found for "{searchTerm}"
            </div>
          )}

          {filteredBrands.length === 0 && !searchTerm && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No brands yet</p>
              <p className="text-xs mt-1">
                Brands appear when collections are linked to vendors
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
