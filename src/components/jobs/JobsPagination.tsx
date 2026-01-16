import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobsPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

// Smart pagination: shows first, last, current ±1, with ellipsis for gaps
const getPageNumbers = (currentPage: number, totalPages: number): (number | 'ellipsis')[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  
  // Always show first page
  pages.push(1);
  
  // Ellipsis after first if current is far from start
  if (currentPage > 3) {
    pages.push('ellipsis');
  }
  
  // Pages around current (current - 1, current, current + 1)
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  // Ellipsis before last if current is far from end
  if (currentPage < totalPages - 2) {
    pages.push('ellipsis');
  }
  
  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  return pages;
};

export const JobsPagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [20, 50, 100]
}: JobsPaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Show items per page selector even if only 1 page
  if (totalPages <= 1 && !onItemsPerPageChange) return null;

  // Ensure currentPage is valid
  const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const pageNumbers = getPageNumbers(safePage, totalPages);

  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    if (validPage !== currentPage) {
      onPageChange(validPage);
    }
  };

  const startItem = totalItems === 0 ? 0 : ((safePage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(safePage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 py-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
        <span className="whitespace-nowrap">Showing {startItem} to {endItem} of {totalItems} items</span>
        
        {/* Items per page selector */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs whitespace-nowrap">Show:</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(value) => onItemsPerPageChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent className="flex-wrap justify-center">
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(safePage - 1)}
                className={safePage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {pageNumbers.map((page, index) => (
              <PaginationItem key={`${page}-${index}`}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis className="hidden sm:flex" />
                ) : (
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={safePage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(safePage + 1)}
                className={safePage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
