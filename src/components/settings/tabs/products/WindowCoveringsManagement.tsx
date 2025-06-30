import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Settings, Calculator, FolderTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WindowCoveringForm } from "./WindowCoveringForm";
import { WindowCoveringOptionsManager } from "./WindowCoveringOptionsManager";
import { WindowCoveringCategoryManager } from "./WindowCoveringCategoryManager";

interface WindowCovering {
  id: string;
  name: string;
  description?: string;
  margin_percentage: number;
  fabrication_pricing_method?: 'per-panel' | 'per-drop' | 'per-meter' | 'per-yard' | 'pricing-grid';
  image_url?: string;
  active: boolean;
  optionsCount?: number;
  pricing_grid_data?: string;
}

export const WindowCoveringsManagement = () => {
  const { toast } = useToast();
  const [windowCoverings, setWindowCoverings] = useState<WindowCovering[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [managingOptionsId, setManagingOptionsId] = useState<string | null>(null);

  const handleSave = (windowCovering: WindowCovering) => {
    if (editingId) {
      setWindowCoverings(prev => prev.map(wc => wc.id === editingId ? windowCovering : wc));
      toast({
        title: "Success",
        description: "Window covering updated successfully"
      });
    } else {
      setWindowCoverings(prev => [...prev, { ...windowCovering, id: Date.now().toString() }]);
      toast({
        title: "Success",
        description: "Window covering created successfully"
      });
    }
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (windowCovering: WindowCovering) => {
    setEditingId(windowCovering.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setWindowCoverings(prev => prev.filter(wc => wc.id !== id));
    toast({
      title: "Success",
      description: "Window covering deleted successfully"
    });
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
                          {windowCovering.optionsCount && (
                            <Badge variant="outline">
                              {windowCovering.optionsCount} options
                            </Badge>
                          )}
                          {windowCovering.fabrication_pricing_method === 'pricing-grid' && windowCovering.pricing_grid_data && (
                            <Badge variant="outline">
                              CSV Grid Uploaded
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setManagingOptionsId(windowCovering.id)}
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
