import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_PALETTE } from "@/constants/inventoryCategories";

interface ColorSelectorProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
}

export const ColorSelector = ({ selectedColors, onChange, maxColors }: ColorSelectorProps) => {
  const toggleColor = (colorValue: string) => {
    if (selectedColors.includes(colorValue)) {
      // Remove color
      onChange(selectedColors.filter(c => c !== colorValue));
    } else {
      // Add color (check max limit)
      if (maxColors && selectedColors.length >= maxColors) {
        return;
      }
      onChange([...selectedColors, colorValue]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {COLOR_PALETTE.map((color) => {
          const isSelected = selectedColors.includes(color.value);
          return (
            <Button
              key={color.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toggleColor(color.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 h-auto transition-all",
                isSelected && "border-primary bg-primary/5 font-medium"
              )}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-border/50 flex-shrink-0"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-xs">{color.name}</span>
              {isSelected && <Check className="w-3 h-3 ml-1 text-primary" />}
            </Button>
          );
        })}
      </div>
      
      {selectedColors.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <span className="text-xs text-muted-foreground">Selected:</span>
          <div className="flex flex-wrap gap-1">
            {selectedColors.map((colorValue) => {
              const color = COLOR_PALETTE.find(c => c.value === colorValue);
              if (!color) return null;
              return (
                <Badge key={colorValue} variant="secondary" className="text-xs px-2 py-0.5">
                  <div
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                </Badge>
              );
            })}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange([])}
            className="ml-auto text-xs h-6"
          >
            Clear
          </Button>
        </div>
      )}
      
      {maxColors && (
        <p className="text-xs text-muted-foreground">
          {selectedColors.length} of {maxColors} colors selected
        </p>
      )}
    </div>
  );
};
