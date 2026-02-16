import { useState, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Building2,
  Package,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Palette,
  X,
} from "lucide-react";
import { useVendorsWithCollections, useUpdateCollection } from "@/hooks/useCollections";
import { useUpdateVendor } from "@/hooks/useVendors";
import { FINDER_COLORS, getFinderColor } from "@/constants/finderColors";
import { toast } from "sonner";

interface LibrarySidebarProps {
  selectedBrand: string | null;
  onSelectBrand: (brandId: string | null) => void;
  selectedCollection?: string;
  onSelectCollection?: (collectionId: string) => void;
  selectedColorTag?: string | null;
  onSelectColorTag?: (colorKey: string | null) => void;
}

export const LibrarySidebar = ({
  selectedBrand,
  onSelectBrand,
  selectedCollection,
  onSelectCollection,
  selectedColorTag,
  onSelectColorTag,
}: LibrarySidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("library.sidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });

  const { data: vendorsWithCollections = [], isLoading } = useVendorsWithCollections();
  const updateCollection = useUpdateCollection();
  const updateVendor = useUpdateVendor();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);

  // Inline rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingType, setRenamingType] = useState<"vendor" | "collection" | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

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

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem("library.sidebarCollapsed", String(next)); } catch {}
      return next;
    });
  };

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

  const totalCollections = useMemo(() => {
    return vendorsWithCollections.reduce((sum, v) => sum + v.collections.length, 0);
  }, [vendorsWithCollections]);

  const toggleExpanded = (brandId: string) => {
    setExpandedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brandId)) next.delete(brandId);
      else next.add(brandId);
      return next;
    });
  };

  // Collect all active color tags for the Tags section
  const activeColorTags = useMemo(() => {
    const tags = new Set<string>();
    vendorsWithCollections.forEach(v => {
      if ((v.vendor as any)?.color_tag) tags.add((v.vendor as any).color_tag);
      v.collections.forEach(c => {
        if ((c as any)?.color_tag) tags.add((c as any).color_tag);
      });
    });
    return Array.from(tags).sort();
  }, [vendorsWithCollections]);

  const handleRenameSubmit = async () => {
    if (!renamingId || !renamingType || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }

    try {
      if (renamingType === "vendor") {
        await updateVendor.mutateAsync({ id: renamingId, name: renameValue.trim() });
      } else {
        await updateCollection.mutateAsync({ id: renamingId, name: renameValue.trim() });
      }
      toast.success("Renamed successfully");
    } catch {
      toast.error("Failed to rename");
    }
    setRenamingId(null);
  };

  const handleColorTagChange = async (id: string, type: "vendor" | "collection", colorKey: string | null) => {
    try {
      if (type === "vendor") {
        await updateVendor.mutateAsync({ id, color_tag: colorKey } as any);
      } else {
        await updateCollection.mutateAsync({ id, color_tag: colorKey } as any);
      }
      toast.success("Color tag updated");
    } catch {
      toast.error("Failed to update color tag");
    }
  };

  const startRename = (id: string, type: "vendor" | "collection", currentName: string) => {
    setRenamingId(id);
    setRenamingType(type);
    setRenameValue(currentName);
  };

  // Color dot component
  const ColorDot = ({ colorKey }: { colorKey?: string | null }) => {
    const color = getFinderColor(colorKey);
    if (!color) return null;
    return (
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color.hex }}
      />
    );
  };

  // Context menu for rename + color tag
  const ItemContextMenu = ({ id, type, name, colorTag }: { id: string; type: "vendor" | "collection"; name: string; colorTag?: string | null }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => startRename(id, type, name)}>
          <Pencil className="h-3.5 w-3.5 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="h-3.5 w-3.5 mr-2" />
            Color Tag
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-0">
            <div className="flex items-center gap-1.5 p-2">
              {FINDER_COLORS.map(c => (
                <button
                  key={c.key}
                  type="button"
                  className={cn(
                    "w-5 h-5 rounded-full transition-all hover:scale-125",
                    colorTag === c.key && "ring-2 ring-offset-2 ring-foreground/30"
                  )}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                  onClick={() => handleColorTagChange(id, type, c.key)}
                />
              ))}
            </div>
            {colorTag && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleColorTagChange(id, type, null)}>
                  <X className="h-3.5 w-3.5 mr-2" />
                  None
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
    <div className="w-[280px] min-w-[280px] max-w-[280px] border-r bg-background flex flex-col h-full flex-shrink-0 transition-all duration-300 overflow-hidden">
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col px-3 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Library
            </h2>
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
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>

          {/* All Items */}
          <Button
            variant={selectedBrand === null && !selectedColorTag ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-between h-9 px-3 text-sm font-medium gap-2 mb-1",
              selectedBrand === null && !selectedColorTag && "bg-primary/10 text-primary"
            )}
            onClick={() => {
              onSelectBrand(null);
              onSelectColorTag?.(null);
            }}
          >
            <span className="flex items-center gap-2 min-w-0 flex-1">
              <FolderOpen className="h-4 w-4 shrink-0" />
              <span className="truncate">All Items</span>
            </span>
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
              {totalCollections}
            </span>
          </Button>

          {/* Brands section header */}
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mt-3 mb-1.5 px-0.5">
            Brands
          </div>

          {/* Brand list */}
          <div className="space-y-0.5">
            {filteredBrands.map((brandData) => {
              const brandId = brandData.vendor?.id || "unassigned";
              const brandName = brandData.vendor?.name || "Unassigned";
              const isExpanded = expandedBrands.has(brandId);
              const isSelected = selectedBrand === brandId;
              const collectionCount = brandData.collections.length;
              const vendorColorTag = (brandData.vendor as any)?.color_tag;

              return (
                <Collapsible
                  key={brandId}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(brandId)}
                >
                  <div className="flex items-center group">
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
                    
                    {renamingId === brandId ? (
                      <Input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameSubmit();
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        className="h-8 text-sm flex-1"
                      />
                    ) : (
                      <Button
                        variant={isSelected ? "secondary" : "ghost"}
                        className={cn(
                          "flex-1 justify-between h-9 px-2 text-sm font-medium gap-2 min-w-0",
                          isSelected && "bg-primary/10 text-primary"
                        )}
                        onClick={() => onSelectBrand(brandId)}
                      >
                        <span className="flex items-center gap-2 min-w-0 flex-1">
                          <ColorDot colorKey={vendorColorTag} />
                          {!vendorColorTag && <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                          <span className="truncate">{brandName}</span>
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                          {collectionCount}
                        </span>
                      </Button>
                    )}

                    {brandId !== "unassigned" && !renamingId && (
                      <ItemContextMenu
                        id={brandId}
                        type="vendor"
                        name={brandName}
                        colorTag={vendorColorTag}
                      />
                    )}
                  </div>

                  <CollapsibleContent>
                    <div className="ml-7 pl-2 border-l border-border/50 space-y-0.5 py-1">
                      {brandData.collections.map((collection) => {
                        const collectionColorTag = (collection as any)?.color_tag;
                        
                        return (
                          <div key={collection.id} className="flex items-center group">
                            {renamingId === collection.id ? (
                              <Input
                                ref={renameInputRef}
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={handleRenameSubmit}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleRenameSubmit();
                                  if (e.key === "Escape") setRenamingId(null);
                                }}
                                className="h-7 text-xs flex-1"
                              />
                            ) : (
                              <Button
                                variant={selectedCollection === collection.id ? "secondary" : "ghost"}
                                className={cn(
                                  "flex-1 justify-between h-8 px-2 text-xs gap-2",
                                  selectedCollection === collection.id && "bg-primary/10 text-primary"
                                )}
                                onClick={() => {
                                  onSelectBrand(brandId);
                                  onSelectCollection?.(collection.id);
                                }}
                              >
                                <span className="flex items-center gap-2 min-w-0 flex-1">
                                  <ColorDot colorKey={collectionColorTag} />
                                  {!collectionColorTag && <Package className="h-3 w-3 shrink-0 text-muted-foreground" />}
                                  <span className="truncate">{collection.name}</span>
                                </span>
                                <span className="text-muted-foreground text-xs shrink-0 tabular-nums">
                                  {collection.itemCount || 0}
                                </span>
                              </Button>
                            )}
                            
                            {!renamingId && (
                              <ItemContextMenu
                                id={collection.id}
                                type="collection"
                                name={collection.name}
                                colorTag={collectionColorTag}
                              />
                            )}
                          </div>
                        );
                      })}
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
              </div>
            )}
          </div>

          {/* Tags section */}
          {activeColorTags.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 px-0.5">
                Tags
              </div>
              <div className="space-y-0.5">
                {activeColorTags.map(tagKey => {
                  const color = getFinderColor(tagKey);
                  if (!color) return null;
                  const isActive = selectedColorTag === tagKey;
                  return (
                    <button
                      key={tagKey}
                      type="button"
                      className={cn(
                        "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md hover:bg-accent/40 transition-colors text-left text-sm",
                        isActive && "bg-primary/10 text-primary"
                      )}
                      onClick={() => onSelectColorTag?.(isActive ? null : tagKey)}
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
