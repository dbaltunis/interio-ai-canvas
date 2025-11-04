import { useState } from "react";
import { EnhancedImageUpload } from "./EnhancedImageUpload";
import { ImagePreviewGrid } from "./ImagePreviewGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ProductFormData {
  name: string;
  description: string;
  images: Array<{
    id: string;
    url: string;
    name: string;
    size: number;
  }>;
}

/**
 * Example: Product form with enhanced image upload
 * Shows how to integrate image upload into real-world forms
 */
export const ProductImageUpload = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    images: []
  });

  const handleUploadComplete = (urls: string[]) => {
    const newImages = urls.map((url, index) => ({
      id: `${Date.now()}-${index}`,
      url,
      name: `product-image-${formData.images.length + index + 1}.jpg`,
      size: 0
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));

    toast.success(`${urls.length} image(s) added`);
  };

  const handleRemoveImage = (id: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
    toast.success('Image removed');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Product name is required');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Please add at least one product image');
      return;
    }

    console.log('Submitting product:', formData);
    toast.success('Product created successfully!');
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      images: []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Basic details about your product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your product..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <EnhancedImageUpload
        projectId="products"
        onUploadComplete={handleUploadComplete}
        maxFiles={8}
        maxSizeMB={10}
        showPreview={true}
      />

      {/* Uploaded Images Preview */}
      {formData.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Images ({formData.images.length})</CardTitle>
            <CardDescription>
              These images will be displayed on the product page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImagePreviewGrid
              images={formData.images}
              onRemove={handleRemoveImage}
              columns={4}
            />
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFormData({ name: '', description: '', images: [] })}
        >
          Cancel
        </Button>
        <Button type="submit">
          Create Product
        </Button>
      </div>
    </form>
  );
};
