import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ChevronRight, 
  Star, 
  Clock, 
  Building2,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface BrandGroup {
  vendorId: string | null;
  vendorName: string;
  itemCount: number;
}

interface WorksheetBrandSidebarProps {
  brands: BrandGroup[];
  selectedBrand: string | null;
  onSelectBrand: (vendorId: string | null) => void;
  totalItems: number;
  recentCount?: number;
  favoritesCount?: number;
  onShowRecent?: () => void;
  onShowFavorites?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  className?: string;
}

export const WorksheetBrandSidebar = ({
  brands,
  selectedBrand,
  onSelectBrand,
  totalItems,
  recentCount = 0,
  favoritesCount = 0,
  onShowRecent,
  onShowFavorites,
  isCollapsed = false,
  onToggleCollapse,
  isMobile = false,
  className
}: WorksheetBrandSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredBrands = useMemo(() => {
    if (!searchTerm) return brands;
    const lower = searchTerm.toLowerCase();
    return brands.filter(b => b.vendorName.toLowerCase().includes(lower));
  }, [brands, searchTerm]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Special sections */}
          {(recentCount > 0 || favoritesCount > 0) && (
            <div className="pb-2 mb-2 border-b border-border/50">
              {recentCount > 0 && onShowRecent && (
                <button
                  onClick={onShowRecent}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted transition-colors"
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="flex-1 text-left">Recent</span>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {recentCount}
                  </Badge>
                </button>
              )}
              {favoritesCount > 0 && onShowFavorites && (
                <button
                  onClick={onShowFavorites}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted transition-colors"
                >
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  <span className="flex-1 text-left">Favorites</span>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {favoritesCount}
                  </Badge>
                </button>
              )}
            </div>
          )}

          {/* All Items */}
          <button
            onClick={() => {
              onSelectBrand(null);
              if (isMobile) setIsOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
              selectedBrand === null 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            )}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span className="flex-1 text-left font-medium">All Brands</span>
            <Badge 
              variant={selectedBrand === null ? "secondary" : "outline"} 
              className="text-[10px] h-4 px-1.5"
            >
              {totalItems}
            </Badge>
          </button>

          {/* Brand list */}
          {filteredBrands.map((brand) => (
            <button
              key={brand.vendorId || 'unassigned'}
              onClick={() => {
                onSelectBrand(brand.vendorId);
                if (isMobile) setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
                selectedBrand === brand.vendorId 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="flex-1 text-left truncate">{brand.vendorName}</span>
              <Badge 
                variant={selectedBrand === brand.vendorId ? "secondary" : "outline"} 
                className="text-[10px] h-4 px-1.5"
              >
                {brand.itemCount}
              </Badge>
            </button>
          ))}

          {filteredBrands.length === 0 && searchTerm && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No brands match "{searchTerm}"
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Mobile: Show as sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span className="text-xs">Brands</span>
            {selectedBrand && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                1
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="text-sm">Filter by Brand</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Collapsible sidebar
  if (isCollapsed) {
    return (
      <div className={cn("w-10 border-r flex flex-col items-center py-2 gap-1", className)}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleCollapse}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        {recentCount > 0 && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShowRecent}>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        {favoritesCount > 0 && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShowFavorites}>
            <Star className="h-4 w-4 text-amber-500" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-48 border-r flex flex-col", className)}>
      <div className="p-2 border-b flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Brands</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onToggleCollapse}
        >
          <PanelLeftClose className="h-3.5 w-3.5" />
        </Button>
      </div>
      <SidebarContent />
    </div>
  );
};
