import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useStoreProductCatalog } from "@/hooks/useStoreProductCatalog";
import { useToast } from "@/hooks/use-toast";

interface ProductImageManagerProps {
  productId: string;
  images: string[];
}

export const ProductImageManager = ({ productId, images }: ProductImageManagerProps) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>(images);
  const { updateImages } = useStoreProductCatalog();
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert files to base64 URLs for preview (in production, upload to Supabase storage)
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newImages = [...uploadedImages, reader.result as string];
        setUploadedImages(newImages);
        await updateImages.mutateAsync({ id: productId, images: newImages });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = async (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    await updateImages.mutateAsync({ id: productId, images: newImages });
  };

  return (
    <div>
      <label className="text-sm text-muted-foreground mb-2 block">Product Images</label>
      <div className="flex flex-wrap gap-2">
        {uploadedImages.map((img, index) => (
          <div key={index} className="relative group">
            <img
              src={img}
              alt={`Product ${index + 1}`}
              className="w-20 h-20 object-cover rounded border"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <label className="w-20 h-20 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
          <Upload className="h-6 w-6 text-muted-foreground" />
        </label>
      </div>
    </div>
  );
};
