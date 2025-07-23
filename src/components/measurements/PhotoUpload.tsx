
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export const PhotoUpload = ({
  photos,
  onPhotosChange,
  maxPhotos = 5
}: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    const remainingSlots = maxPhotos - photos.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Too many files",
        description: `You can only upload ${remainingSlots} more photo(s)`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const newPhotos: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          // Create a data URL for preview (in a real app, upload to storage)
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              newPhotos.push(e.target.result as string);
              if (newPhotos.length === files.length) {
                onPhotosChange([...photos, ...newPhotos]);
              }
            }
          };
          reader.readAsDataURL(file);
        }
      }
      
      toast({
        title: "Photos uploaded",
        description: `${files.length} photo(s) added successfully`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Photos ({photos.length}/{maxPhotos})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {photos.length < maxPhotos && (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                Click to upload photos or drag and drop
              </div>
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <Input
                  id="photo-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <Button variant="outline" size="sm" disabled={uploading}>
                  {uploading ? "Uploading..." : "Choose Files"}
                </Button>
              </Label>
            </div>
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
