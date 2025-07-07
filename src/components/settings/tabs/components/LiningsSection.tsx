
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useLiningOptions, useUpdateLiningOption, useDeleteLiningOption } from "@/hooks/useComponentOptions";
import type { LiningOption } from "@/hooks/useComponentOptions";
import { LiningManagementDialog } from "./LiningManagementDialog";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { toast } from "sonner";

export const LiningsSection = () => {
  const { data: linings = [], isLoading: liningsLoading } = useLiningOptions();
  const updateLining = useUpdateLiningOption();
  const deleteLining = useDeleteLiningOption();
  const { getFabricUnitLabel } = useMeasurementUnits();
  const [isLiningDialogOpen, setIsLiningDialogOpen] = useState(false);
  const [editingLining, setEditingLining] = useState<LiningOption | null>(null);

  const fabricUnit = getFabricUnitLabel();

  console.log('Lining data:', linings);

  const handleToggleLining = async (id: string) => {
    try {
      const item = linings.find(l => l.id === id);
      if (item) {
        await updateLining.mutateAsync({
          id,
          active: !item.active
        });
        toast.success(`Lining ${item.active ? 'disabled' : 'enabled'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling lining:', error);
      toast.error("Failed to toggle lining option");
    }
  };

  const handleDeleteLining = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lining option?")) {
      return;
    }
    
    try {
      await deleteLining.mutateAsync(id);
      toast.success("Lining option deleted successfully");
    } catch (error) {
      console.error('Error deleting lining:', error);
      toast.error("Failed to delete lining option");
    }
  };

  const handleEditLining = (lining: LiningOption) => {
    setEditingLining(lining);
    setIsLiningDialogOpen(true);
  };

  const handleAddLining = () => {
    setEditingLining(null);
    setIsLiningDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsLiningDialogOpen(false);
    setEditingLining(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Lining Options</h4>
        <Button 
          size="sm" 
          className="bg-brand-primary hover:bg-brand-accent"
          onClick={handleAddLining}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lining
        </Button>
      </div>

      {liningsLoading ? (
        <div className="text-center py-4">Loading linings...</div>
      ) : linings.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-brand-neutral">No lining options found</p>
            <Button 
              className="mt-4 bg-brand-primary hover:bg-brand-accent"
              onClick={handleAddLining}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Lining Option
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {linings.map((lining) => (
            <Card key={lining.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Switch 
                      checked={lining.active} 
                      onCheckedChange={() => handleToggleLining(lining.id)}
                    />
                    <div>
                      <h5 className="font-medium text-brand-primary">{lining.name}</h5>
                      <p className="text-sm text-brand-neutral">
                        ${lining.price} per {lining.unit.replace('per-', '')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditLining(lining)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteLining(lining.id)}
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

      <LiningManagementDialog 
        open={isLiningDialogOpen}
        onOpenChange={handleCloseDialog}
        editingLining={editingLining}
      />
    </div>
  );
};
