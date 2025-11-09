import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRef } from "react";
import { toast } from "sonner";

interface ImageUploadToolProps {
  onImageUpload: (imageUrl: string) => void;
}

export const ImageUploadTool = ({ onImageUpload }: ImageUploadToolProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      // Convert to data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onImageUpload(imageUrl);
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Upload Image
      </Label>
      
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground mb-3">
          Upload logos, signatures, or other images to your template
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Button
          variant="outline"
          size="sm"
          className="w-full hover:bg-primary/10 hover:border-primary/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose Image
        </Button>
        
        <p className="text-xs text-muted-foreground mt-2">
          Supported: JPG, PNG, GIF (max 5MB)
        </p>
      </div>
    </div>
  );
};
