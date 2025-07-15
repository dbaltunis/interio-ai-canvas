
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useComponents } from "@/hooks/useComponents";
import { ComponentForm } from "./ComponentForm";
import { ComponentsList } from "./ComponentsList";

export const ServiceComponentsManager = () => {
  const { components, isLoading, createComponent, updateComponent, deleteComponent } = useComponents();
  const [isCreating, setIsCreating] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);

  const serviceComponents = components?.filter(c => c.component_type === 'service') || [];

  const handleSave = async (componentData: any) => {
    try {
      const data = { ...componentData, component_type: 'service' };
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
    return <div className="text-center py-8">Loading service components...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Components</CardTitle>
          <CardDescription>
            Manage services like installation, measuring, delivery, and consultation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-brand-neutral">
              Add services with hourly rates or fixed pricing
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || editingComponent) && (
            <div className="mb-6">
              <ComponentForm
                component={editingComponent}
                componentType="service"
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
            components={serviceComponents}
            onEdit={setEditingComponent}
            onDelete={deleteComponent}
          />
        </CardContent>
      </Card>
    </div>
  );
};
