
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useServiceOptions, useCreateServiceOption, useUpdateServiceOption, useDeleteServiceOption } from "@/hooks/useServiceOptions";

export const ServicesSection = () => {
  const { data: services = [], isLoading: servicesLoading } = useServiceOptions();
  const createService = useCreateServiceOption();
  const updateService = useUpdateServiceOption();
  const deleteService = useDeleteServiceOption();

  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: "",
    price: 0,
    unit: "per-window",
    description: ""
  });

  const handleAddService = async () => {
    if (!newService.name.trim()) {
      toast.error("Please enter a service name");
      return;
    }
    
    try {
      console.log('Attempting to create service with data:', newService);
      
      await createService.mutateAsync({
        name: newService.name.trim(),
        price: Number(newService.price) || 0,
        unit: newService.unit,
        description: newService.description.trim() || null,
        active: true
      });
      
      resetServiceForm();
      toast.success("Service option added successfully");
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error("Failed to add service option");
    }
  };

  const handleEditService = (service) => {
    console.log('Editing service:', service);
    setEditingService(service.id);
    setNewService({
      name: service.name,
      price: service.price,
      unit: service.unit,
      description: service.description || ""
    });
    setIsAddingService(true);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;
    
    try {
      console.log('Attempting to update service:', editingService, newService);
      
      await updateService.mutateAsync({
        id: editingService,
        name: newService.name.trim(),
        price: Number(newService.price) || 0,
        unit: newService.unit,
        description: newService.description.trim() || null
      });
      
      resetServiceForm();
      toast.success("Service option updated successfully");
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error("Failed to update service option");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service option?")) {
      return;
    }
    
    try {
      console.log('Attempting to delete service:', id);
      await deleteService.mutateAsync(id);
      toast.success("Service option deleted successfully");
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error("Failed to delete service option");
    }
  };

  const handleToggleService = async (id: string) => {
    try {
      const service = services.find(s => s.id === id);
      if (service) {
        console.log('Toggling service active state:', id, !service.active);
        await updateService.mutateAsync({
          id,
          active: !service.active
        });
        toast.success(`Service ${service.active ? 'disabled' : 'enabled'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling service:', error);
      toast.error("Failed to toggle service option");
    }
  };

  const resetServiceForm = () => {
    setEditingService(null);
    setNewService({
      name: "",
      price: 0,
      unit: "per-window",
      description: ""
    });
    setIsAddingService(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Service Options</h4>
        <Button 
          size="sm" 
          className="bg-brand-primary hover:bg-brand-accent"
          onClick={() => setIsAddingService(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="grid gap-3">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Switch 
                    checked={service.active} 
                    onCheckedChange={() => handleToggleService(service.id)}
                  />
                  <div>
                    <h5 className="font-medium text-brand-primary">{service.name}</h5>
                    <p className="text-sm text-brand-neutral">
                      Price: ${service.price} per {service.unit}
                    </p>
                    {service.description && (
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditService(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAddingService && (
        <Card>
          <CardHeader>
            <CardTitle>{editingService ? "Edit Service" : "Add New Service"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Installation"
                />
              </div>
              <div>
                <Label htmlFor="servicePrice">Price</Label>
                <Input
                  id="servicePrice"
                  type="number"
                  step="0.01"
                  value={newService.price}
                  onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceUnit">Unit</Label>
                <Select 
                  value={newService.unit} 
                  onValueChange={(value) => setNewService(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-window">Per Window</SelectItem>
                    <SelectItem value="per-room">Per Room</SelectItem>
                    <SelectItem value="per-job">Per Job</SelectItem>
                    <SelectItem value="per-hour">Per Hour</SelectItem>
                    <SelectItem value="flat-rate">Flat Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="serviceDescription">Description (Optional)</Label>
                <Input
                  id="serviceDescription"
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the service"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={editingService ? handleUpdateService : handleAddService}
                className="bg-brand-primary hover:bg-brand-accent"
                disabled={createService.isPending || updateService.isPending}
              >
                {createService.isPending || updateService.isPending ? "Saving..." : (editingService ? "Update" : "Add")} Service
              </Button>
              <Button 
                variant="outline" 
                onClick={resetServiceForm}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
