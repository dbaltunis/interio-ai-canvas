import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_PALETTE } from "@/constants/inventoryCategories";

interface ColorSelectorProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
  customColors?: Array<{ name: string; value: string; hex: string }>;
  onCustomColorsChange?: (colors: Array<{ name: string; value: string; hex: string }>) => void;
}

export const ColorSelector = ({ 
  selectedColors, 
  onChange, 
  maxColors,
  customColors = [],
  onCustomColorsChange 
}: ColorSelectorProps) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#000000");

  const allColors = [...COLOR_PALETTE, ...customColors];

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

  const addCustomColor = () => {
    if (!customColorName.trim() || !onCustomColorsChange) return;
    
    const colorValue = customColorName.toLowerCase().replace(/\s+/g, '_');
    const newColor = {
      name: customColorName.trim(),
      value: colorValue,
      hex: customColorHex
    };
    
    onCustomColorsChange([...customColors, newColor]);
    setCustomColorName("");
    setCustomColorHex("#000000");
    setShowCustomInput(false);
  };

  const removeCustomColor = (colorValue: string) => {
    if (!onCustomColorsChange) return;
    onCustomColorsChange(customColors.filter(c => c.value !== colorValue));
    // Also remove from selected if it was selected
    if (selectedColors.includes(colorValue)) {
      onChange(selectedColors.filter(c => c !== colorValue));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Available Colors</span>
        {onCustomColorsChange && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="text-xs h-7"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Custom
          </Button>
        )}
      </div>

      {showCustomInput && (
        <div className="flex gap-2 p-3 bg-muted/50 rounded-md border">
          <Input
            type="text"
            placeholder="Color name"
            value={customColorName}
            onChange={(e) => setCustomColorName(e.target.value)}
            className="h-8 text-xs"
          />
          <input
            type="color"
            value={customColorHex}
            onChange={(e) => setCustomColorHex(e.target.value)}
            className="w-12 h-8 rounded border cursor-pointer"
          />
          <Button
            type="button"
            size="sm"
            onClick={addCustomColor}
            disabled={!customColorName.trim()}
            className="h-8 px-3"
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomInput(false)}
            className="h-8 px-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {allColors.map((color) => {
          const isSelected = selectedColors.includes(color.value);
          const isCustom = customColors.some(c => c.value === color.value);
          
          return (
            <div key={color.value} className="relative group">
              <Button
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
              {isCustom && onCustomColorsChange && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCustomColor(color.value);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      {selectedColors.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <span className="text-xs text-muted-foreground">Selected:</span>
          <div className="flex flex-wrap gap-1">
            {selectedColors.map((colorValue) => {
              const color = allColors.find(c => c.value === colorValue);
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
      
      <p className="text-xs text-muted-foreground">
        Select all colors available for this product. Colors appear as a dropdown in quote calculator.
      </p>
    </div>
  );
};
