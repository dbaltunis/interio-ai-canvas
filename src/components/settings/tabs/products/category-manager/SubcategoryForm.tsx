
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
    pricing_method: subcategory?.pricing_method || 'per-unit' as const,
    base_price: subcategory?.base_price || 0,
    fullness_ratio: subcategory?.fullness_ratio || 1.0,
    extra_fabric_percentage: subcategory?.extra_fabric_percentage || 0,
    sort_order: subcategory?.sort_order || 0,
    image_url: subcategory?.image_url || '',
    calculation_method: subcategory?.calculation_method || 'inherit'
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
            placeholder="e.g., Standard, Premium"
            required
          />
        </div>
        <div>
          <Label htmlFor="base_price">Base Price</Label>
          <Input
            id="base_price"
            type="number"
            step="0.01"
            value={formData.base_price}
            onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pricing_method">Pricing Method</Label>
          <Select value={formData.pricing_method} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, pricing_method: value as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage' }))
          }>
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
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="calculation_method">Calculation Method</Label>
          <Select value={formData.calculation_method} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, calculation_method: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">Inherit from Window Covering</SelectItem>
              <SelectItem value="per-unit">Per Unit (uses quantity)</SelectItem>
              <SelectItem value="per-linear-meter">Per Linear Meter (uses rail width)</SelectItem>
              <SelectItem value="per-linear-yard">Per Linear Yard (uses rail width)</SelectItem>
              <SelectItem value="per-sqm">Per Square Meter</SelectItem>
              <SelectItem value="fixed">Fixed Price</SelectItem>
              <SelectItem value="percentage">Percentage of fabric cost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="fullness_ratio">Fullness Ratio</Label>
          <Input
            id="fullness_ratio"
            type="number"
            step="0.1"
            min="1.0"
            max="5.0"
            value={formData.fullness_ratio}
            onChange={(e) => setFormData(prev => ({ ...prev, fullness_ratio: parseFloat(e.target.value) || 1.0 }))}
            placeholder="e.g., 2.5"
          />
          <p className="text-xs text-gray-600 mt-1">
            Fabric fullness multiplier (e.g., 2.5 for pleated headings)
          </p>
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
                id="subcategory-image-upload"
              />
              <label htmlFor="subcategory-image-upload" className="cursor-pointer">
                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                <p className="text-xs text-gray-600">Upload</p>
              </label>
            </div>
          )}
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
