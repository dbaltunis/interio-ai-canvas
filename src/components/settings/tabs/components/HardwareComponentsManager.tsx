
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useComponents } from "@/hooks/useComponents";
import { ComponentForm } from "./ComponentForm";
import { ComponentsList } from "./ComponentsList";

export const HardwareComponentsManager = () => {
  const { components, isLoading, createComponent, updateComponent, deleteComponent } = useComponents();
  const [isCreating, setIsCreating] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);

  const hardwareComponents = components?.filter(c => c.component_type === 'hardware') || [];

  const handleSave = async (componentData: any) => {
    try {
      const data = { ...componentData, component_type: 'hardware' };
      if (editingComponent) {
        await updateComponent({ ...data, id: editingComponent.id });
        setEditingComponent(null);
      } else {
        await createComponent(data);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error saving component:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading hardware components...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hardware Components</CardTitle>
          <CardDescription>
            Manage hardware components like tracks, brackets, motors, and mechanisms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-brand-neutral">
              Add hardware components with pricing and specifications
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Hardware Component
            </Button>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || editingComponent) && (
            <div className="mb-6">
              <ComponentForm
                component={editingComponent}
                componentType="hardware"
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
            components={hardwareComponents}
            onEdit={setEditingComponent}
            onDelete={deleteComponent}
          />
        </CardContent>
      </Card>
    </div>
  );
};
