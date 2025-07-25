import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarSource, useCalendarColors } from "@/hooks/useCalendarColors";
import { Palette, Eye, EyeOff } from "lucide-react";

interface CalendarColorPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CalendarColorPicker = ({ open, onOpenChange }: CalendarColorPickerProps) => {
  const { 
    calendarSources, 
    updateCalendarSource, 
    toggleSourceVisibility, 
    defaultColors 
  } = useCalendarColors();

  const [selectedColor, setSelectedColor] = useState<string>("");

  const handleColorChange = (sourceId: string, color: string) => {
    updateCalendarSource(sourceId, { color });
  };

  const ColorDot = ({ color, isSelected, onClick }: { 
    color: string; 
    isSelected: boolean; 
    onClick: () => void; 
  }) => (
    <button
      className={`w-8 h-8 rounded-full border-2 ${
        isSelected ? 'border-primary scale-110' : 'border-border'
      } transition-all hover:scale-105`}
      style={{ backgroundColor: color }}
      onClick={onClick}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Calendar Colors & Visibility
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {calendarSources.map((source) => (
            <div key={source.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: source.color }}
                  />
                  <Label className="font-medium">{source.name}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={source.visible}
                    onCheckedChange={() => toggleSourceVisibility(source.id)}
                  />
                  {source.visible ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {defaultColors.map((color) => (
                  <ColorDot
                    key={color}
                    color={color}
                    isSelected={source.color === color}
                    onClick={() => handleColorChange(source.id, color)}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor={`custom-${source.id}`} className="text-sm">
                  Custom:
                </Label>
                <Input
                  id={`custom-${source.id}`}
                  type="color"
                  value={source.color}
                  onChange={(e) => handleColorChange(source.id, e.target.value)}
                  className="w-16 h-8 p-1 border rounded"
                />
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};