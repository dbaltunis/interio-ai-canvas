
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { type OptionSubcategory } from "@/hooks/useWindowCoveringCategories";

interface SubcategoryFormProps {
  subcategory?: OptionSubcategory;
  categoryId: string;
  onSave: (subcategory: any) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const SubcategoryForm = ({ subcategory, categoryId, onSave, onCancel, isEditing }: SubcategoryFormProps) => {
  const [formData, setFormData] = useState({
    category_id: categoryId,
    name: subcategory?.name || '',
    description: subcategory?.description || '',
    pricing_method: subcategory?.pricing_method || 'per-unit' as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage',
    base_price: subcategory?.base_price || 0,
    fullness_ratio: subcategory?.fullness_ratio || null,
    extra_fabric_percentage: subcategory?.extra_fabric_percentage || null,
    sort_order: subcategory?.sort_order || 0,
    image_url: subcategory?.image_url || ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(subcategory?.image_url || '');

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
    
    // For now, we'll use the preview URL. In a real app, you'd upload to storage
    if (imageFile) {
      // TODO: Implement actual file upload to Supabase storage
      imageUrl = imagePreview;
    }
    
    await onSave({
      ...formData,
      image_url: imageUrl
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Subcategory Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Pencil Pleat, Blackout"
            required
          />
        </div>
        <div>
          <Label htmlFor="pricing_method">Pricing Method</Label>
          <Select 
            value={formData.pricing_method} 
            onValueChange={(value: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage') => 
              setFormData(prev => ({ ...prev, pricing_method: value }))
            }
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

      {/* Image Upload Section */}
      <div>
        <Label>Subcategory Image</Label>
        <div className="mt-2">
          {imagePreview ? (
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Subcategory preview"
                className="w-24 h-24 object-cover rounded border"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-2 w-2" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center w-24 h-24 flex flex-col items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id={`subcategory-image-upload-${subcategory?.id || 'new'}`}
              />
              <label htmlFor={`subcategory-image-upload-${subcategory?.id || 'new'}`} className="cursor-pointer">
                <Upload className="h-4 w-4 text-gray-400 mb-1" />
                <p className="text-xs text-gray-600">Upload</p>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="base_price">Base Price (£)</Label>
          <Input
            id="base_price"
            type="number"
            step="0.01"
            value={formData.base_price}
            onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="fullness_ratio">Fullness Ratio</Label>
          <Input
            id="fullness_ratio"
            type="number"
            step="0.1"
            value={formData.fullness_ratio || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, fullness_ratio: e.target.value ? parseFloat(e.target.value) : null }))}
            placeholder="Optional"
          />
        </div>
        <div>
          <Label htmlFor="extra_fabric_percentage">Extra Fabric %</Label>
          <Input
            id="extra_fabric_percentage"
            type="number"
            step="0.1"
            value={formData.extra_fabric_percentage || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, extra_fabric_percentage: e.target.value ? parseFloat(e.target.value) : null }))}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-brand-primary hover:bg-brand-accent">
          {isEditing ? 'Update Subcategory' : 'Create Subcategory'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
