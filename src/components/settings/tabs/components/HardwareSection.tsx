
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useHardwareOptions, useUpdateHardwareOption, useDeleteHardwareOption } from "@/hooks/useComponentOptions";
import type { HardwareOption } from "@/hooks/useComponentOptions";
import { HardwareManagementDialog } from "./HardwareManagementDialog";
import { toast } from "sonner";

export const HardwareSection = () => {
  const { data: hardware = [], isLoading: hardwareLoading } = useHardwareOptions();
  const updateHardware = useUpdateHardwareOption();
  const deleteHardware = useDeleteHardwareOption();
  const [isHardwareDialogOpen, setIsHardwareDialogOpen] = useState(false);
  const [editingHardware, setEditingHardware] = useState<HardwareOption | null>(null);

  console.log('Hardware data:', hardware);

  const handleToggleHardware = async (id: string) => {
    try {
      const item = hardware.find(h => h.id === id);
      if (item) {
        await updateHardware.mutateAsync({
          id,
          active: !item.active
        });
        toast.success(`Hardware ${item.active ? 'disabled' : 'enabled'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling hardware:', error);
      toast.error("Failed to toggle hardware option");
    }
  };

  const handleDeleteHardware = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hardware option?")) {
      return;
    }
    
    try {
      await deleteHardware.mutateAsync(id);
      toast.success("Hardware option deleted successfully");
    } catch (error) {
      console.error('Error deleting hardware:', error);
      toast.error("Failed to delete hardware option");
    }
  };

  const handleEditHardware = (hardware: HardwareOption) => {
    setEditingHardware(hardware);
    setIsHardwareDialogOpen(true);
  };

  const handleAddHardware = () => {
    setEditingHardware(null);
    setIsHardwareDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsHardwareDialogOpen(false);
    setEditingHardware(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Hardware Components</h4>
        <Button 
          size="sm" 
          className="bg-brand-primary hover:bg-brand-accent"
          onClick={handleAddHardware}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Hardware
        </Button>
      </div>

      {hardwareLoading ? (
        <div className="text-center py-4">Loading hardware...</div>
      ) : hardware.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-brand-neutral">No hardware components found</p>
            <Button 
              className="mt-4 bg-brand-primary hover:bg-brand-accent"
              onClick={handleAddHardware}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Hardware Component
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {hardware.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Switch 
                      checked={item.active} 
                      onCheckedChange={() => handleToggleHardware(item.id)}
                    />
                    <div>
                      <h5 className="font-medium text-brand-primary">{item.name}</h5>
                      <p className="text-sm text-brand-neutral">
                        ${item.price} per {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditHardware(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteHardware(item.id)}
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

      <HardwareManagementDialog 
        open={isHardwareDialogOpen}
        onOpenChange={handleCloseDialog}
        editingHardware={editingHardware}
      />
    </div>
  );
};
