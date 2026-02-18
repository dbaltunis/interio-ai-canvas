import { ArrowLeft, Package, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVendorsWithCollections } from "@/hooks/useCollections";
import { useVendors } from "@/hooks/useVendors";
import { cn } from "@/lib/utils";

interface BrandDetailViewProps {
  vendorId: string;
  searchQuery?: string;
  onBack: () => void;
  onSelectCollection: (collectionId: string) => void;
  onViewAllItems: () => void;
}

export const BrandDetailView = ({
  vendorId,
  searchQuery,
  onBack,
  onSelectCollection,
  onViewAllItems,
}: BrandDetailViewProps) => {
  const { data: vendorsWithCollections = [], isLoading } =
    useVendorsWithCollections();
  const { data: vendors = [] } = useVendors();

  const vendorData = vendorsWithCollections.find(
    (v) => (v.vendor?.id || "unassigned") === vendorId
  );

  const vendor = vendors.find((v: any) => v.id === vendorId);
  const vendorName =
    vendorData?.vendor?.name || vendor?.name || "Unassigned";

  const collections = (vendorData?.collections || []).filter((c) => {
    if (!searchQuery) return true;
    return c.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="h-4 w-px bg-border/60" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary/70" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground leading-tight">
              {vendorName}
            </h2>
            <p className="text-xs text-muted-foreground/60">
              {vendorData?.totalItems || 0} products across{" "}
              {collections.length} collection
              {collections.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* View all items button */}
      <button
        type="button"
        onClick={onViewAllItems}
        className={cn(
          "w-full rounded-xl border border-dashed border-primary/30 bg-primary/4 p-4 mb-6",
          "text-left hover:bg-primary/8 transition-colors",
          "flex items-center gap-3"
        )}
      >
        <Package className="h-5 w-5 text-primary/60" />
        <div>
          <span className="text-sm font-medium text-primary/80">
            View all {vendorData?.totalItems || 0} products
          </span>
          <p className="text-xs text-muted-foreground/50 mt-0.5">
            Browse all items from {vendorName}
          </p>
        </div>
      </button>

      {/* Collections grid */}
      {collections.length > 0 ? (
        <>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3 px-0.5">
            Collections
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <button
                key={collection.id}
                type="button"
                onClick={() => onSelectCollection(collection.id)}
                className={cn(
                  "group rounded-xl border bg-card p-4 text-left",
                  "hover:shadow-md hover:border-primary/20 transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-muted-foreground/40" />
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {collection.name}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground/50 tabular-nums">
                  {collection.itemCount} item{collection.itemCount !== 1 ? "s" : ""}
                </p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-sm text-muted-foreground/50">
          {searchQuery
            ? `No collections match "${searchQuery}"`
            : "No collections found for this brand."}
        </div>
      )}
    </div>
  );
};
