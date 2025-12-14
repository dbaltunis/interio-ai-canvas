import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Quick filter chips for common fabric/material types
const QUICK_FILTERS = [
  { key: 'blockout', label: 'Blockout', color: 'bg-slate-800 text-white' },
  { key: 'sheer', label: 'Sheer', color: 'bg-blue-100 text-blue-800' },
  { key: 'sunscreen', label: 'Sunscreen', color: 'bg-amber-100 text-amber-800' },
  { key: 'light_filtering', label: 'Light Filter', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'wide_width', label: 'Wide (300cm+)', color: 'bg-green-100 text-green-800' },
];

interface QuickTypeFilterProps {
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  availableTypes?: string[];
  className?: string;
}

export const QuickTypeFilter = ({
  selectedTypes,
  onTypeToggle,
  availableTypes,
  className
}: QuickTypeFilterProps) => {
  // Filter to only show types that exist in the data
  const visibleFilters = availableTypes 
    ? QUICK_FILTERS.filter(f => availableTypes.includes(f.key))
    : QUICK_FILTERS;

  if (visibleFilters.length === 0) return null;

  return (
    <ScrollArea className={cn("w-full", className)}>
      <div className="flex gap-1.5 pb-2">
        {visibleFilters.map(filter => {
          const isSelected = selectedTypes.includes(filter.key);
          return (
            <Button
              key={filter.key}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-6 text-[10px] px-2 whitespace-nowrap",
                isSelected && filter.color
              )}
              onClick={() => onTypeToggle(filter.key)}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
