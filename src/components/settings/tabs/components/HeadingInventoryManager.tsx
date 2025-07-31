import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useEnhancedInventoryByCategory, useCreateEnhancedInventoryItem, useUpdateEnhancedInventoryItem, useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import type { EnhancedInventoryItem } from "@/hooks/useEnhancedInventory";

export const HeadingInventoryManager = () => {
  const { data: headings = [], isLoading } = useEnhancedInventoryByCategory('heading');
  const createItem = useCreateEnhancedInventoryItem();
  const updateItem = useUpdateEnhancedInventoryItem();
  const deleteItem = useDeleteEnhancedInventoryItem();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingHeading, setEditingHeading] = useState<EnhancedInventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fullness_ratio: 2.5,
    labor_hours: 0,
    cost_price: 0,
    selling_price: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      fullness_ratio: 2.5,
      labor_hours: 0,
      cost_price: 0,
      selling_price: 0
    });
  };

  const handleSave = async () => {
    try {
      const itemData = {
        ...formData,
        category: 'heading' as const,
        quantity: 1,
        active: true
      };

      if (editingHeading) {
        await updateItem.mutateAsync({ id: editingHeading.id, ...itemData });
        setEditingHeading(null);
      } else {
        await createItem.mutateAsync(itemData);
        setIsCreating(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving heading:', error);
    }
  };

  const handleEdit = (heading: EnhancedInventoryItem) => {
    setFormData({
      name: heading.name,
      description: heading.description || '',
      fullness_ratio: heading.fullness_ratio || 2.5,
      labor_hours: heading.labor_hours || 0,
      cost_price: heading.cost_price || 0,
      selling_price: heading.selling_price || 0
    });
    setEditingHeading(heading);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this heading?')) {
      await deleteItem.mutateAsync(id);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingHeading(null);
    resetForm();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading headings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Heading Styles</CardTitle>
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
          {(isCreating || editingHeading) && (
            <div className="mb-6 p-4 border rounded-lg bg-brand-background">
              <h3 className="text-lg font-semibold mb-4">
                {editingHeading ? 'Edit Heading Style' : 'Add New Heading Style'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Style Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Pinch Pleat, Eyelet, Tab Top"
                  />
                </div>
                <div>
                  <Label htmlFor="fullness_ratio">Fullness Ratio</Label>
                  <Input
                    id="fullness_ratio"
                    type="number"
                    step="0.1"
                    value={formData.fullness_ratio}
                    onChange={(e) => setFormData({ ...formData, fullness_ratio: parseFloat(e.target.value) || 0 })}
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <Label htmlFor="labor_hours">Labor Hours</Label>
                  <Input
                    id="labor_hours"
                    type="number"
                    step="0.5"
                    value={formData.labor_hours}
                    onChange={(e) => setFormData({ ...formData, labor_hours: parseFloat(e.target.value) || 0 })}
                    placeholder="2.0"
                  />
                </div>
                <div>
                  <Label htmlFor="cost_price">Cost Price</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                    placeholder="25.00"
                  />
                </div>
                <div>
                  <Label htmlFor="selling_price">Selling Price</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                    placeholder="50.00"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the heading style and its characteristics"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave} disabled={!formData.name}>
                  {editingHeading ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Headings List */}
          <div className="space-y-4">
            {headings.length === 0 ? (
              <p className="text-center text-brand-neutral py-8">
                No heading styles yet. Add your first heading style to get started.
              </p>
            ) : (
              headings.map((heading) => (
                <div key={heading.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{heading.name}</h4>
                    {heading.description && (
                      <p className="text-sm text-brand-neutral mt-1">{heading.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-brand-neutral">
                      <span>Fullness: {heading.fullness_ratio}</span>
                      <span>Labor: {heading.labor_hours}h</span>
                      <span>Price: ${heading.selling_price || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(heading)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(heading.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};