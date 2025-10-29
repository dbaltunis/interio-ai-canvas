import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface EyeletRing {
  id: string;
  name: string;
  color: string;
  diameter: number;
  material: string;
  finish: string;
}

interface EyeletRingSelectorProps {
  selectedRings: EyeletRing[];
  onChange: (rings: EyeletRing[]) => void;
}

export const EyeletRingSelector = ({ selectedRings, onChange }: EyeletRingSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [newRing, setNewRing] = useState<Partial<EyeletRing>>({
    name: "",
    color: "silver",
    diameter: 25,
    material: "metal",
    finish: "brushed"
  });

  const predefinedRings: EyeletRing[] = [
    { id: "ring-1", name: "Silver 25mm", color: "silver", diameter: 25, material: "metal", finish: "brushed" },
    { id: "ring-2", name: "Silver 40mm", color: "silver", diameter: 40, material: "metal", finish: "brushed" },
    { id: "ring-3", name: "Gold 25mm", color: "gold", diameter: 25, material: "metal", finish: "polished" },
    { id: "ring-4", name: "Gold 40mm", color: "gold", diameter: 40, material: "metal", finish: "polished" },
    { id: "ring-5", name: "Bronze 30mm", color: "bronze", diameter: 30, material: "metal", finish: "antique" },
    { id: "ring-6", name: "Black 25mm", color: "black", diameter: 25, material: "metal", finish: "matte" },
    { id: "ring-7", name: "White 25mm", color: "white", diameter: 25, material: "plastic", finish: "gloss" },
  ];

  const addRing = (ring: EyeletRing) => {
    if (!selectedRings.find(r => r.id === ring.id)) {
      onChange([...selectedRings, ring]);
    }
    setOpen(false);
  };

  const removeRing = (ringId: string) => {
    onChange(selectedRings.filter(r => r.id !== ringId));
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
    onChange([...selectedRings, customRing]);
    setNewRing({
      name: "",
      color: "silver",
      diameter: 25,
      material: "metal",
      finish: "brushed"
    });
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Eyelet Rings</Label>
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
                <p className="text-xs text-muted-foreground">Predefined Rings</p>
                <div className="grid gap-2">
                  {predefinedRings.map((ring) => (
                    <Button
                      key={ring.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addRing(ring)}
                      disabled={selectedRings.some(r => r.id === ring.id)}
                      className="justify-start"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: ring.color === 'silver' ? '#C0C0C0' : ring.color === 'gold' ? '#FFD700' : ring.color === 'bronze' ? '#CD7F32' : ring.color }}
                        />
                        <span>{ring.name}</span>
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
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="bronze">Bronze</SelectItem>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="white">White</SelectItem>
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
      </div>

      {selectedRings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedRings.map((ring) => (
            <Badge key={ring.id} variant="secondary" className="gap-2 pr-1">
              <div 
                className="w-3 h-3 rounded-full border" 
                style={{ backgroundColor: ring.color === 'silver' ? '#C0C0C0' : ring.color === 'gold' ? '#FFD700' : ring.color === 'bronze' ? '#CD7F32' : ring.color }}
              />
              {ring.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeRing(ring.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
