import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Upload, X } from "lucide-react";
import { useEnhancedInventoryByCategory, useCreateEnhancedInventoryItem, useUpdateEnhancedInventoryItem, useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import type { EnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TopSystemItem extends EnhancedInventoryItem {
  image_url?: string;
  system_settings?: {
    tube_size?: number;
    mount_type?: string;
    fascia_type?: string;
    bottom_rail_style?: string;
  };
}

export const TopSystemsManager = () => {
  const { data: systemsData = [], isLoading } = useEnhancedInventoryByCategory('top_system');
  const createItem = useCreateEnhancedInventoryItem();
  const updateItem = useUpdateEnhancedInventoryItem();
  const deleteItem = useDeleteEnhancedInventoryItem();
  const { toast } = useToast();
  
  const systems = systemsData as TopSystemItem[];
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingSystem, setEditingSystem] = useState<TopSystemItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tube_size: 38,
    mount_type: 'face',
    fascia_type: 'none',
    bottom_rail_style: 'standard',
    price: 0,
    image_url: '',
    treatment_type: 'roller_blind' as string,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      tube_size: 38,
      mount_type: 'face',
      fascia_type: 'none',
      bottom_rail_style: 'standard',
      price: 0,
      image_url: '',
      treatment_type: 'roller_blind',
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload images');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `top-system-${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast({
        title: "Image uploaded successfully",
        description: "The top system image has been uploaded.",
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

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a top system name.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to save top systems.",
          variant: "destructive"
        });
        return;
      }

      const systemSettings = {
        tube_size: formData.tube_size,
        mount_type: formData.mount_type,
        fascia_type: formData.fascia_type,
        bottom_rail_style: formData.bottom_rail_style,
      };

      const itemData = {
        user_id: user.id,
        name: formData.name.trim(),
        price_per_meter: formData.price,
        image_url: formData.image_url,
        description: JSON.stringify(systemSettings),
        category: 'top_system' as const,
        treatment_type: formData.treatment_type,
        quantity: 1,
        active: true,
        fullness_ratio: 1,
        labor_hours: 0,
      };

      if (editingSystem) {
        await updateItem.mutateAsync({ id: editingSystem.id, ...itemData });
        setEditingSystem(null);
        toast({
          title: "Top system updated",
          description: "The top system has been updated.",
        });
      } else {
        await createItem.mutateAsync(itemData);
        setIsCreating(false);
        toast({
          title: "Top system created",
          description: "New top system has been created.",
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving top system:', error);
      toast({
        title: "Save failed",
        description: "Failed to save top system. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (system: TopSystemItem) => {
    let systemSettings = {
      tube_size: 38,
      mount_type: 'face',
      fascia_type: 'none',
      bottom_rail_style: 'standard',
    };

    try {
      if (system.description) {
        const parsed = JSON.parse(system.description);
        systemSettings = { ...systemSettings, ...parsed };
      }
    } catch (e) {
      console.log('Could not parse system settings, using defaults');
    }

    setFormData({
      name: system.name,
      tube_size: systemSettings.tube_size,
      mount_type: systemSettings.mount_type,
      fascia_type: systemSettings.fascia_type,
      bottom_rail_style: systemSettings.bottom_rail_style,
      price: system.price_per_meter || 0,
      image_url: system.image_url || '',
      treatment_type: system.treatment_type || 'roller_blind',
    });
    setEditingSystem(system);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this top system?')) {
      try {
        await deleteItem.mutateAsync(id);
        toast({
          title: "Top system deleted",
          description: "The top system has been removed.",
        });
      } catch (error) {
        console.error('Error deleting top system:', error);
        toast({
          title: "Delete failed",
          description: "Failed to delete top system. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingSystem(null);
    resetForm();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading top systems...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Systems Library</CardTitle>
          <CardDescription>
            Create and manage top systems (tubes, cassettes, headrails) for use in your blind templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              Add top system configurations for roller blinds, Roman blinds, and other blind types
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Top System
            </Button>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || editingSystem) && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold mb-4">
                {editingSystem ? 'Edit Top System' : 'Add New Top System'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">System Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., 38mm Standard Tube, Cassette System"
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
                      <SelectItem value="roller_blind">Roller Blind</SelectItem>
                      <SelectItem value="roman_blind">Roman Blind</SelectItem>
                      <SelectItem value="venetian_blind">Venetian Blind</SelectItem>
                      <SelectItem value="vertical_blind">Vertical Blind</SelectItem>
                      <SelectItem value="honeycomb_blind">Honeycomb Blind</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tube_size">Tube Size (mm)</Label>
                  <Input
                    id="tube_size"
                    type="number"
                    value={formData.tube_size}
                    onChange={(e) => setFormData({ ...formData, tube_size: parseInt(e.target.value) || 38 })}
                    placeholder="38"
                  />
                </div>

                <div>
                  <Label htmlFor="mount_type">Mount Type</Label>
                  <Select 
                    value={formData.mount_type} 
                    onValueChange={(value) => setFormData({ ...formData, mount_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="face">Face Mount</SelectItem>
                      <SelectItem value="recess">Recess Mount</SelectItem>
                      <SelectItem value="ceiling">Ceiling Mount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fascia_type">Fascia/Cassette Type</Label>
                  <Select 
                    value={formData.fascia_type} 
                    onValueChange={(value) => setFormData({ ...formData, fascia_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fascia">Fascia</SelectItem>
                      <SelectItem value="cassette">Cassette</SelectItem>
                      <SelectItem value="enclosed">Enclosed Cassette</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bottom_rail_style">Bottom Rail Style</Label>
                  <Select 
                    value={formData.bottom_rail_style} 
                    onValueChange={(value) => setFormData({ ...formData, bottom_rail_style: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="weighted">Weighted</SelectItem>
                      <SelectItem value="slimline">Slimline</SelectItem>
                      <SelectItem value="decorative">Decorative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="price">Price (Optional)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Additional cost for this top system configuration
                  </p>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="image">System Image (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="flex-1"
                    />
                    {formData.image_url && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.image_url} 
                        alt="System preview" 
                        className="max-w-xs h-auto rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={handleSave}>
                  {editingSystem ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Systems List */}
          <div className="space-y-2">
            {systems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No top systems yet. Click "Add Top System" to create one.
              </p>
            ) : (
              systems.map((system) => (
                <div
                  key={system.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    {system.image_url && (
                      <img 
                        src={system.image_url} 
                        alt={system.name} 
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{system.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {system.treatment_type ? system.treatment_type.replace('_', ' ') : 'General'} • 
                        {system.price_per_meter ? ` $${system.price_per_meter.toFixed(2)}` : ' Free'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(system)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(system.id)}
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
