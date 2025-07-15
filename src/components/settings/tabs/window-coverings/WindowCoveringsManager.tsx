
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { WindowCoveringForm } from "./WindowCoveringForm";
import { WindowCoveringsList } from "./WindowCoveringsList";

export const WindowCoveringsManager = () => {
  const { windowCoverings, isLoading, createWindowCovering, updateWindowCovering, deleteWindowCovering } = useWindowCoverings();
  const [isCreating, setIsCreating] = useState(false);
  const [editingWindowCovering, setEditingWindowCovering] = useState(null);

  const handleSave = async (windowCoveringData: any) => {
    try {
      if (editingWindowCovering) {
        await updateWindowCovering({ ...windowCoveringData, id: editingWindowCovering.id });
        setEditingWindowCovering(null);
      } else {
        await createWindowCovering(windowCoveringData);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error saving window covering:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading window coverings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Window Covering Types</CardTitle>
          <CardDescription>
            Create and manage your window covering product types (curtains, blinds, shutters, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-brand-neutral">
              Define the basic window covering products that you offer
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Window Covering
            </Button>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || editingWindowCovering) && (
            <div className="mb-6">
              <WindowCoveringForm
                windowCovering={editingWindowCovering}
                onSave={handleSave}
                onCancel={() => {
                  setIsCreating(false);
                  setEditingWindowCovering(null);
                }}
              />
            </div>
          )}

          {/* Window Coverings List */}
          <WindowCoveringsList
            windowCoverings={windowCoverings || []}
            onEdit={setEditingWindowCovering}
            onDelete={deleteWindowCovering}
          />
        </CardContent>
      </Card>
    </div>
  );
};
