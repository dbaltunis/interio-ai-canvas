
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X } from "lucide-react";
import { type OptionExtra } from "@/hooks/types/windowCoveringTypes";

interface ExtraFormProps {
  subSubcategoryId: string;
  extra?: OptionExtra;
  onSave: (extra: any) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ExtraForm = ({ 
  subSubcategoryId, 
  extra, 
  onSave, 
  onCancel, 
  isEditing 
}: ExtraFormProps) => {
  const [formData, setFormData] = useState({
    sub_subcategory_id: subSubcategoryId,
    name: extra?.name || '',
    description: extra?.description || '',
    pricing_method: extra?.pricing_method || 'per-item',
    base_price: extra?.base_price || 0,
    sort_order: extra?.sort_order || 0,
    image_url: extra?.image_url || '',
    is_required: extra?.is_required || false,
    is_default: extra?.is_default || false
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(extra?.image_url || '');

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
    
    const extraData = {
      ...formData,
      image_url: imageUrl,
      base_price: parseFloat(formData.base_price.toString()) || 0
    };
    
    try {
      await onSave(extraData);
    } catch (error) {
      console.error('Error saving extra:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Extra Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Remote Option 1"
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
              <SelectItem value="per-item">Per Item</SelectItem>
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

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_required"
            checked={formData.is_required}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: !!checked }))}
          />
          <Label htmlFor="is_required">Required</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_default"
            checked={formData.is_default}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: !!checked }))}
          />
          <Label htmlFor="is_default">Default Selected</Label>
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
                id="extra-image-upload"
              />
              <label htmlFor="extra-image-upload" className="cursor-pointer">
                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                <p className="text-xs text-gray-600">Upload</p>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-brand-primary hover:bg-brand-accent">
          {isEditing ? 'Update Extra' : 'Create Extra'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
