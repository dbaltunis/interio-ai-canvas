import { useState, useRef, useEffect } from "react";
import { Camera, X, ImagePlus, Loader2, Star, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TreatmentPhotoUploaderProps {
  treatmentId?: string;
  surfaceId: string;
  photos: string[];
  primaryPhotoIndex: number | null;
  onSavePhotos: (photos: string[], primaryIndex: number | null) => Promise<void>;
  maxPhotos?: number;
  disabled?: boolean;
}

export const TreatmentPhotoUploader = ({
  treatmentId,
  surfaceId,
  photos = [],
  primaryPhotoIndex = null,
  onSavePhotos,
  maxPhotos = 3,
  disabled = false,
}: TreatmentPhotoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [localPhotos, setLocalPhotos] = useState<string[]>(photos);
  const [localPrimaryIndex, setLocalPrimaryIndex] = useState<number | null>(primaryPhotoIndex);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sync local state when popover opens
  useEffect(() => {
    if (isOpen) {
      setLocalPhotos(photos);
      setLocalPrimaryIndex(primaryPhotoIndex);
    }
  }, [isOpen, photos, primaryPhotoIndex]);

  const hasChanges = JSON.stringify(localPhotos) !== JSON.stringify(photos) || localPrimaryIndex !== primaryPhotoIndex;

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

      setLocalPhotos(prev => [...prev, urlData.publicUrl]);
      toast({ title: "Photo added", description: "Click Save to persist changes" });
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
    if (localPhotos.length >= maxPhotos) {
      toast({ title: "Limit reached", description: `Maximum ${maxPhotos} photos allowed`, variant: "destructive" });
      return;
    }
    uploadPhoto(file);
    e.target.value = "";
  };

  const handleRemovePhoto = async (index: number) => {
    const photoUrl = localPhotos[index];
    try {
      const urlObj = new URL(photoUrl);
      const pathParts = urlObj.pathname.split("/treatment-photos/");
      if (pathParts[1]) {
        await supabase.storage.from("treatment-photos").remove([decodeURIComponent(pathParts[1])]);
      }
    } catch {
      // If URL parsing fails, still remove from array
    }
    const newPhotos = localPhotos.filter((_, i) => i !== index);
    setLocalPhotos(newPhotos);
    // Adjust primary index
    if (localPrimaryIndex === index) {
      setLocalPrimaryIndex(null);
    } else if (localPrimaryIndex !== null && localPrimaryIndex > index) {
      setLocalPrimaryIndex(localPrimaryIndex - 1);
    }
  };

  const handleSetPrimary = (index: number) => {
    setLocalPrimaryIndex(localPrimaryIndex === index ? null : index);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSavePhotos(localPhotos, localPrimaryIndex);
      toast({ title: "Photos saved", description: "Treatment photos updated successfully" });
      setIsOpen(false);
    } catch (error: any) {
      toast({ title: "Save failed", description: error.message || "Could not save photos", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
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
              Treatment Photos ({localPhotos.length}/{maxPhotos})
            </label>
          </div>

          {/* Photo grid */}
          {localPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {localPhotos.map((url, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative aspect-square rounded-md overflow-hidden border-2 group cursor-pointer transition-colors",
                    localPrimaryIndex === i
                      ? "border-primary ring-1 ring-primary/30"
                      : "border-border hover:border-muted-foreground/40"
                  )}
                  onClick={() => handleSetPrimary(i)}
                >
                  <img src={url} alt={`Treatment photo ${i + 1}`} className="w-full h-full object-cover" />
                  {/* Star overlay */}
                  <div
                    className={cn(
                      "absolute top-0.5 left-0.5 rounded-full h-5 w-5 flex items-center justify-center transition-opacity",
                      localPrimaryIndex === i
                        ? "bg-primary text-primary-foreground opacity-100"
                        : "bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <Star className={cn("h-3 w-3", localPrimaryIndex === i && "fill-current")} />
                  </div>
                  {/* Primary label */}
                  {localPrimaryIndex === i && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[9px] text-center py-0.5 font-medium">
                      Main
                    </div>
                  )}
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemovePhoto(i); }}
                    className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload buttons */}
          {localPhotos.length < maxPhotos && (
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
            Click the ★ to set the main image for quotes. Photos are used for work orders.
          </p>

          {/* Save button */}
          {localPhotos.length > 0 && (
            <Button
              size="sm"
              className="w-full text-xs"
              disabled={isSaving || !hasChanges}
              onClick={handleSave}
            >
              {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
              {hasChanges ? "Save Photos" : "Saved"}
            </Button>
          )}

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
