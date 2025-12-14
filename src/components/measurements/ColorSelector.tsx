import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ColorSelectorProps {
  colors: string[];
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  readOnly?: boolean;
}

export const ColorSelector = ({ colors, selectedColor, onColorSelect, readOnly = false }: ColorSelectorProps) => {
  if (!colors || colors.length === 0) return null;

  // Generate a color swatch for display
  const getColorStyle = (color: string) => {
    const lowerColor = color.toLowerCase();
    // Check if it's a hex color
    if (color.startsWith('#')) {
      return { backgroundColor: color };
    }
    // Try to use the color name directly (works for CSS color names)
    return { backgroundColor: lowerColor };
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-card-foreground">Color</Label>
      <Select value={selectedColor || ''} onValueChange={onColorSelect} disabled={readOnly}>
        <SelectTrigger className="w-full bg-background border-input">
          <SelectValue placeholder="Select color...">
            {selectedColor && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-border shrink-0" 
                  style={getColorStyle(selectedColor)}
                />
                <span className="capitalize truncate">{selectedColor}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-[9999] bg-popover border-border shadow-lg max-h-[300px]">
          {colors.map((color) => (
            <SelectItem key={color} value={color} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-border shrink-0" 
                  style={getColorStyle(color)}
                />
                <span className="capitalize">{color}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
