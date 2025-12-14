import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTagsForSubcategory, TagCategory, QUICK_FILTER_GROUPS } from "@/constants/inventoryTags";

interface TagFilterChipsProps {
  subcategory?: string;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
  showQuickFilters?: boolean;
  className?: string;
  compact?: boolean;
}

export const TagFilterChips = ({
  subcategory,
  selectedTags,
  onTagToggle,
  onClearAll,
  showQuickFilters = true,
  className,
  compact = false
}: TagFilterChipsProps) => {
  const availableTags = subcategory ? getTagsForSubcategory(subcategory) : [];
  
  // Determine which quick filter groups are relevant for this subcategory
  const relevantGroups = Object.entries(QUICK_FILTER_GROUPS).filter(([_, group]) => 
    group.tags.some(tag => availableTags.some(t => t.key === tag))
  );

  if (availableTags.length === 0 && !showQuickFilters) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Active filters indicator */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Active:
          </span>
          {selectedTags.map(tag => {
            const tagInfo = availableTags.find(t => t.key === tag);
            return (
              <Badge
                key={tag}
                variant="default"
                className={cn(
                  "cursor-pointer text-xs px-2 py-0.5 gap-1",
                  compact && "text-[10px] px-1.5"
                )}
                onClick={() => onTagToggle(tag)}
              >
                {tagInfo?.label || tag}
                <X className="h-3 w-3" />
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
            onClick={onClearAll}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Quick filter groups */}
      {showQuickFilters && relevantGroups.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {relevantGroups.map(([groupKey, group]) => (
            <div key={groupKey} className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{group.label}:</span>
              <div className="flex gap-1">
                {group.tags
                  .filter(tagKey => availableTags.some(t => t.key === tagKey))
                  .map(tagKey => {
                    const tagInfo = availableTags.find(t => t.key === tagKey);
                    const isSelected = selectedTags.includes(tagKey);
                    
                    return (
                      <Badge
                        key={tagKey}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all text-xs px-2 py-0.5",
                          isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-accent",
                          compact && "text-[10px] px-1.5"
                        )}
                        onClick={() => onTagToggle(tagKey)}
                      >
                        {tagInfo?.label || tagKey}
                      </Badge>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All available tags (if not showing quick filters) */}
      {!showQuickFilters && availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableTags.map(tag => {
            const isSelected = selectedTags.includes(tag.key);
            return (
              <Badge
                key={tag.key}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all",
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : cn("hover:bg-accent", tag.color),
                  compact ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"
                )}
                onClick={() => onTagToggle(tag.key)}
              >
                {tag.label}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
