
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Clock, Calendar, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import {
  useServiceOptions,
  useCreateServiceOption,
  useUpdateServiceOption,
  useDeleteServiceOption,
  SERVICE_CATEGORIES,
  SERVICE_UNITS,
  SCHEDULABLE_CATEGORIES,
  type ServiceOption,
} from "@/hooks/useServiceOptions";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getCurrencySymbol } from "@/utils/formatCurrency";

export const ServicesSection = () => {
  const { data: services = [], isLoading: servicesLoading } = useServiceOptions();
  const createService = useCreateServiceOption();
  const updateService = useUpdateServiceOption();
  const deleteService = useDeleteServiceOption();
  const { units } = useMeasurementUnits();
  const currencySymbol = getCurrencySymbol(units.currency);

  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [newService, setNewService] = useState({
    name: "",
    price: 0,
    unit: "per-window",
    description: "",
    category: "other",
    estimated_duration_minutes: 60,
    is_schedulable: false,
    cost_price: 0,
  });

  const handleAddService = async () => {
    if (!newService.name.trim()) {
      toast.error("Please enter a service name");
      return;
    }

    try {
      await createService.mutateAsync({
        name: newService.name.trim(),
        price: Number(newService.price) || 0,
        unit: newService.unit,
        description: newService.description.trim() || null,
        active: true,
        category: newService.category,
        estimated_duration_minutes: newService.estimated_duration_minutes || null,
        is_schedulable: newService.is_schedulable,
        cost_price: Number(newService.cost_price) || null,
      });

      resetServiceForm();
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleEditService = (service: ServiceOption) => {
    setEditingService(service.id);
    setNewService({
      name: service.name,
      price: service.price,
      unit: service.unit,
      description: service.description || "",
      category: service.category || "other",
      estimated_duration_minutes: service.estimated_duration_minutes || 60,
      is_schedulable: service.is_schedulable || false,
      cost_price: service.cost_price || 0,
    });
    setIsAddingService(true);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    try {
      await updateService.mutateAsync({
        id: editingService,
        name: newService.name.trim(),
        price: Number(newService.price) || 0,
        unit: newService.unit,
        description: newService.description.trim() || null,
        category: newService.category,
        estimated_duration_minutes: newService.estimated_duration_minutes || null,
        is_schedulable: newService.is_schedulable,
        cost_price: Number(newService.cost_price) || null,
      });

      resetServiceForm();
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      await deleteService.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleService = async (id: string) => {
    try {
      const service = services.find(s => s.id === id);
      if (service) {
        await updateService.mutateAsync({
          id,
          active: !service.active
        });
      }
    } catch (error) {
      console.error('Error toggling service:', error);
    }
  };

  const resetServiceForm = () => {
    setEditingService(null);
    setNewService({
      name: "",
      price: 0,
      unit: "per-window",
      description: "",
      category: "other",
      estimated_duration_minutes: 60,
      is_schedulable: false,
      cost_price: 0,
    });
    setIsAddingService(false);
  };

  const handleCategoryChange = (category: string) => {
    const isSchedulable = SCHEDULABLE_CATEGORIES.includes(category);
    setNewService(prev => ({
      ...prev,
      category,
      is_schedulable: isSchedulable,
    }));
  };

  const getCategoryLabel = (value: string) => {
    return SERVICE_CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const getUnitLabel = (value: string) => {
    return SERVICE_UNITS.find(u => u.value === value)?.label || value;
  };

  if (servicesLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Service Options
              </CardTitle>
              <CardDescription>
                Define services like measurement, installation, delivery, and consultation.
                These can be added to quotes and projects.
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddingService(true)}
              className="bg-brand-primary hover:bg-brand-accent"
              disabled={isAddingService}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Form */}
          {isAddingService && (
            <Card className="mb-6 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {editingService ? "Edit Service" : "Add New Service"}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={resetServiceForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serviceName">Service Name *</Label>
                    <Input
                      id="serviceName"
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Installation, Site Survey"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceCategory">Category</Label>
                    <Select
                      value={newService.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="servicePrice">Selling Price ({currencySymbol})</Label>
                    <Input
                      id="servicePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newService.price}
                      onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceCostPrice">Cost Price ({currencySymbol})</Label>
                    <Input
                      id="serviceCostPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newService.cost_price}
                      onChange={(e) => setNewService(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceUnit">Pricing Unit</Label>
                    <Select
                      value={newService.unit}
                      onValueChange={(value) => setNewService(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_UNITS.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serviceDuration">Estimated Duration (minutes)</Label>
                    <Input
                      id="serviceDuration"
                      type="number"
                      step="15"
                      min="0"
                      value={newService.estimated_duration_minutes}
                      onChange={(e) => setNewService(prev => ({ ...prev, estimated_duration_minutes: parseInt(e.target.value) || 0 }))}
                      placeholder="60"
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="serviceSchedulable"
                        checked={newService.is_schedulable}
                        onCheckedChange={(checked) => setNewService(prev => ({ ...prev, is_schedulable: checked }))}
                      />
                      <Label htmlFor="serviceSchedulable" className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Schedulable (create calendar event)
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="serviceDescription">Description</Label>
                  <Textarea
                    id="serviceDescription"
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the service and what it includes"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={editingService ? handleUpdateService : handleAddService}
                    className="bg-brand-primary hover:bg-brand-accent"
                    disabled={createService.isPending || updateService.isPending || !newService.name.trim()}
                  >
                    {createService.isPending || updateService.isPending
                      ? "Saving..."
                      : editingService ? "Update Service" : "Add Service"}
                  </Button>
                  <Button variant="outline" onClick={resetServiceForm}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services List */}
          <div className="space-y-3">
            {services.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wrench className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No services configured</p>
                <p className="text-sm mt-1">
                  Add your first service to start including services in quotes and projects.
                </p>
              </div>
            ) : (
              services.map((service) => (
                <Card key={service.id} className={!service.active ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Switch
                          checked={service.active}
                          onCheckedChange={() => handleToggleService(service.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-medium text-brand-primary truncate">
                              {service.name}
                            </h5>
                            {service.category && service.category !== 'other' && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {getCategoryLabel(service.category)}
                              </Badge>
                            )}
                            {service.is_schedulable && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                Schedulable
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="font-medium">
                              {currencySymbol}{Number(service.price).toFixed(2)} {getUnitLabel(service.unit).toLowerCase()}
                            </span>
                            {service.estimated_duration_minutes > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.estimated_duration_minutes}min
                              </span>
                            )}
                          </div>
                          {service.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
