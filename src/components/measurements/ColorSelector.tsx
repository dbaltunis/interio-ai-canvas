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

  return (
    <div className="space-y-2">
      <Label>Color</Label>
      <Select value={selectedColor} onValueChange={onColorSelect} disabled={readOnly}>
        <SelectTrigger>
          <SelectValue placeholder="Select color" />
        </SelectTrigger>
        <SelectContent>
          {colors.map((color) => (
            <SelectItem key={color} value={color}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-border" 
                  style={{ 
                    backgroundColor: color.startsWith('#') ? color : undefined,
                    background: !color.startsWith('#') ? color.toLowerCase() : undefined
                  }}
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
