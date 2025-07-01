
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Settings, Calculator, FolderTree } from "lucide-react";
import { WindowCoveringForm } from "./WindowCoveringForm";
import { WindowCoveringOptionsManager } from "./WindowCoveringOptionsManager";
import { WindowCoveringCategoryManager } from "./WindowCoveringCategoryManager";
import { SelectedCategoriesInfo } from "../../job-creation/treatment-pricing/window-covering-options/SelectedCategoriesInfo";
import { useWindowCoverings, type WindowCovering } from "@/hooks/useWindowCoverings";

export const WindowCoveringsManagement = () => {
  const { 
    windowCoverings, 
    isLoading, 
    createWindowCovering, 
    updateWindowCovering, 
    deleteWindowCovering 
  } = useWindowCoverings();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [managingOptionsId, setManagingOptionsId] = useState<string | null>(null);

  const handleSave = async (windowCovering: Omit<WindowCovering, 'id' | 'optionsCount'>) => {
    try {
      if (editingId) {
        await updateWindowCovering(editingId, windowCovering);
      } else {
        await createWindowCovering(windowCovering);
      }
      setIsCreating(false);
      setEditingId(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEdit = (windowCovering: WindowCovering) => {
    setEditingId(windowCovering.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWindowCovering(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
  };

  const editingWindowCovering = editingId ? windowCoverings.find(wc => wc.id === editingId) : undefined;

  if (managingOptionsId) {
    const windowCovering = windowCoverings.find(wc => wc.id === managingOptionsId);
    return (
      <WindowCoveringOptionsManager
        windowCovering={windowCovering!}
        onBack={() => setManagingOptionsId(null)}
      />
    );
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading window coverings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Window Coverings</h3>
          <p className="text-sm text-brand-neutral">Create and manage bespoke window covering products</p>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Window Coverings
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            Option Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-medium text-brand-primary">Products</h4>
              <p className="text-sm text-brand-neutral">Manage individual window covering products</p>
            </div>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Window Covering
            </Button>
          </div>

          {/* Existing Window Coverings List */}
          <div className="grid gap-4">
            {windowCoverings.map((windowCovering) => (
              <Card key={windowCovering.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {windowCovering.image_url && (
                        <img 
                          src={windowCovering.image_url} 
                          alt={windowCovering.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold text-brand-primary">{windowCovering.name}</h4>
                            <div className="flex gap-4 text-sm text-brand-neutral">
                              <span>Margin: {windowCovering.margin_percentage}%</span>
                              {windowCovering.fabrication_pricing_method && (
                                <span>Pricing: {windowCovering.fabrication_pricing_method.replace('-', ' ')}</span>
                              )}
                              {windowCovering.unit_price && windowCovering.fabrication_pricing_method !== 'pricing-grid' && (
                                <span>Unit Price: £{windowCovering.unit_price}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {windowCovering.description && (
                          <p className="text-sm text-brand-neutral bg-gray-50 p-2 rounded">
                            {windowCovering.description}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Badge variant={windowCovering.active ? "default" : "secondary"}>
                            {windowCovering.active ? "Active" : "Inactive"}
                          </Badge>
                          {windowCovering.fabrication_pricing_method === 'pricing-grid' && windowCovering.pricing_grid_data && (
                            <Badge variant="outline">
                              CSV Grid Uploaded
                            </Badge>
                          )}
                        </div>
                        <div className="pt-2">
                          <p className="text-xs text-gray-600 mb-1">Option Categories:</p>
                          <SelectedCategoriesInfo windowCoveringId={windowCovering.id} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setManagingOptionsId(windowCovering.id)}
                        title="Manage Options"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(windowCovering)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(windowCovering.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {windowCoverings.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-brand-neutral">No window coverings created yet.</p>
                  <Button 
                    onClick={() => setIsCreating(true)}
                    className="mt-4 bg-brand-primary hover:bg-brand-accent"
                  >
                    Create Your First Window Covering
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Create/Edit Form */}
          {isCreating && (
            <WindowCoveringForm
              windowCovering={editingWindowCovering}
              onSave={handleSave}
              onCancel={handleCancel}
              isEditing={!!editingId}
            />
          )}
        </TabsContent>

        <TabsContent value="categories">
          <WindowCoveringCategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
