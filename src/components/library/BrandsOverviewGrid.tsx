import { Building2, Package, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useVendorsWithCollections } from "@/hooks/useCollections";
import { cn } from "@/lib/utils";

interface BrandsOverviewGridProps {
  searchQuery?: string;
  onSelectBrand: (vendorId: string) => void;
}

export const BrandsOverviewGrid = ({
  searchQuery,
  onSelectBrand,
}: BrandsOverviewGridProps) => {
  const { data: vendorsWithCollections = [], isLoading } =
    useVendorsWithCollections();

  const filtered = searchQuery
    ? vendorsWithCollections.filter((v) =>
        v.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.collections.some((c) =>
          c.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : vendorsWithCollections;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-foreground/80 mb-1">
          {searchQuery ? "No brands found" : "No brands yet"}
        </h3>
        <p className="text-sm text-muted-foreground/60 max-w-sm">
          {searchQuery
            ? `No brands match "${searchQuery}"`
            : "Import products or add them manually to see your brands here."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Brands</h2>
        <p className="text-sm text-muted-foreground/60 mt-0.5">
          {filtered.length} brand{filtered.length !== 1 ? "s" : ""} in your library
        </p>
      </div>

      {/* Brand cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((brandData) => {
          const vendorId = brandData.vendor?.id || "unassigned";
          const vendorName = brandData.vendor?.name || "Unassigned";
          const collectionCount = brandData.collections.length;
          const totalProducts = brandData.totalItems;

          return (
            <button
              key={vendorId}
              type="button"
              onClick={() => onSelectBrand(vendorId)}
              className={cn(
                "group relative rounded-xl border bg-card p-5 text-left",
                "hover:shadow-md hover:border-primary/20 transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              )}
            >
              {/* Brand icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary/70" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
              </div>

              {/* Brand name */}
              <h3 className="font-semibold text-sm text-foreground truncate mb-2">
                {vendorName}
              </h3>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span className="tabular-nums">{totalProducts}</span> product{totalProducts !== 1 ? "s" : ""}
                </span>
                {collectionCount > 0 && (
                  <span className="tabular-nums">
                    {collectionCount} collection{collectionCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
