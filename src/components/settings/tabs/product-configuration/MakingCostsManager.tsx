
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMakingCosts } from "@/hooks/useMakingCosts";
import { MakingCostForm } from "./MakingCostForm";
import { MakingCostList } from "./MakingCostList";

export const MakingCostsManager = () => {
  const { makingCosts, isLoading, createMakingCost, updateMakingCost, deleteMakingCost } = useMakingCosts();
  const [isCreating, setIsCreating] = useState(false);
  const [editingMakingCost, setEditingMakingCost] = useState<any>(null);

  const handleSave = async (makingCostData: any) => {
    try {
      if (editingMakingCost) {
        await updateMakingCost.mutateAsync({ id: editingMakingCost.id, ...makingCostData });
        setEditingMakingCost(null);
      } else {
        await createMakingCost.mutateAsync(makingCostData);
        setIsCreating(false);
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMakingCost.mutateAsync(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading making costs...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Making Costs</CardTitle>
          <CardDescription>
            Define labor costs for different product types and complexity levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-brand-neutral">
              Set up making costs per width, per meter, or hourly rates with complexity multipliers
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Making Cost
            </Button>
          </div>

          {/* Create/Edit Making Cost Form */}
          {(isCreating || editingMakingCost) && (
            <div className="mb-6">
              <MakingCostForm
                makingCost={editingMakingCost}
                onSave={handleSave}
                onCancel={() => {
                  setIsCreating(false);
                  setEditingMakingCost(null);
                }}
                isEditing={!!editingMakingCost}
              />
            </div>
          )}

          {/* Making Costs List */}
          <MakingCostList
            makingCosts={makingCosts}
            onEdit={setEditingMakingCost}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};
