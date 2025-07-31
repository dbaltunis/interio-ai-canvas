import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useEnhancedInventoryByCategory, useCreateEnhancedInventoryItem, useUpdateEnhancedInventoryItem, useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import type { EnhancedInventoryItem } from "@/hooks/useEnhancedInventory";

export const ServiceInventoryManager = () => {
  const { data: services = [], isLoading } = useEnhancedInventoryByCategory('service');
  const createItem = useCreateEnhancedInventoryItem();
  const updateItem = useUpdateEnhancedInventoryItem();
  const deleteItem = useDeleteEnhancedInventoryItem();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<EnhancedInventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service_rate: 0,
    labor_hours: 1,
    cost_price: 0,
    selling_price: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      service_rate: 0,
      labor_hours: 1,
      cost_price: 0,
      selling_price: 0
    });
  };

  const handleSave = async () => {
    try {
      const itemData = {
        ...formData,
        category: 'service' as const,
        quantity: 1,
        active: true
      };

      if (editingService) {
        await updateItem.mutateAsync({ id: editingService.id, ...itemData });
        setEditingService(null);
      } else {
        await createItem.mutateAsync(itemData);
        setIsCreating(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleEdit = (service: EnhancedInventoryItem) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      service_rate: service.service_rate || 0,
      labor_hours: service.labor_hours || 1,
      cost_price: service.cost_price || 0,
      selling_price: service.selling_price || 0
    });
    setEditingService(service);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await deleteItem.mutateAsync(id);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingService(null);
    resetForm();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            Manage services with hourly rates and labor calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-brand-neutral">
              Add services and their hourly rates for accurate job costing
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
          {(isCreating || editingService) && (
            <div className="mb-6 p-4 border rounded-lg bg-brand-background">
              <h3 className="text-lg font-semibold mb-4">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Installation, Alteration, Consultation"
                  />
                </div>
                <div>
                  <Label htmlFor="service_rate">Hourly Rate ($)</Label>
                  <Input
                    id="service_rate"
                    type="number"
                    step="0.01"
                    value={formData.service_rate}
                    onChange={(e) => setFormData({ ...formData, service_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="75.00"
                  />
                </div>
                <div>
                  <Label htmlFor="labor_hours">Standard Hours</Label>
                  <Input
                    id="labor_hours"
                    type="number"
                    step="0.5"
                    value={formData.labor_hours}
                    onChange={(e) => setFormData({ ...formData, labor_hours: parseFloat(e.target.value) || 0 })}
                    placeholder="1.0"
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
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <Label htmlFor="selling_price">Service Price</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                    placeholder="100.00"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the service and what it includes"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave} disabled={!formData.name}>
                  {editingService ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Services List */}
          <div className="space-y-4">
            {services.length === 0 ? (
              <p className="text-center text-brand-neutral py-8">
                No services yet. Add your first service to get started.
              </p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{service.name}</h4>
                    {service.description && (
                      <p className="text-sm text-brand-neutral mt-1">{service.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-brand-neutral">
                      <span>Rate: ${service.service_rate || 0}/hr</span>
                      <span>Hours: {service.labor_hours || 0}</span>
                      <span>Price: ${service.selling_price || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
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