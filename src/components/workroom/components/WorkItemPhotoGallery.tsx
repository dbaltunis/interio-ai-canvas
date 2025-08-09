import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Trash2, Plus } from "lucide-react";

interface WorkItemPhotoGalleryProps {
  itemId: string;
}

export const WorkItemPhotoGallery: React.FC<WorkItemPhotoGalleryProps> = ({ itemId }) => {
  const [images, setImages] = React.useState<string[]>([]);
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
    window.localStorage.setItem(storageKey, JSON.stringify(images));
  }, [images, storageKey]);

  const onPick = () => inputRef.current?.click();

  const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const toDataUrl = (file: File) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.readAsDataURL(file);
      });

    const urls = (await Promise.all(files.map(toDataUrl))).filter(Boolean);
    setImages((prev) => [...prev, ...urls]);

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
          className="flex items-center gap-2 px-2 py-1 rounded-md border border-dashed border-border bg-background/60 text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
          aria-label="Add photos"
        >
          <Camera className="h-4 w-4" />
          <span>Add photos</span>
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
          <Button variant="secondary" size="sm" className="h-7 px-2" onClick={onPick}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {images.map((src, idx) => (
          <div key={idx} className="relative aspect-video rounded-md overflow-hidden border border-border bg-muted/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
