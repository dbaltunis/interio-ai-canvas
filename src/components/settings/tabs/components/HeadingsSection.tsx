import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useHeadingOptions, useCreateHeadingOption, useUpdateHeadingOption, useDeleteHeadingOption } from "@/hooks/useHeadingOptions";

export const HeadingsSection = () => {
  const { getFabricUnitLabel } = useMeasurementUnits();
  const fabricUnit = getFabricUnitLabel();
  const { data: headings = [], isLoading: headingsLoading } = useHeadingOptions();
  const createHeading = useCreateHeadingOption();
  const updateHeading = useUpdateHeadingOption();
  const deleteHeading = useDeleteHeadingOption();

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
      
      resetHeadingForm();
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
      
      resetHeadingForm();
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

  const resetHeadingForm = () => {
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
  };

  const handleRingColorsChange = (value: string) => {
    setTempInputs(prev => ({ ...prev, ringColorsInput: value }));
  };

  const handleRingColorsBlur = (value: string) => {
    const colors = value.split(",").map(c => c.trim()).filter(c => c);
    setNewHeading(prev => ({ 
      ...prev, 
      extras: { ...prev.extras, ringColors: colors }
    }));
    setTempInputs(prev => ({ 
      ...prev, 
      ringColorsInput: colors.join(", ")
    }));
  };

  const handleRingDiametersChange = (value: string) => {
    setTempInputs(prev => ({ ...prev, ringDiametersInput: value }));
  };

  const handleRingDiametersBlur = (value: string) => {
    const diameters = value.split(",").map(d => d.trim()).filter(d => d);
    setNewHeading(prev => ({ 
      ...prev, 
      extras: { ...prev.extras, ringDiameters: diameters }
    }));
    setTempInputs(prev => ({ 
      ...prev, 
      ringDiametersInput: diameters.join(", ")
    }));
  };

  const handleWaveOptionsChange = (value: string) => {
    setTempInputs(prev => ({ ...prev, waveOptionsInput: value }));
  };

  const handleWaveOptionsBlur = (value: string) => {
    const options = value.split(",").map(o => o.trim()).filter(o => o);
    setNewHeading(prev => ({ 
      ...prev, 
      extras: { ...prev.extras, customOptions: options }
    }));
    setTempInputs(prev => ({ 
      ...prev, 
      waveOptionsInput: options.join(", ")
    }));
  };

  return (
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
                onClick={resetHeadingForm}
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
