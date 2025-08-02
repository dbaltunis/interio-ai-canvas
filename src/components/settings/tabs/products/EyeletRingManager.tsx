import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EyeletRing {
  id: number;
  name: string;
  color: string;
  diameter: number;
  material?: string;
  finish?: string;
}

interface EyeletRingManagerProps {
  rings: EyeletRing[];
  onRingsChange: (rings: EyeletRing[]) => void;
}

export const EyeletRingManager = ({ rings, onRingsChange }: EyeletRingManagerProps) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "",
    diameter: 25,
    material: "",
    finish: ""
  });

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.color.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and color are required",
        variant: "destructive"
      });
      return;
    }

    const newRing: EyeletRing = {
      id: Math.max(...rings.map(r => r.id), 0) + 1,
      name: formData.name,
      color: formData.color,
      diameter: formData.diameter,
      material: formData.material,
      finish: formData.finish
    };

    onRingsChange([...rings, newRing]);
    setFormData({ name: "", color: "", diameter: 25, material: "", finish: "" });
    setIsAdding(false);
    
    toast({
      title: "Ring Added",
      description: "Eyelet ring has been added to the library"
    });
  };

  const handleEdit = (ring: EyeletRing) => {
    setFormData({
      name: ring.name,
      color: ring.color,
      diameter: ring.diameter,
      material: ring.material || "",
      finish: ring.finish || ""
    });
    setEditingId(ring.id);
  };

  const handleUpdate = () => {
    if (!formData.name.trim() || !formData.color.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and color are required",
        variant: "destructive"
      });
      return;
    }

    const updatedRings = rings.map(ring => 
      ring.id === editingId 
        ? { ...ring, ...formData }
        : ring
    );

    onRingsChange(updatedRings);
    setEditingId(null);
    setFormData({ name: "", color: "", diameter: 25, material: "", finish: "" });
    
    toast({
      title: "Ring Updated",
      description: "Eyelet ring has been updated"
    });
  };

  const handleDelete = (ringId: number) => {
    const updatedRings = rings.filter(ring => ring.id !== ringId);
    onRingsChange(updatedRings);
    
    toast({
      title: "Ring Deleted",
      description: "Eyelet ring has been removed from the library"
    });
  };

  const resetForm = () => {
    setFormData({ name: "", color: "", diameter: 25, material: "", finish: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Eyelet Ring Library</CardTitle>
            <CardDescription>Manage available eyelet ring options</CardDescription>
          </div>
          <Button onClick={() => setIsAdding(true)} size="sm" disabled={isAdding || editingId !== null}>
            <Plus className="h-4 w-4 mr-2" />
            Add Ring
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(isAdding || editingId !== null) && (
          <Card className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ring_name">Ring Name *</Label>
                  <Input
                    id="ring_name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Standard Silver 25mm"
                  />
                </div>
                <div>
                  <Label htmlFor="ring_color">Color *</Label>
                  <Input
                    id="ring_color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="e.g., Silver, Black, Brass"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ring_diameter">Diameter (mm)</Label>
                  <Input
                    id="ring_diameter"
                    type="number"
                    value={formData.diameter}
                    onChange={(e) => setFormData(prev => ({ ...prev, diameter: parseInt(e.target.value) || 25 }))}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="ring_material">Material</Label>
                  <Input
                    id="ring_material"
                    value={formData.material}
                    onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                    placeholder="e.g., Metal, Plastic"
                  />
                </div>
                <div>
                  <Label htmlFor="ring_finish">Finish</Label>
                  <Input
                    id="ring_finish"
                    value={formData.finish}
                    onChange={(e) => setFormData(prev => ({ ...prev, finish: e.target.value }))}
                    placeholder="e.g., Matt, Glossy"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={editingId ? handleUpdate : handleAdd}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? "Update" : "Add"} Ring
                </Button>
                <Button variant="outline" onClick={resetForm} size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {rings.map((ring) => (
            <div key={ring.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium">{ring.name}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">{ring.color}</Badge>
                    <Badge variant="outline">{ring.diameter}mm</Badge>
                    {ring.material && <Badge variant="outline">{ring.material}</Badge>}
                    {ring.finish && <Badge variant="outline">{ring.finish}</Badge>}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(ring)}
                  disabled={isAdding || editingId !== null}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(ring.id)}
                  disabled={isAdding || editingId !== null}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {rings.length === 0 && !isAdding && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No eyelet rings in the library.</p>
            <p className="text-sm">Add your first ring to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};