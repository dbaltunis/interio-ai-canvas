import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "./useEffectiveAccountOwner";
import { useVendors } from "./useVendors";
import { useCollectionsWithCounts } from "./useCollections";

export interface CollectionNode {
  id: string;
  name: string;
  itemCount: number;
}

export interface BrandNode {
  vendorId: string;
  vendorName: string;
  totalCount: number;
  collections: CollectionNode[];
}

export interface CategoryNode {
  key: string;
  label: string;
  totalCount: number;
  brands: BrandNode[];
}

export interface CategoryVendorTree {
  categories: CategoryNode[];
  totalItems: number;
  isLoading: boolean;
}

const CATEGORY_CONFIG: Record<string, { label: string; order: number }> = {
  fabric: { label: "Fabrics", order: 0 },
  hardware: { label: "Hardware", order: 1 },
  material: { label: "Materials", order: 2 },
  wallcovering: { label: "Wallcoverings", order: 3 },
  service: { label: "Services", order: 4 },
};

export const useCategoryVendorTree = (): CategoryVendorTree => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  const { data: vendors = [] } = useVendors();
  const { data: collections = [] } = useCollectionsWithCounts();

  const { data: itemCounts, isLoading } = useQuery({
    queryKey: ["category-vendor-tree", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("category, vendor_id, collection_id")
        .eq("user_id", effectiveOwnerId)
        .eq("active", true)
        .neq("category", "treatment_option");

      if (error) throw error;
      return data || [];
    },
    enabled: !!effectiveOwnerId,
  });

  // Build vendor lookup
  const vendorMap = new Map<string, string>();
  vendors.forEach((v: any) => {
    vendorMap.set(v.id, v.name || "Unknown");
  });

  // Build collection lookup
  const collectionMap = new Map<string, { name: string; vendorId: string | null }>();
  collections.forEach((c: any) => {
    collectionMap.set(c.id, { name: c.name, vendorId: c.vendor_id });
  });

  // Build tree from item counts
  // Structure: category -> vendorId -> collectionId -> count
  const tree = new Map<string, Map<string, Map<string, number>>>();
  let totalItems = 0;

  (itemCounts || []).forEach((item) => {
    const cat = item.category || "other";
    const vendorId = item.vendor_id || "unassigned";
    const collectionId = item.collection_id || "uncategorized";

    if (!tree.has(cat)) tree.set(cat, new Map());
    const catMap = tree.get(cat)!;

    if (!catMap.has(vendorId)) catMap.set(vendorId, new Map());
    const vendorMap2 = catMap.get(vendorId)!;

    vendorMap2.set(collectionId, (vendorMap2.get(collectionId) || 0) + 1);
    totalItems++;
  });

  // Convert tree to CategoryNode[]
  const categories: CategoryNode[] = [];

  tree.forEach((vendorsMap, catKey) => {
    const config = CATEGORY_CONFIG[catKey];
    if (!config) return; // skip unknown categories

    const brands: BrandNode[] = [];

    vendorsMap.forEach((collectionsMap, vendorId) => {
      const colls: CollectionNode[] = [];
      let brandTotal = 0;

      collectionsMap.forEach((count, collId) => {
        brandTotal += count;
        if (collId !== "uncategorized") {
          const collInfo = collectionMap.get(collId);
          colls.push({
            id: collId,
            name: collInfo?.name || collId,
            itemCount: count,
          });
        }
      });

      colls.sort((a, b) => a.name.localeCompare(b.name));

      brands.push({
        vendorId,
        vendorName: vendorId === "unassigned" ? "Unassigned" : (vendorMap.get(vendorId) || "Unknown"),
        totalCount: brandTotal,
        collections: colls,
      });
    });

    // Sort brands: alphabetically, unassigned last
    brands.sort((a, b) => {
      if (a.vendorId === "unassigned") return 1;
      if (b.vendorId === "unassigned") return -1;
      return a.vendorName.localeCompare(b.vendorName);
    });

    categories.push({
      key: catKey,
      label: config.label,
      totalCount: brands.reduce((sum, b) => sum + b.totalCount, 0),
      brands,
    });
  });

  // Sort categories by configured order
  categories.sort((a, b) => {
    const orderA = CATEGORY_CONFIG[a.key]?.order ?? 99;
    const orderB = CATEGORY_CONFIG[b.key]?.order ?? 99;
    return orderA - orderB;
  });

  return { categories, totalItems, isLoading };
};
