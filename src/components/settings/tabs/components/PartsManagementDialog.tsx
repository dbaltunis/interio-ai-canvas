
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreatePartsOption, useUpdatePartsOption } from "@/hooks/useComponentOptions";
import type { PartsOption } from "@/hooks/useComponentOptions";

interface PartsManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingParts?: PartsOption | null;
}

export const PartsManagementDialog = ({ open, onOpenChange, editingParts }: PartsManagementDialogProps) => {
  const [name, setName] = useState(editingParts?.name || "");
  const [category, setCategory] = useState(editingParts?.category || "");
  const [price, setPrice] = useState(editingParts?.price || 0);
  const [unit, setUnit] = useState(editingParts?.unit || "per-piece");
  const [description, setDescription] = useState(editingParts?.description || "");

  const createParts = useCreatePartsOption();
  const updateParts = useUpdatePartsOption();

  const partCategories = [
    "Weights & Chains",
    "Motorization",
    "Facia Boards",
    "Brackets & Supports",
    "Cord & Controls",
    "Tiebacks & Holdbacks",
    "Valances",
    "Pelmet Boards",
    "Track Components",
    "Blind Components",
    "Installation Hardware",
    "Accessories",
    "Other"
  ];

  const unitOptions = [
    { value: "per-piece", label: "Per Piece" },
    { value: "per-meter", label: "Per Meter" },
    { value: "per-yard", label: "Per Yard" },
    { value: "per-foot", label: "Per Foot" },
    { value: "per-set", label: "Per Set" },
    { value: "per-pair", label: "Per Pair" },
    { value: "per-window", label: "Per Window" },
    { value: "per-panel", label: "Per Panel" }
  ];

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a part name");
      return;
    }

    try {
      const partsData = {
        name: name.trim(),
        category,
        price,
        unit,
        description: description.trim(),
        active: true
      };

      if (editingParts?.id) {
        await updateParts.mutateAsync({
          id: editingParts.id,
          ...partsData
        });
        toast.success("Part updated successfully");
      } else {
        await createParts.mutateAsync(partsData);
        toast.success("Part created successfully");
      }
      
      onOpenChange(false);
      
      // Reset form
      setName("");
      setCategory("");
      setPrice(0);
      setUnit("per-piece");
      setDescription("");
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error("Failed to save part");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingParts ? 'Edit' : 'Add'} Part
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partName">Part Name</Label>
              <Input
                id="partName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chain Weight, Motor Kit, Facia Board"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {partCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Description of the part, specifications, or usage notes..."
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Part Categories Examples</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Weights & Chains:</strong> Lead weights, chain weights, weighted tapes</p>
              <p><strong>Motorization:</strong> Motor kits, remote controls, wall switches</p>
              <p><strong>Facia Boards:</strong> Wooden facials, metal facials, decorative covers</p>
              <p><strong>Brackets & Supports:</strong> Wall brackets, ceiling mounts, extension brackets</p>
              <p><strong>Accessories:</strong> Tiebacks, holdbacks, cord cleats, safety devices</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-slate-600 hover:bg-slate-700"
            disabled={createParts.isPending || updateParts.isPending}
          >
            {createParts.isPending || updateParts.isPending 
              ? 'Saving...' 
              : editingParts ? 'Update Part' : 'Save Part'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
