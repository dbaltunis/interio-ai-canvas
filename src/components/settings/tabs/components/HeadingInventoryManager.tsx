import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Upload, X } from "lucide-react";
import { useEnhancedInventoryByCategory, useCreateEnhancedInventoryItem, useUpdateEnhancedInventoryItem, useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import type { EnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const HeadingInventoryManager = () => {
  const { data: headings = [], isLoading } = useEnhancedInventoryByCategory('heading');
  const createItem = useCreateEnhancedInventoryItem();
  const updateItem = useUpdateEnhancedInventoryItem();
  const deleteItem = useDeleteEnhancedInventoryItem();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingHeading, setEditingHeading] = useState<EnhancedInventoryItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fullness_ratio: 2.5,
    extra_fabric: 0, // Optional extra fabric in metres/yards
    price_per_linear_unit: 0, // Optional price per running linear metre/yard
    image_url: '' // For uploaded image
  });

  const resetForm = () => {
    setFormData({
      name: '',
      fullness_ratio: 2.5,
      extra_fabric: 0,
      price_per_linear_unit: 0,
      image_url: ''
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `heading-${Date.now()}.${fileExt}`;
      
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

  const handleSave = async () => {
    try {
      const itemData = {
        name: formData.name,
        fullness_ratio: formData.fullness_ratio,
        // Store extra fabric and price in the relevant fields
        labor_hours: formData.extra_fabric, // Using labor_hours field for extra fabric
        price_per_meter: formData.price_per_linear_unit, // Using price_per_meter for linear pricing
        image_url: formData.image_url,
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
      fullness_ratio: heading.fullness_ratio || 2.5,
      extra_fabric: heading.labor_hours || 0, // Using labor_hours for extra fabric
      price_per_linear_unit: heading.price_per_meter || 0, // Using price_per_meter for linear pricing
      image_url: heading.image_url || ''
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
                <Button onClick={handleSave} disabled={!formData.name || uploadingImage}>
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
              headings.map((heading) => (
                <div key={heading.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  {/* Image */}
                  {heading.image_url && (
                    <img 
                      src={heading.image_url} 
                      alt={heading.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  )}
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="font-medium">{heading.name}</h4>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Fullness: {heading.fullness_ratio}</span>
                      {(heading.labor_hours || 0) > 0 && (
                        <span>Extra Fabric: {heading.labor_hours}m</span>
                      )}
                      {(heading.price_per_meter || 0) > 0 && (
                        <span>Price: ${heading.price_per_meter}/m</span>
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};