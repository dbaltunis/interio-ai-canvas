import { useRef, useEffect, useCallback, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Package, Loader2 } from 'lucide-react';

interface VirtualizedInventoryGridProps {
  items: any[];
  renderItem: (item: any, category: string) => React.ReactNode;
  category: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  emptyMessage?: string;
  searchTerm?: string;
  isLoading?: boolean;
}

// Estimate item dimensions for the virtualizer
const ITEM_HEIGHT = 280; // Approximate height of each card
const COLUMNS = 4; // lg:grid-cols-4

/**
 * Virtualized grid component for large inventory lists.
 * Only renders visible items for optimal performance.
 */
export const VirtualizedInventoryGrid = memo(function VirtualizedInventoryGrid({
  items,
  renderItem,
  category,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  emptyMessage,
  searchTerm,
  isLoading,
}: VirtualizedInventoryGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Calculate rows needed (items / columns)
  const rowCount = Math.ceil(items.length / COLUMNS);

  const rowVirtualizer = useVirtualizer({
    count: rowCount + (hasNextPage ? 1 : 0), // +1 for load more trigger
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 2, // Render 2 extra rows above/below viewport
  });

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && fetchNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading inventory...</span>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">{emptyMessage || 'No items found'}</p>
        {searchTerm && <p className="text-xs mt-1">Try different search terms</p>}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto pr-2"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= rowCount;
          
          if (isLoaderRow) {
            return (
              <div
                key="loader"
                ref={loadMoreRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex items-center justify-center py-4"
              >
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                ) : hasNextPage ? (
                  <span className="text-sm text-muted-foreground">Scroll to load more</span>
                ) : null}
              </div>
            );
          }

          // Get items for this row
          const startIndex = virtualRow.index * COLUMNS;
          const rowItems = items.slice(startIndex, startIndex + COLUMNS);

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 h-full">
                {rowItems.map((item) => (
                  <div key={item.id} className="h-fit">
                    {renderItem(item, category)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Item count indicator */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm py-1 text-center">
        <span className="text-xs text-muted-foreground">
          Showing {items.length} items {hasNextPage && '(scroll for more)'}
        </span>
      </div>
    </div>
  );
});
