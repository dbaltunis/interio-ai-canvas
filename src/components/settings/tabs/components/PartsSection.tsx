
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { usePartsOptions, useUpdatePartsOption, useDeletePartsOption } from "@/hooks/useComponentOptions";
import type { PartsOption } from "@/hooks/useComponentOptions";
import { PartsManagementDialog } from "./PartsManagementDialog";
import { toast } from "sonner";

export const PartsSection = () => {
  const { data: parts = [], isLoading: partsLoading } = usePartsOptions();
  const updateParts = useUpdatePartsOption();
  const deleteParts = useDeletePartsOption();
  const [isPartsDialogOpen, setIsPartsDialogOpen] = useState(false);
  const [editingParts, setEditingParts] = useState<PartsOption | null>(null);

  console.log('Parts data:', parts);

  const handleToggleParts = async (id: string) => {
    try {
      const item = parts.find(p => p.id === id);
      if (item) {
        await updateParts.mutateAsync({
          id,
          active: !item.active
        });
        toast.success(`${item.name} ${item.active ? 'disabled' : 'enabled'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling parts:', error);
      toast.error("Failed to toggle parts option");
    }
  };

  const handleDeleteParts = async (id: string) => {
    if (!confirm("Are you sure you want to delete this parts option?")) {
      return;
    }
    
    try {
      await deleteParts.mutateAsync(id);
      toast.success("Parts option deleted successfully");
    } catch (error) {
      console.error('Error deleting parts:', error);
      toast.error("Failed to delete parts option");
    }
  };

  const handleEditParts = (parts: PartsOption) => {
    setEditingParts(parts);
    setIsPartsDialogOpen(true);
  };

  const handleAddParts = () => {
    setEditingParts(null);
    setIsPartsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsPartsDialogOpen(false);
    setEditingParts(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Parts & Accessories</h4>
          <p className="text-sm text-brand-neutral">Weights, chains, motorizations, facia boards, and other components</p>
        </div>
        <Button 
          size="sm" 
          className="bg-brand-primary hover:bg-brand-accent"
          onClick={handleAddParts}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Part
        </Button>
      </div>

      {partsLoading ? (
        <div className="text-center py-4">Loading parts...</div>
      ) : parts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-brand-neutral">No parts or accessories found</p>
            <Button 
              className="mt-4 bg-brand-primary hover:bg-brand-accent"
              onClick={handleAddParts}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Part
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {parts.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Switch 
                      checked={item.active} 
                      onCheckedChange={() => handleToggleParts(item.id)}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-brand-primary">{item.name}</h5>
                        {item.category && (
                          <span className="text-xs bg-brand-neutral/10 text-brand-neutral px-2 py-1 rounded">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-brand-neutral">
                        ${item.price} per {item.unit.replace('per-', '')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditParts(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteParts(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PartsManagementDialog 
        open={isPartsDialogOpen}
        onOpenChange={handleCloseDialog}
        editingParts={editingParts}
      />
    </div>
  );
};
