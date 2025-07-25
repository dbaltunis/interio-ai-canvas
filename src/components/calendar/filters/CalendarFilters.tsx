import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarSource, useCalendarColors } from "@/hooks/useCalendarColors";
import { Filter, Settings2 } from "lucide-react";

interface CalendarFiltersProps {
  onFiltersChange?: (visibleSources: string[]) => void;
}

export const CalendarFilters = ({ onFiltersChange }: CalendarFiltersProps) => {
  const { calendarSources, toggleSourceVisibility } = useCalendarColors();
  const [isOpen, setIsOpen] = useState(false);

  const visibleSources = calendarSources.filter(source => source.visible);
  const hiddenCount = calendarSources.length - visibleSources.length;

  const handleToggle = (sourceId: string) => {
    toggleSourceVisibility(sourceId);
    
    // Notify parent of filter changes
    const updatedSources = calendarSources.map(source =>
      source.id === sourceId ? { ...source, visible: !source.visible } : source
    );
    const visibleIds = updatedSources.filter(s => s.visible).map(s => s.id);
    onFiltersChange?.(visibleIds);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {hiddenCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {hiddenCount} hidden
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <h4 className="font-medium">Calendar Sources</h4>
          </div>

          <div className="space-y-3">
            {calendarSources.map((source) => (
              <div key={source.id} className="flex items-center space-x-3">
                <Checkbox
                  id={source.id}
                  checked={source.visible}
                  onCheckedChange={() => handleToggle(source.id)}
                />
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: source.color }}
                  />
                  <label
                    htmlFor={source.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {source.name}
                  </label>
                </div>
              </div>
            ))}
          </div>

          {calendarSources.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No calendar sources available
            </p>
          )}

          <div className="pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Show all calendars
                calendarSources.forEach(source => {
                  if (!source.visible) {
                    toggleSourceVisibility(source.id);
                  }
                });
                onFiltersChange?.(calendarSources.map(s => s.id));
              }}
              className="w-full"
            >
              Show All
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};