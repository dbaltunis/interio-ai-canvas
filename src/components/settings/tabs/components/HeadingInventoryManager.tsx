import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Upload, X, Settings } from "lucide-react";
import { useEnhancedInventoryByCategory, useCreateEnhancedInventoryItem, useUpdateEnhancedInventoryItem, useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import type { EnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EyeletRingSelector, type EyeletRing } from "@/components/inventory/EyeletRingSelector";
import { useEyeletRings } from "@/hooks/useEyeletRings";

// Extended type to include image_url and advanced settings
interface HeadingItem extends EnhancedInventoryItem {
  image_url?: string;
  advanced_settings?: {
    heading_type?: 'standard' | 'wave' | 'eyelet';
    spacing?: number;
    eyelet_diameter?: number;
    eyelet_color?: string;
    multiple_fullness_ratios?: number[];
    use_multiple_ratios?: boolean;
  };
}

export const HeadingInventoryManager = () => {
  const { data: headingsData = [], isLoading } = useEnhancedInventoryByCategory('heading');
  const { data: allEyeletRings = [] } = useEyeletRings();
  const createItem = useCreateEnhancedInventoryItem();
  const updateItem = useUpdateEnhancedInventoryItem();
  const deleteItem = useDeleteEnhancedInventoryItem();
  const { toast } = useToast();
  
  // Cast to our extended type
  const headings = headingsData as HeadingItem[];
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingHeading, setEditingHeading] = useState<HeadingItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [eyeletRings, setEyeletRings] = useState<EyeletRing[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    fullness_ratio: 2.5,
    extra_fabric: 0,
    price_per_linear_unit: 0,
    image_url: '',
    treatment_type: 'curtain' as string,
    // Advanced settings
    heading_type: 'standard' as 'standard' | 'wave' | 'eyelet',
    spacing: 10,
    eyelet_diameter: 8,
    eyelet_color: 'antique-brass',
    use_multiple_ratios: false,
    multiple_fullness_ratios: [2.5] as number[],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      fullness_ratio: 2.5,
      extra_fabric: 0,
      price_per_linear_unit: 0,
      image_url: '',
      treatment_type: 'curtain',
      heading_type: 'standard',
      spacing: 10,
      eyelet_diameter: 8,
      eyelet_color: 'antique-brass',
      use_multiple_ratios: false,
      multiple_fullness_ratios: [2.5],
    });
    setEyeletRings([]);
    setShowAdvanced(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload images');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `heading-${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast({
        title: "Image uploaded successfully",
        description: "The heading image has been uploaded.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image_url: '' });
  };

  const addFullnessRatio = () => {
    const newRatio = 2.5;
    setFormData({
      ...formData,
      multiple_fullness_ratios: [...formData.multiple_fullness_ratios, newRatio]
    });
  };

  const updateFullnessRatio = (index: number, value: number) => {
    const updated = [...formData.multiple_fullness_ratios];
    updated[index] = value;
    setFormData({
      ...formData,
      multiple_fullness_ratios: updated
    });
  };

  const removeFullnessRatio = (index: number) => {
    if (formData.multiple_fullness_ratios.length > 1) {
      const updated = formData.multiple_fullness_ratios.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        multiple_fullness_ratios: updated
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a heading name.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to save headings.",
          variant: "destructive"
        });
        return;
      }

      // Prepare advanced settings
      const advancedSettings = {
        heading_type: formData.heading_type,
        spacing: formData.spacing,
        eyelet_diameter: formData.eyelet_diameter,
        eyelet_color: formData.eyelet_color,
        use_multiple_ratios: formData.use_multiple_ratios,
        multiple_fullness_ratios: formData.use_multiple_ratios ? formData.multiple_fullness_ratios : [formData.fullness_ratio]
      };

      const itemData = {
        user_id: user.id, // Explicitly set user_id for RLS
        name: formData.name.trim(),
        fullness_ratio: formData.use_multiple_ratios ? formData.multiple_fullness_ratios[0] : formData.fullness_ratio,
        labor_hours: formData.extra_fabric,
        price_per_meter: formData.price_per_linear_unit,
        image_url: formData.image_url,
        metadata: {
          ...advancedSettings,
          eyelet_rings: eyeletRings // Save full ring objects in metadata
        },
        eyelet_ring_ids: eyeletRings.map(r => r.id), // Save ring IDs for querying
        category: 'heading' as const,
        treatment_type: formData.treatment_type,
        quantity: 1,
        active: true
      } as any;

      if (editingHeading) {
        await updateItem.mutateAsync({ id: editingHeading.id, ...itemData });
        setEditingHeading(null);
        toast({
          title: "Heading updated",
          description: "The heading style has been updated.",
        });
      } else {
        await createItem.mutateAsync(itemData);
        setIsCreating(false);
        toast({
          title: "Heading created",
          description: "New heading style has been created.",
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving heading:', error);
      toast({
        title: "Save failed",
        description: "Failed to save heading. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (heading: HeadingItem) => {
    // Parse advanced settings from metadata field
    let advancedSettings = {
      heading_type: 'standard' as 'standard' | 'wave' | 'eyelet',
      spacing: 10,
      eyelet_diameter: 8,
      eyelet_color: 'antique-brass',
      use_multiple_ratios: false,
      multiple_fullness_ratios: [heading.fullness_ratio || 2.5]
    };

    // Try to parse from metadata field first, then fall back to description for legacy data
    try {
      if (heading.metadata && typeof heading.metadata === 'object' && Object.keys(heading.metadata).length > 0) {
        advancedSettings = { ...advancedSettings, ...(heading.metadata as any) };
        
        // Load eyelet rings if present in metadata
        if ((heading.metadata as any).eyelet_rings) {
          setEyeletRings((heading.metadata as any).eyelet_rings);
        } else if ((heading as any).eyelet_ring_ids && Array.isArray((heading as any).eyelet_ring_ids)) {
          // Convert IDs to full objects
          const ringObjects = allEyeletRings.filter(ring => 
            (heading as any).eyelet_ring_ids.includes(ring.id)
          );
          setEyeletRings(ringObjects);
        }
      } else if (heading.description && heading.description.startsWith('{')) {
        // Legacy: parse from description field
        const parsed = JSON.parse(heading.description);
        advancedSettings = { ...advancedSettings, ...parsed };
      }
    } catch (e) {
      console.error('Failed to parse advanced settings:', e);
    }

    try {
      if (heading.description) {
        const parsed = JSON.parse(heading.description);
        advancedSettings = { ...advancedSettings, ...parsed };
      }
    } catch (e) {
      console.log('Could not parse advanced settings, using defaults');
    }

    setFormData({
      name: heading.name,
      fullness_ratio: heading.fullness_ratio || 2.5,
      extra_fabric: heading.labor_hours || 0,
      price_per_linear_unit: heading.price_per_meter || 0,
      image_url: heading.image_url || '',
      treatment_type: heading.treatment_type || 'curtain',
      heading_type: advancedSettings.heading_type,
      spacing: advancedSettings.spacing,
      eyelet_diameter: advancedSettings.eyelet_diameter,
      eyelet_color: advancedSettings.eyelet_color,
      use_multiple_ratios: advancedSettings.use_multiple_ratios,
      multiple_fullness_ratios: advancedSettings.multiple_fullness_ratios
    });
    setEditingHeading(heading);
    setIsCreating(false);
    setShowAdvanced(advancedSettings.heading_type !== 'standard' || advancedSettings.use_multiple_ratios);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this heading?')) {
      try {
        await deleteItem.mutateAsync(id);
        toast({
          title: "Heading deleted",
          description: "The heading style has been removed.",
        });
      } catch (error) {
        console.error('Error deleting heading:', error);
        toast({
          title: "Delete failed",
          description: "Failed to delete heading. Please try again.",
          variant: "destructive"
        });
      }
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
          <CardTitle>Heading Library</CardTitle>
          <CardDescription>
            Create and manage heading styles for use in your curtain templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              Add heading styles with fullness ratios and optional pricing
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Heading Style
            </Button>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || editingHeading) && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold mb-4">
                {editingHeading ? 'Edit Heading Style' : 'Add New Heading Style'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Heading Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Pinch Pleat, Eyelet, Tab Top"
                  />
                </div>
                
                <div>
                  <Label htmlFor="treatment_type">Treatment Type</Label>
                  <Select 
                    value={formData.treatment_type} 
                    onValueChange={(value) => setFormData({ ...formData, treatment_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="curtain">Curtain</SelectItem>
                      <SelectItem value="sheer">Sheer</SelectItem>
                      <SelectItem value="drape">Drape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="heading_type">Heading Type</Label>
                  <Select 
                    value={formData.heading_type} 
                    onValueChange={(value: 'standard' | 'wave' | 'eyelet') => 
                      setFormData({ ...formData, heading_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="wave">Wave</SelectItem>
                      <SelectItem value="eyelet">Eyelet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fullness Ratio Section */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Switch
                      id="use_multiple_ratios"
                      checked={formData.use_multiple_ratios}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        use_multiple_ratios: checked,
                        multiple_fullness_ratios: checked ? formData.multiple_fullness_ratios : [formData.fullness_ratio]
                      })}
                    />
                    <Label htmlFor="use_multiple_ratios">Multiple Fullness Ratios</Label>
                  </div>

                  {formData.use_multiple_ratios ? (
                    <div className="space-y-2">
                      <Label>Fullness Ratio Options</Label>
                      {formData.multiple_fullness_ratios.map((ratio, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.1"
                            value={ratio}
                            onChange={(e) => updateFullnessRatio(index, parseFloat(e.target.value) || 0)}
                            placeholder="2.5"
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">x</span>
                          {formData.multiple_fullness_ratios.length > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={() => removeFullnessRatio(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addFullnessRatio}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Ratio
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="fullness_ratio">Fullness Ratio *</Label>
                      <Input
                        id="fullness_ratio"
                        type="number"
                        step="0.1"
                        value={formData.fullness_ratio}
                        onChange={(e) => setFormData({ ...formData, fullness_ratio: parseFloat(e.target.value) || 0 })}
                        placeholder="2.5"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="extra_fabric">Extra Fabric (Optional)</Label>
                  <Input
                    id="extra_fabric"
                    type="number"
                    step="0.1"
                    value={formData.extra_fabric}
                    onChange={(e) => setFormData({ ...formData, extra_fabric: parseFloat(e.target.value) || 0 })}
                    placeholder="0.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Additional fabric in metres/yards always added when this heading is used
                  </p>
                </div>

                <div>
                  <Label htmlFor="price_per_linear_unit">Price per Linear Metre/Yard (Optional)</Label>
                  <Input
                    id="price_per_linear_unit"
                    type="number"
                    step="0.01"
                    value={formData.price_per_linear_unit}
                    onChange={(e) => setFormData({ ...formData, price_per_linear_unit: parseFloat(e.target.value) || 0 })}
                    placeholder="15.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Additional cost per running linear unit
                  </p>
                </div>
              </div>

              {/* Advanced Settings Button */}
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="mb-4"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Settings
                </Button>

                {/* Advanced Settings for Wave/Eyelet */}
                {showAdvanced && (formData.heading_type === 'wave' || formData.heading_type === 'eyelet') && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
                    <div>
                      <Label htmlFor="spacing">Spacing (cm)</Label>
                      <Input
                        id="spacing"
                        type="number"
                        step="0.5"
                        value={formData.spacing}
                        onChange={(e) => setFormData({ ...formData, spacing: parseFloat(e.target.value) || 0 })}
                        placeholder="10"
                      />
                    </div>

                    {formData.heading_type === 'eyelet' && (
                      <>
                        {/* Eyelet Rings Section */}
                        <div className="col-span-2">
                          <Label>Eyelet Rings</Label>
                          <EyeletRingSelector
                            selectedRings={eyeletRings}
                            onRingsChange={setEyeletRings}
                            showLabel={false}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Select the eyelet ring options available for this heading
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="mt-4">
                <Label>Heading Image (Optional)</Label>
                <div className="mt-2">
                  {formData.image_url ? (
                    <div className="relative inline-block">
                      <img 
                        src={formData.image_url} 
                        alt="Heading preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          console.error('Image failed to load:', formData.image_url);
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjZjNmNGY2Ii8+CjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjZTVlN2ViIi8+Cjx0ZXh0IHg9IjY0IiB5PSI3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZTwvdGV4dD4KPC9zdmc+';
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label 
                        htmlFor="image-upload" 
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={handleSave} disabled={!formData.name.trim() || uploadingImage}>
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
              <p className="text-center text-muted-foreground py-8">
                No heading styles yet. Add your first heading style to get started.
              </p>
            ) : (
              headings.map((heading) => {
                // Parse advanced settings for display
                let advancedSettings: any = {};
                try {
                  if (heading.description) {
                    advancedSettings = JSON.parse(heading.description);
                  }
                } catch (e) {
                  // Ignore parse errors
                }

                return (
                  <div key={heading.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {/* Image */}
                    {heading.image_url && (
                      <img 
                        src={heading.image_url} 
                        alt={heading.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                        onError={(e) => {
                          console.error('Heading image failed to load:', heading.image_url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="font-medium">{heading.name}</h4>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        {advancedSettings.use_multiple_ratios ? (
                          <span>Ratios: {advancedSettings.multiple_fullness_ratios?.join(', ')}</span>
                        ) : (
                          <span>Fullness: {heading.fullness_ratio || 1.0}</span>
                        )}
                        {(heading.labor_hours || 0) > 0 && (
                          <span>Extra Fabric: {heading.labor_hours}m</span>
                        )}
                        {(heading.price_per_meter || 0) > 0 && (
                          <span>Price: ${heading.price_per_meter}/m</span>
                        )}
                        {advancedSettings.heading_type && advancedSettings.heading_type !== 'standard' && (
                          <span className="capitalize">{advancedSettings.heading_type}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
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
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};