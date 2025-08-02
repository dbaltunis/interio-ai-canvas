import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiningType {
  type: string;
  price_per_metre: number;
  labour_per_curtain: number;
  description?: string;
}

interface LiningTypeManagerProps {
  liningTypes: LiningType[];
  onLiningTypesChange: (types: LiningType[]) => void;
}

export const LiningTypeManager = ({ liningTypes, onLiningTypesChange }: LiningTypeManagerProps) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    price_per_metre: 0,
    labour_per_curtain: 0,
    description: ""
  });

  const handleAdd = () => {
    if (!formData.type.trim()) {
      toast({
        title: "Validation Error",
        description: "Lining type name is required",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate names
    if (liningTypes.some(lining => lining.type.toLowerCase() === formData.type.toLowerCase())) {
      toast({
        title: "Validation Error",
        description: "A lining type with this name already exists",
        variant: "destructive"
      });
      return;
    }

    const newLiningType: LiningType = {
      type: formData.type,
      price_per_metre: formData.price_per_metre,
      labour_per_curtain: formData.labour_per_curtain,
      description: formData.description
    };

    onLiningTypesChange([...liningTypes, newLiningType]);
    setFormData({ type: "", price_per_metre: 0, labour_per_curtain: 0, description: "" });
    setIsAdding(false);
    
    toast({
      title: "Lining Type Added",
      description: "New lining type has been added"
    });
  };

  const handleEdit = (lining: LiningType, index: number) => {
    setFormData({
      type: lining.type,
      price_per_metre: lining.price_per_metre,
      labour_per_curtain: lining.labour_per_curtain,
      description: lining.description || ""
    });
    setEditingIndex(index);
  };

  const handleUpdate = () => {
    if (!formData.type.trim()) {
      toast({
        title: "Validation Error",
        description: "Lining type name is required",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate names (excluding current item)
    if (liningTypes.some((lining, index) => 
      index !== editingIndex && lining.type.toLowerCase() === formData.type.toLowerCase()
    )) {
      toast({
        title: "Validation Error",
        description: "A lining type with this name already exists",
        variant: "destructive"
      });
      return;
    }

    const updatedLiningTypes = liningTypes.map((lining, index) => 
      index === editingIndex 
        ? { ...lining, ...formData }
        : lining
    );

    onLiningTypesChange(updatedLiningTypes);
    setEditingIndex(null);
    setFormData({ type: "", price_per_metre: 0, labour_per_curtain: 0, description: "" });
    
    toast({
      title: "Lining Type Updated",
      description: "Lining type has been updated"
    });
  };

  const handleDelete = (index: number) => {
    const updatedLiningTypes = liningTypes.filter((_, i) => i !== index);
    onLiningTypesChange(updatedLiningTypes);
    
    toast({
      title: "Lining Type Deleted",
      description: "Lining type has been removed"
    });
  };

  const resetForm = () => {
    setFormData({ type: "", price_per_metre: 0, labour_per_curtain: 0, description: "" });
    setIsAdding(false);
    setEditingIndex(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Lining Types</CardTitle>
            <CardDescription>Configure available lining options with pricing</CardDescription>
          </div>
          <Button onClick={() => setIsAdding(true)} size="sm" disabled={isAdding || editingIndex !== null}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lining
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(isAdding || editingIndex !== null) && (
          <Card className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lining_type">Lining Type *</Label>
                  <Input
                    id="lining_type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="e.g., Standard, Blackout, Thermal"
                  />
                </div>
                <div>
                  <Label htmlFor="lining_description">Description</Label>
                  <Input
                    id="lining_description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_per_metre">Price per Metre ($)</Label>
                  <Input
                    id="price_per_metre"
                    type="number"
                    step="0.01"
                    value={formData.price_per_metre}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_per_metre: parseFloat(e.target.value) || 0 }))}
                    placeholder="15.00"
                  />
                </div>
                <div>
                  <Label htmlFor="labour_per_curtain">Labour per Curtain ($)</Label>
                  <Input
                    id="labour_per_curtain"
                    type="number"
                    step="0.01"
                    value={formData.labour_per_curtain}
                    onChange={(e) => setFormData(prev => ({ ...prev, labour_per_curtain: parseFloat(e.target.value) || 0 }))}
                    placeholder="25.00"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={editingIndex !== null ? handleUpdate : handleAdd}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingIndex !== null ? "Update" : "Add"} Lining
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
          {liningTypes.map((lining, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{lining.type}</p>
                  {lining.description && (
                    <p className="text-sm text-muted-foreground">- {lining.description}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">${lining.price_per_metre}/m</Badge>
                  <Badge variant="outline">${lining.labour_per_curtain} labour</Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(lining, index)}
                  disabled={isAdding || editingIndex !== null}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(index)}
                  disabled={isAdding || editingIndex !== null}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {liningTypes.length === 0 && !isAdding && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No lining types configured.</p>
            <p className="text-sm">Add your first lining type to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};