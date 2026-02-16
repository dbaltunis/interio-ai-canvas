import { useState, useRef } from "react";
import { Camera, X, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TreatmentPhotoUploaderProps {
  treatmentId?: string;
  surfaceId: string;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export const TreatmentPhotoUploader = ({
  treatmentId,
  surfaceId,
  photos = [],
  onPhotosChange,
  maxPhotos = 3,
  disabled = false,
}: TreatmentPhotoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadPhoto = async (file: File) => {
    try {
      setIsUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${surfaceId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("treatment-photos")
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("treatment-photos")
        .getPublicUrl(fileName);

      const newPhotos = [...photos, urlData.publicUrl];
      onPhotosChange(newPhotos);

      toast({ title: "Photo added", description: "Treatment photo uploaded successfully" });
    } catch (error: any) {
      console.error("Photo upload failed:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= maxPhotos) {
      toast({ title: "Limit reached", description: `Maximum ${maxPhotos} photos allowed`, variant: "destructive" });
      return;
    }
    uploadPhoto(file);
    e.target.value = "";
  };

  const handleRemovePhoto = async (index: number) => {
    const photoUrl = photos[index];
    // Extract path from URL for deletion
    try {
      const urlObj = new URL(photoUrl);
      const pathParts = urlObj.pathname.split("/treatment-photos/");
      if (pathParts[1]) {
        await supabase.storage.from("treatment-photos").remove([decodeURIComponent(pathParts[1])]);
      }
    } catch {
      // If URL parsing fails, still remove from array
    }
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="relative flex items-center justify-center h-6 w-6 rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Add treatment photo"
        >
          <Camera className="h-3.5 w-3.5 text-muted-foreground" />
          {photos.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
              {photos.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-3 z-[9999]"
        align="start"
        side="bottom"
        sideOffset={4}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div
          className="space-y-3"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Treatment Photos ({photos.length}/{maxPhotos})
            </label>
          </div>

          {/* Photo grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-border group">
                  <img src={url} alt={`Treatment photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload buttons */}
          {photos.length < maxPhotos && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                disabled={isUploading}
                onClick={() => cameraInputRef.current?.click()}
              >
                {isUploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Camera className="h-3 w-3 mr-1" />}
                Take Photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <ImagePlus className="h-3 w-3 mr-1" />}
                Browse
              </Button>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            Photos are used for work orders and optionally for quotes.
          </p>

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
