
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { type OptionSubSubcategory } from "@/hooks/types/windowCoveringTypes";

interface SubSubcategoryFormProps {
  subcategoryId: string;
  subSubcategory?: OptionSubSubcategory;
  onSave: (subSubcategory: any) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const SubSubcategoryForm = ({ 
  subcategoryId, 
  subSubcategory, 
  onSave, 
  onCancel, 
  isEditing 
}: SubSubcategoryFormProps) => {
  const [formData, setFormData] = useState({
    subcategory_id: subcategoryId,
    name: subSubcategory?.name || '',
    description: subSubcategory?.description || '',
    pricing_method: subSubcategory?.pricing_method || 'per-meter',
    base_price: subSubcategory?.base_price || 0,
    fullness_ratio: subSubcategory?.fullness_ratio || null,
    extra_fabric_percentage: subSubcategory?.extra_fabric_percentage || null,
    sort_order: subSubcategory?.sort_order || 0,
    image_url: subSubcategory?.image_url || ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(subSubcategory?.image_url || '');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = formData.image_url;
    if (imageFile) {
      imageUrl = imagePreview;
    }
    
    const subSubcategoryData = {
      ...formData,
      image_url: imageUrl,
      base_price: parseFloat(formData.base_price.toString()) || 0,
      fullness_ratio: formData.fullness_ratio ? parseFloat(formData.fullness_ratio.toString()) : null,
      extra_fabric_percentage: formData.extra_fabric_percentage ? parseFloat(formData.extra_fabric_percentage.toString()) : null
    };
    
    try {
      await onSave(subSubcategoryData);
    } catch (error) {
      console.error('Error saving sub-subcategory:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Sub-Subcategory Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Somfy, China"
            required
          />
        </div>
        <div>
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pricing_method">Pricing Method</Label>
          <Select 
            value={formData.pricing_method} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, pricing_method: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="per-unit">Per Unit</SelectItem>
              <SelectItem value="per-meter">Per Meter</SelectItem>
              <SelectItem value="per-sqm">Per Square Meter</SelectItem>
              <SelectItem value="fixed">Fixed Price</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="base_price">Base Price</Label>
          <Input
            id="base_price"
            type="number"
            step="0.01"
            value={formData.base_price}
            onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>
      </div>

      {/* Image Upload Section */}
      <div>
        <Label>Image</Label>
        <div className="mt-2">
          {imagePreview ? (
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center w-24 h-24 flex flex-col items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="sub-subcategory-image-upload"
              />
              <label htmlFor="sub-subcategory-image-upload" className="cursor-pointer">
                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                <p className="text-xs text-gray-600">Upload</p>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-brand-primary hover:bg-brand-accent">
          {isEditing ? 'Update Sub-Subcategory' : 'Create Sub-Subcategory'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
