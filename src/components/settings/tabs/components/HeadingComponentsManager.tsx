
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useComponents } from "@/hooks/useComponents";
import { ComponentForm } from "./ComponentForm";
import { ComponentsList } from "./ComponentsList";

export const HeadingComponentsManager = () => {
  const { components, isLoading, createComponent, updateComponent, deleteComponent } = useComponents();
  const [isCreating, setIsCreating] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);

  const headingComponents = components?.filter(c => c.component_type === 'heading') || [];

  const handleSave = async (componentData: any) => {
    try {
      const data = { ...componentData, component_type: 'heading' };
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
    return <div className="text-center py-8">Loading heading components...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Heading Components</CardTitle>
          <CardDescription>
            Manage heading styles with fullness ratios for fabric calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-brand-neutral">
              Add heading styles and their fabric fullness requirements
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Heading Style
            </Button>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || editingComponent) && (
            <div className="mb-6">
              <ComponentForm
                component={editingComponent}
                componentType="heading"
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
            components={headingComponents}
            onEdit={setEditingComponent}
            onDelete={deleteComponent.mutateAsync}
          />
        </CardContent>
      </Card>
    </div>
  );
};
