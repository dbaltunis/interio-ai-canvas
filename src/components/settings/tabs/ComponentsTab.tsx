import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useHeadingOptions, useCreateHeadingOption, useUpdateHeadingOption, useDeleteHeadingOption } from "@/hooks/useHeadingOptions";
import { useHardwareOptions, useCreateHardwareOption, useUpdateHardwareOption, useDeleteHardwareOption, useLiningOptions, useCreateLiningOption, useUpdateLiningOption, useDeleteLiningOption } from "@/hooks/useComponentOptions";
import { useServiceOptions, useCreateServiceOption, useUpdateServiceOption, useDeleteServiceOption } from "@/hooks/useServiceOptions";
import { toast } from "sonner";

export const ComponentsTab = () => {
  const { getFabricUnitLabel } = useMeasurementUnits();
  const fabricUnit = getFabricUnitLabel();
  const { data: headings = [], isLoading: headingsLoading } = useHeadingOptions();
  const createHeading = useCreateHeadingOption();
  const updateHeading = useUpdateHeadingOption();
  const deleteHeading = useDeleteHeadingOption();
  
  const { data: hardware = [], isLoading: hardwareLoading } = useHardwareOptions();
  const createHardware = useCreateHardwareOption();
  const updateHardware = useUpdateHardwareOption();
  const deleteHardware = useDeleteHardwareOption();
  
  const { data: linings = [], isLoading: liningsLoading } = useLiningOptions();
  const createLining = useCreateLiningOption();
  const updateLining = useUpdateLiningOption();
  const deleteLining = useDeleteLiningOption();

  const { data: services = [], isLoading: servicesLoading } = useServiceOptions();
  const createService = useCreateServiceOption();
  const updateService = useUpdateServiceOption();
  const deleteService = useDeleteServiceOption();

  const [isAddingHeading, setIsAddingHeading] = useState(false);
  const [editingHeading, setEditingHeading] = useState(null);
  const [newHeading, setNewHeading] = useState({ 
    name: "", 
    fullness: 2.0, 
    price: 0, 
    type: "standard",
    extras: {
      eyeletRings: false,
      ringColors: [],
      ringDiameters: [],
      customOptions: []
    }
  });

  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: "",
    price: 0,
    unit: "per-window",
    description: ""
  });

  // Separate state for temporary input values
  const [tempInputs, setTempInputs] = useState({
    ringColorsInput: "",
    ringDiametersInput: "",
    waveOptionsInput: ""
  });

  const handleAddHeading = async () => {
    if (!newHeading.name.trim()) return;
    
    try {
      await createHeading.mutateAsync({
        name: newHeading.name,
        fullness: newHeading.fullness,
        price: newHeading.price,
        type: newHeading.type,
        extras: newHeading.extras,
        active: true
      });
      
      setNewHeading({ 
        name: "", 
        fullness: 2.0, 
        price: 0, 
        type: "standard",
        extras: {
          eyeletRings: false,
          ringColors: [],
          ringDiameters: [],
          customOptions: []
        }
      });
      setTempInputs({
        ringColorsInput: "",
        ringDiametersInput: "",
        waveOptionsInput: ""
      });
      setIsAddingHeading(false);
      toast.success("Heading option added successfully");
    } catch (error) {
      console.error('Error adding heading:', error);
      toast.error("Failed to add heading option");
    }
  };

  const handleEditHeading = (heading) => {
    setEditingHeading(heading.id);
    setNewHeading({ 
      name: heading.name, 
      fullness: heading.fullness, 
      price: heading.price,
      type: heading.type || "standard",
      extras: heading.extras || {
        eyeletRings: false,
        ringColors: [],
        ringDiameters: [],
        customOptions: []
      }
    });
    
    // Set temporary input values for editing
    setTempInputs({
      ringColorsInput: heading.extras?.ringColors?.join(", ") || "",
      ringDiametersInput: heading.extras?.ringDiameters?.join(", ") || "",
      waveOptionsInput: heading.extras?.customOptions?.join(", ") || ""
    });
    
    setIsAddingHeading(true);
  };

  const handleUpdateHeading = async () => {
    if (!editingHeading) return;
    
    try {
      await updateHeading.mutateAsync({
        id: editingHeading,
        name: newHeading.name,
        fullness: newHeading.fullness,
        price: newHeading.price,
        type: newHeading.type,
        extras: newHeading.extras
      });
      
      setEditingHeading(null);
      setNewHeading({ 
        name: "", 
        fullness: 2.0, 
        price: 0, 
        type: "standard",
        extras: {
          eyeletRings: false,
          ringColors: [],
          ringDiameters: [],
          customOptions: []
        }
      });
      setTempInputs({
        ringColorsInput: "",
        ringDiametersInput: "",
        waveOptionsInput: ""
      });
      setIsAddingHeading(false);
      toast.success("Heading option updated successfully");
    } catch (error) {
      console.error('Error updating heading:', error);
      toast.error("Failed to update heading option");
    }
  };

  const handleDeleteHeading = async (id: string) => {
    try {
      await deleteHeading.mutateAsync(id);
      toast.success("Heading option deleted successfully");
    } catch (error) {
      console.error('Error deleting heading:', error);
      toast.error("Failed to delete heading option");
    }
  };

  const handleToggleHeading = async (id: string) => {
    try {
      const heading = headings.find(h => h.id === id);
      if (heading) {
        await updateHeading.mutateAsync({
          id,
          active: !heading.active
        });
        toast.success(`Heading ${heading.active ? 'disabled' : 'enabled'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling heading:', error);
      toast.error("Failed to toggle heading option");
    }
  };

  const handleRingColorsChange = (value: string) => {
    setTempInputs(prev => ({ 
      ...prev, 
      ringColorsInput: value
    }));
  };

  const handleRingColorsBlur = (value: string) => {
    const colors = value.split(",").map(c => c.trim()).filter(c => c);
    setNewHeading(prev => ({ 
      ...prev, 
      extras: { 
        ...prev.extras, 
        ringColors: colors
      }
    }));
    setTempInputs(prev => ({ 
      ...prev, 
      ringColorsInput: colors.join(", ")
    }));
  };

  const handleRingDiametersChange = (value: string) => {
    setTempInputs(prev => ({ 
      ...prev, 
      ringDiametersInput: value
    }));
  };

  const handleRingDiametersBlur = (value: string) => {
    const diameters = value.split(",").map(d => d.trim()).filter(d => d);
    setNewHeading(prev => ({ 
      ...prev, 
      extras: { 
        ...prev.extras, 
        ringDiameters: diameters
      }
    }));
    setTempInputs(prev => ({ 
      ...prev, 
      ringDiametersInput: diameters.join(", ")
    }));
  };

  const handleWaveOptionsChange = (value: string) => {
    setTempInputs(prev => ({ 
      ...prev, 
      waveOptionsInput: value
    }));
  };

  const handleWaveOptionsBlur = (value: string) => {
    const options = value.split(",").map(o => o.trim()).filter(o => o);
    setNewHeading(prev => ({ 
      ...prev, 
      extras: { 
        ...prev.extras, 
        customOptions: options
      }
    }));
    setTempInputs(prev => ({ 
      ...prev, 
      waveOptionsInput: options.join(", ")
    }));
  };

  const handleAddService = async () => {
    if (!newService.name.trim()) return;
    
    try {
      await createService.mutateAsync({
        name: newService.name,
        price: newService.price,
        unit: newService.unit,
        description: newService.description,
        active: true
      });
      
      setNewService({
        name: "",
        price: 0,
        unit: "per-window",
        description: ""
      });
      setIsAddingService(false);
      toast.success("Service option added successfully");
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error("Failed to add service option");
    }
  };

  const handleEditService = (service) => {
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
      await updateService.mutateAsync({
        id: editingService,
        name: newService.name,
        price: newService.price,
        unit: newService.unit,
        description: newService.description
      });
      
      setEditingService(null);
      setNewService({
        name: "",
        price: 0,
        unit: "per-window",
        description: ""
      });
      setIsAddingService(false);
      toast.success("Service option updated successfully");
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error("Failed to update service option");
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Component Library</h3>
          <p className="text-sm text-brand-neutral">Manage reusable components for your products</p>
        </div>
      </div>

      <Tabs defaultValue="headings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="headings">Headings</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="linings">Linings</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="pricing-grids">Pricing Grids</TabsTrigger>
          <TabsTrigger value="trimmings">Trimmings</TabsTrigger>
        </TabsList>

        <TabsContent value="headings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Heading Options</h4>
              <Button 
                size="sm" 
                className="bg-brand-primary hover:bg-brand-accent"
                onClick={() => setIsAddingHeading(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Heading
              </Button>
            </div>

            <div className="grid gap-3">
              {headings.map((heading) => (
                <Card key={heading.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch 
                          checked={heading.active} 
                          onCheckedChange={() => handleToggleHeading(heading.id)}
                        />
                        <div>
                          <h5 className="font-medium text-brand-primary">{heading.name}</h5>
                          <p className="text-sm text-brand-neutral">
                            Fullness: {heading.fullness}x • Price: ${heading.price}/{fabricUnit} • Auto-calculated fabric usage
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Used for automatic fabric calculations in treatment pricing
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditHeading(heading)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteHeading(heading.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add/Edit Heading Form */}
            {isAddingHeading && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingHeading ? "Edit Heading" : "Add New Heading"}</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-4 gap-4">
                     <div>
                       <Label htmlFor="headingName">Heading Name</Label>
                       <Input
                         id="headingName"
                         value={newHeading.name}
                         onChange={(e) => setNewHeading(prev => ({ ...prev, name: e.target.value }))}
                         placeholder="e.g., Grommet"
                       />
                     </div>
                     <div>
                       <Label htmlFor="headingType">Heading Type</Label>
                       <Select 
                         value={newHeading.type} 
                         onValueChange={(value) => setNewHeading(prev => ({ ...prev, type: value }))}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select type" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="standard">Standard</SelectItem>
                           <SelectItem value="wave">Wave</SelectItem>
                           <SelectItem value="grommet">Grommet/Eyelet</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     <div>
                       <Label htmlFor="fullness">Fullness Multiplier</Label>
                       <Input
                         id="fullness"
                         type="number"
                         step="0.1"
                         value={newHeading.fullness}
                         onChange={(e) => setNewHeading(prev => ({ ...prev, fullness: parseFloat(e.target.value) || 0 }))}
                       />
                     </div>
                     <div>
                       <Label htmlFor="price">Price per {fabricUnit}</Label>
                       <Input
                         id="price"
                         type="number"
                         step="0.01"
                         value={newHeading.price}
                         onChange={(e) => setNewHeading(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                       />
                     </div>
                   </div>

                   {/* Conditional Extra Fields for Wave/Grommet/Eyelet */}
                   {(newHeading.type === "wave" || newHeading.type === "grommet") && (
                     <Card className="bg-muted/50">
                       <CardHeader>
                         <CardTitle className="text-sm">Additional Options for {newHeading.type === "wave" ? "Wave" : "Grommet/Eyelet"} Heading</CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                         {newHeading.type === "grommet" && (
                           <>
                             <div className="flex items-center space-x-2">
                               <Switch 
                                 checked={newHeading.extras.eyeletRings}
                                 onCheckedChange={(checked) => setNewHeading(prev => ({ 
                                   ...prev, 
                                   extras: { ...prev.extras, eyeletRings: checked }
                                 }))}
                               />
                               <Label>Include Eyelet Rings</Label>
                             </div>
                             
                             {newHeading.extras.eyeletRings && (
                               <div className="grid grid-cols-2 gap-4 ml-6">
                                 <div>
                                   <Label htmlFor="ringColors">Ring Colors (comma separated)</Label>
                                   <Input
                                     id="ringColors"
                                     placeholder="e.g., Silver, Bronze, Black"
                                     value={tempInputs.ringColorsInput}
                                     onChange={(e) => handleRingColorsChange(e.target.value)}
                                     onBlur={(e) => handleRingColorsBlur(e.target.value)}
                                   />
                                 </div>
                                 <div>
                                   <Label htmlFor="ringDiameters">Ring Diameters (comma separated)</Label>
                                   <Input
                                     id="ringDiameters"
                                     placeholder="e.g., 25mm, 35mm, 40mm"
                                     value={tempInputs.ringDiametersInput}
                                     onChange={(e) => handleRingDiametersChange(e.target.value)}
                                     onBlur={(e) => handleRingDiametersBlur(e.target.value)}
                                   />
                                 </div>
                               </div>
                             )}
                           </>
                         )}
                         
                         {newHeading.type === "wave" && (
                           <div>
                             <Label htmlFor="waveOptions">Wave System Options (comma separated)</Label>
                             <Input
                               id="waveOptions"
                               placeholder="e.g., Standard Wave, Silent Gliss, Ripplefold"
                               value={tempInputs.waveOptionsInput}
                               onChange={(e) => handleWaveOptionsChange(e.target.value)}
                               onBlur={(e) => handleWaveOptionsBlur(e.target.value)}
                             />
                           </div>
                         )}
                       </CardContent>
                     </Card>
                   )}
                  <div className="flex gap-2">
                    <Button 
                      onClick={editingHeading ? handleUpdateHeading : handleAddHeading}
                      className="bg-brand-primary hover:bg-brand-accent"
                    >
                      {editingHeading ? "Update" : "Add"} Heading
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingHeading(false);
                        setEditingHeading(null);
                        setNewHeading({ 
                          name: "", 
                          fullness: 2.0, 
                          price: 0, 
                          type: "standard",
                          extras: {
                            eyeletRings: false,
                            ringColors: [],
                            ringDiameters: [],
                            customOptions: []
                          }
                        });
                        setTempInputs({
                          ringColorsInput: "",
                          ringDiametersInput: "",
                          waveOptionsInput: ""
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="hardware">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Hardware Components</h4>
              <Button size="sm" className="bg-brand-primary hover:bg-brand-accent">
                <Plus className="h-4 w-4 mr-2" />
                Add Hardware
              </Button>
            </div>

            <div className="grid gap-3">
              {hardware.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch checked={item.active} />
                        <div>
                          <h5 className="font-medium text-brand-primary">{item.name}</h5>
                          <p className="text-sm text-brand-neutral">
                            ${item.price} per {fabricUnit}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="linings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Lining Options</h4>
              <Button size="sm" className="bg-brand-primary hover:bg-brand-accent">
                <Plus className="h-4 w-4 mr-2" />
                Add Lining
              </Button>
            </div>

            <div className="grid gap-3">
              {linings.map((lining) => (
                <Card key={lining.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch checked={lining.active} />
                        <div>
                          <h5 className="font-medium text-brand-primary">{lining.name}</h5>
                          <p className="text-sm text-brand-neutral">
                            ${lining.price} per {fabricUnit}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="services">
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

            {/* Add/Edit Service Form */}
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
                    >
                      {editingService ? "Update" : "Add"} Service
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingService(false);
                        setEditingService(null);
                        setNewService({
                          name: "",
                          price: 0,
                          unit: "per-window",
                          description: ""
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pricing-grids">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">CSV Pricing Grids</h4>
              <Button size="sm" className="bg-brand-primary hover:bg-brand-accent">
                <Plus className="h-4 w-4 mr-2" />
                Upload CSV Grid
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upload Pricing Grid</CardTitle>
                <CardDescription>
                  Upload CSV files with width/height pricing tables for blinds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gridName">Grid Name</Label>
                  <Input id="gridName" placeholder="e.g., Roman Blinds - Premium" />
                </div>
                <div>
                  <Label htmlFor="csvFile">CSV File</Label>
                  <Input id="csvFile" type="file" accept=".csv" />
                  <p className="text-xs text-brand-neutral mt-1">
                    Format: Width ranges in first row, Height ranges in first column, prices in cells
                  </p>
                </div>
                <Button className="bg-brand-primary hover:bg-brand-accent">
                  Upload & Process Grid
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center py-4">
                  <p className="text-brand-neutral">No pricing grids uploaded yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trimmings">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-brand-neutral">Trimmings management coming soon</p>
                <Button className="mt-4 bg-brand-primary hover:bg-brand-accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Trimming
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
