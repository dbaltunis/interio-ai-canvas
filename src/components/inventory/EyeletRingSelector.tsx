import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEyeletRings } from "@/hooks/useEyeletRings";
import { useProductVariants } from "@/hooks/useProductVariants";

export interface EyeletRing {
  id: string;
  name: string;
  color: string;
  diameter: number;
  material: string;
  finish: string;
  image_url?: string;
}

interface EyeletRingSelectorProps {
  selectedRings: EyeletRing[];
  onRingsChange?: (rings: EyeletRing[]) => void;
  onChange?: (rings: EyeletRing[]) => void;
  readOnly?: boolean;
  showLabel?: boolean;
}

export const EyeletRingSelector = ({ selectedRings, onRingsChange, onChange, readOnly = false, showLabel = true }: EyeletRingSelectorProps) => {
  const { data: predefinedRings = [] } = useEyeletRings();
  const { data: colors = [] } = useProductVariants('color');
  const { data: materials = [] } = useProductVariants('material');
  const { data: finishes = [] } = useProductVariants('finish');
  
  const [open, setOpen] = useState(false);
  const [newRing, setNewRing] = useState<Partial<EyeletRing>>({
    name: "",
    color: colors[0]?.value || "silver",
    diameter: 25,
    material: materials[0]?.value || "metal",
    finish: finishes[0]?.value || "brushed"
  });

  const handleChange = onRingsChange || onChange;

  const addRing = (ring: EyeletRing) => {
    if (!selectedRings.find(r => r.id === ring.id)) {
      handleChange?.([...selectedRings, ring]);
    }
    setOpen(false);
  };

  const removeRing = (ringId: string) => {
    handleChange?.(selectedRings.filter(r => r.id !== ringId));
  };

  const addCustomRing = () => {
    const customRing: EyeletRing = {
      id: `custom-${Date.now()}`,
      name: newRing.name || `${newRing.color} ${newRing.diameter}mm`,
      color: newRing.color || "silver",
      diameter: newRing.diameter || 25,
      material: newRing.material || "metal",
      finish: newRing.finish || "brushed"
    };
    handleChange?.([...selectedRings, customRing]);
    setNewRing({
      name: "",
      color: colors[0]?.value || "silver",
      diameter: 25,
      material: materials[0]?.value || "metal",
      finish: finishes[0]?.value || "brushed"
    });
    setOpen(false);
  };

  const getColorHex = (color: string) => {
    const colorMap: Record<string, string> = {
      silver: '#C0C0C0',
      gold: '#FFD700',
      bronze: '#CD7F32',
      black: '#000000',
      white: '#FFFFFF',
      brass: '#B5A642'
    };
    return colorMap[color] || color;
  };

  return (
    <div className="space-y-2">
      <div className={`flex items-center ${showLabel ? 'justify-between' : 'justify-end'}`}>
        {showLabel && <Label>Eyelet Rings</Label>}
        {!readOnly && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Ring
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Select Eyelet Ring</h4>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Available Rings</p>
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {predefinedRings.map((ring) => (
                      <Button
                        key={ring.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addRing(ring)}
                        disabled={selectedRings.some(r => r.id === ring.id)}
                        className="justify-start h-auto py-2"
                      >
                        <div className="flex items-center gap-2 w-full">
                          {ring.image_url ? (
                            <img 
                              src={ring.image_url} 
                              alt={ring.name} 
                              className="w-8 h-8 rounded-full border object-cover"
                            />
                          ) : (
                            <div 
                              className="w-6 h-6 rounded-full border" 
                              style={{ backgroundColor: getColorHex(ring.color) }}
                            />
                          )}
                          <div className="flex-1 text-left">
                            <div className="font-medium">{ring.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {ring.diameter}mm • {ring.material} • {ring.finish}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <p className="text-xs text-muted-foreground">Or Create Custom</p>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={newRing.name}
                        onChange={(e) => setNewRing({ ...newRing, name: e.target.value })}
                        placeholder="e.g., Custom Ring"
                        className="h-8"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Color</Label>
                        <Select 
                          value={newRing.color} 
                          onValueChange={(value) => setNewRing({ ...newRing, color: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colors.map((color) => (
                              <SelectItem key={color.id} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hex_color }} />
                                  {color.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Diameter (mm)</Label>
                        <Input
                          type="number"
                          value={newRing.diameter}
                          onChange={(e) => setNewRing({ ...newRing, diameter: parseInt(e.target.value) })}
                          className="h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Material</Label>
                        <Select 
                          value={newRing.material} 
                          onValueChange={(value) => setNewRing({ ...newRing, material: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map((material) => (
                              <SelectItem key={material.id} value={material.value}>
                                {material.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Finish</Label>
                        <Select 
                          value={newRing.finish} 
                          onValueChange={(value) => setNewRing({ ...newRing, finish: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {finishes.map((finish) => (
                              <SelectItem key={finish.id} value={finish.value}>
                                {finish.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      type="button"
                      onClick={addCustomRing} 
                      className="w-full h-8"
                      size="sm"
                    >
                      Add Custom Ring
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {selectedRings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedRings.map((ring) => (
            <Badge key={ring.id} variant="secondary" className="gap-2 pr-1">
              {ring.image_url ? (
                <img src={ring.image_url} alt={ring.name} className="w-4 h-4 rounded-full border object-cover" />
              ) : (
                <div 
                  className="w-3 h-3 rounded-full border" 
                  style={{ backgroundColor: getColorHex(ring.color) }}
                />
              )}
              {ring.name}
              {!readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeRing(ring.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
