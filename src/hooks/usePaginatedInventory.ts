import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const PAGE_SIZE = 50;

interface PaginatedInventoryParams {
  category?: string;
  subcategories?: string[];
  searchTerm?: string;
  vendorId?: string;
  collectionId?: string;
  tags?: string[];
}

interface PaginatedResult {
  items: any[];
  nextPage: number | undefined;
  totalCount?: number;
}

/**
 * Paginated inventory hook with server-side filtering.
 * Fetches 50 items at a time for optimal performance with large inventories.
 */
export function usePaginatedInventory({
  category,
  subcategories,
  searchTerm,
  vendorId,
  collectionId,
  tags,
}: PaginatedInventoryParams = {}) {
  // Get current user
  const { data: userData } = useQuery({
    queryKey: ['current-user-paginated'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Check for parent_account_id
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('parent_account_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      return {
        userId: user.id,
        accountOwnerId: profile?.parent_account_id || user.id,
      };
    },
    staleTime: 60000,
  });

  const accountOwnerId = userData?.accountOwnerId;

  return useInfiniteQuery<PaginatedResult>({
    queryKey: ['paginated-inventory', accountOwnerId, category, subcategories, searchTerm, vendorId, collectionId, tags],
    queryFn: async ({ pageParam = 0 }) => {
      if (!accountOwnerId) {
        return { items: [], nextPage: undefined };
      }

      // Build the base query
      let query = supabase
        .from('enhanced_inventory_items')
        .select(`
          *,
          vendor:vendors(id, name),
          collection:collections(id, name)
        `, { count: 'exact' })
        .eq('user_id', accountOwnerId)
        .eq('active', true)
        .order('name', { ascending: true })
        .range((pageParam as number) * PAGE_SIZE, ((pageParam as number) + 1) * PAGE_SIZE - 1);

      // Category filter
      if (category) {
        query = query.eq('category', category);
      }

      // Subcategory filter (for treatment-specific filtering)
      if (subcategories && subcategories.length > 0) {
        query = query.in('subcategory', subcategories);
      }

      // Server-side search (much faster than client-side for large datasets)
      if (searchTerm && searchTerm.length >= 2) {
        const searchLower = searchTerm.toLowerCase();
        query = query.or(`name.ilike.%${searchLower}%,sku.ilike.%${searchLower}%,supplier.ilike.%${searchLower}%,description.ilike.%${searchLower}%`);
      }

      // Vendor filter
      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      // Collection filter
      if (collectionId) {
        query = query.eq('collection_id', collectionId);
      }

      // Tags filter (contains any of selected tags)
      if (tags && tags.length > 0) {
        query = query.overlaps('tags', tags);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Paginated inventory query error:', error);
        throw error;
      }

      // Sort results: items starting with search term first
      let sortedData = data || [];
      if (searchTerm && searchTerm.length >= 2) {
        const searchLower = searchTerm.toLowerCase();
        sortedData = sortedData.sort((a, b) => {
          const aName = a.name?.toLowerCase() || '';
          const bName = b.name?.toLowerCase() || '';
          const aStartsWith = aName.startsWith(searchLower) ? 0 : 1;
          const bStartsWith = bName.startsWith(searchLower) ? 0 : 1;
          if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith;
          return aName.localeCompare(bName);
        });
      }

      return {
        items: sortedData,
        nextPage: sortedData.length === PAGE_SIZE ? (pageParam as number) + 1 : undefined,
        totalCount: count || undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!accountOwnerId,
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Flattens paginated results into a single array.
 */
export function flattenPaginatedResults(data: { pages: PaginatedResult[] } | undefined): any[] {
  if (!data?.pages) return [];
  return data.pages.flatMap(page => page.items);
}
