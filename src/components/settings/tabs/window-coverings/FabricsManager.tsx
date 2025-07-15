
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFabrics } from "@/hooks/useFabrics";
import { FabricForm } from "./FabricForm";
import { FabricsList } from "./FabricsList";

export const FabricsManager = () => {
  const { fabrics, isLoading, createFabric, updateFabric, deleteFabric } = useFabrics();
  const [isCreating, setIsCreating] = useState(false);
  const [editingFabric, setEditingFabric] = useState(null);

  const handleSave = async (fabricData: any) => {
    try {
      if (editingFabric) {
        await updateFabric({ ...fabricData, id: editingFabric.id });
        setEditingFabric(null);
      } else {
        await createFabric(fabricData);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error saving fabric:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading fabrics...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fabric Management</CardTitle>
          <CardDescription>
            Manage fabric details including width, pattern repeats, and rotation settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-brand-neutral">
              Add fabrics with technical specifications for accurate calculations
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fabric
            </Button>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || editingFabric) && (
            <div className="mb-6">
              <FabricForm
                fabric={editingFabric}
                onSave={handleSave}
                onCancel={() => {
                  setIsCreating(false);
                  setEditingFabric(null);
                }}
              />
            </div>
          )}

          {/* Fabrics List */}
          <FabricsList
            fabrics={fabrics || []}
            onEdit={setEditingFabric}
            onDelete={deleteFabric}
          />
        </CardContent>
      </Card>
    </div>
  );
};
