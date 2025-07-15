
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useComponents } from "@/hooks/useComponents";
import { ComponentForm } from "./ComponentForm";
import { ComponentsList } from "./ComponentsList";

export const FabricAccessoriesManager = () => {
  const { components, isLoading, createComponent, updateComponent, deleteComponent } = useComponents();
  const [isCreating, setIsCreating] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);

  const fabricAccessories = components?.filter(c => c.component_type === 'fabric_accessory') || [];

  const handleSave = async (componentData: any) => {
    try {
      const data = { ...componentData, component_type: 'fabric_accessory' };
      if (editingComponent) {
        await updateComponent.mutateAsync({ ...data, id: editingComponent.id });
        setEditingComponent(null);
      } else {
        await createComponent.mutateAsync(data);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error saving component:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading fabric accessories...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fabric Accessories</CardTitle>
          <CardDescription>
            Manage fabric-related components like linings, trimmings, borders, and embellishments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-brand-neutral">
              Add fabric accessories and embellishments with pricing
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fabric Accessory
            </Button>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || editingComponent) && (
            <div className="mb-6">
              <ComponentForm
                component={editingComponent}
                componentType="fabric_accessory"
                onSave={handleSave}
                onCancel={() => {
                  setIsCreating(false);
                  setEditingComponent(null);
                }}
              />
            </div>
          )}

          {/* Components List */}
          <ComponentsList
            components={fabricAccessories}
            onEdit={setEditingComponent}
            onDelete={deleteComponent.mutateAsync}
          />
        </CardContent>
      </Card>
    </div>
  );
};
