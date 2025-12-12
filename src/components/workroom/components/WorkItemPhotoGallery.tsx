import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Trash2, Plus, Loader2 } from "lucide-react";
import { compressImage, needsCompression, formatFileSize } from "@/utils/imageUtils";
import { toast } from "sonner";

interface WorkItemPhotoGalleryProps {
  itemId: string;
}

export const WorkItemPhotoGallery: React.FC<WorkItemPhotoGalleryProps> = ({ itemId }) => {
  const [images, setImages] = React.useState<string[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const storageKey = React.useMemo(() => `workshop:photos:${itemId}`, [itemId]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      if (Array.isArray(arr)) setImages(arr);
    } catch {
      // ignore parse errors
    }
  }, [storageKey]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(images));
    } catch (e) {
      // localStorage quota exceeded
      console.warn('localStorage quota exceeded, some images may not be saved locally');
    }
  }, [images, storageKey]);

  const onPick = () => inputRef.current?.click();

  const processFile = async (file: File): Promise<string | null> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return null;
    }
    
    // Check if file is too large (>10MB is unreasonable)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Image "${file.name}" is too large (${formatFileSize(file.size)}). Maximum size is 10MB.`);
      return null;
    }
    
    let fileToProcess = file;
    
    // Compress if larger than 500KB to prevent localStorage issues with multiple images
    if (needsCompression(file, 500)) {
      try {
        fileToProcess = await compressImage(file, {
          maxWidth: 600,
          maxHeight: 600,
          quality: 0.6,
          format: 'jpeg'
        });
        console.log(`Image compressed: ${formatFileSize(file.size)} → ${formatFileSize(fileToProcess.size)}`);
      } catch (error) {
        console.error('Failed to compress image:', error);
        // Continue with original file if compression fails
      }
    }
    
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(fileToProcess);
    });
  };

  const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Limit number of images that can be added at once
    if (files.length > 10) {
      toast.error('You can only add up to 10 images at a time');
      return;
    }

    setIsProcessing(true);
    
    try {
      if (files.length > 1) {
        toast.info(`Processing ${files.length} images...`);
      }
      
      const urls = (await Promise.all(files.map(processFile))).filter(Boolean) as string[];
      
      if (urls.length > 0) {
        setImages((prev) => [...prev, ...urls]);
        if (urls.length < files.length) {
          toast.warning(`Added ${urls.length} of ${files.length} images. Some images were skipped.`);
        }
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process some images');
    } finally {
      setIsProcessing(false);
    }

    // reset input to allow re-uploading the same file names
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  if (!images.length) {
    return (
      <div className="relative h-28 rounded-md border border-border bg-muted/30 overflow-hidden flex items-center justify-center">
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />
        <button
          type="button"
          onClick={onPick}
          disabled={isProcessing}
          className="flex items-center gap-2 px-2 py-1 rounded-md border border-dashed border-border bg-background/60 text-xs text-muted-foreground hover:bg-muted/40 transition-colors disabled:opacity-50"
          aria-label="Add photos"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span>Add photos</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">{images.length} photo{images.length === 1 ? "" : "s"}</Badge>
        </div>
        <div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />
          <Button variant="secondary" size="sm" className="h-7 px-2" onClick={onPick} disabled={isProcessing}>
            {isProcessing ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Processing...</>
            ) : (
              <><Plus className="h-3.5 w-3.5 mr-1" /> Add</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {images.map((src, idx) => (
          <div key={idx} className="relative aspect-video rounded-md overflow-hidden border border-border bg-muted/20">
            <img src={src} alt={`Window photo ${idx + 1}`} className="absolute inset-0 h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute top-1 right-1 inline-flex items-center justify-center h-6 w-6 rounded-sm bg-background/80 text-muted-foreground hover:text-destructive border border-border"
              aria-label="Remove photo"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkItemPhotoGallery;
