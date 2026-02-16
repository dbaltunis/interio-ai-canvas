
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, Package, Loader2 } from "lucide-react";
import { WorkshopRoomSection } from "@/hooks/useWorkshopData";
import CalculationBreakdown from "@/components/job-creation/CalculationBreakdown";
import { WorkItemPhotoGallery } from "@/components/workroom/components/WorkItemPhotoGallery";
import { compressImage, needsCompression, formatFileSize } from "@/utils/imageUtils";
import { toast } from "sonner";
import { PhotoLightbox } from "@/components/workroom/components/PhotoLightbox";

interface RoomSectionProps {
  section: WorkshopRoomSection;
}

type VisualProps = {
  width?: number;
  height?: number;
  unit?: string;
  itemId: string;
  treatment?: string | null;
  defaultImageUrl?: string | null;
};

const Visual: React.FC<VisualProps> = ({ width, height, unit, itemId, treatment, defaultImageUrl }) => {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const storageKey = React.useMemo(() => `workshop:photo:${itemId}`, [itemId]);

  React.useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    setImageSrc(saved || defaultImageUrl || null);
  }, [storageKey, defaultImageUrl]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (imageSrc) {
      try {
        window.localStorage.setItem(storageKey, imageSrc);
      } catch (e) {
        // localStorage quota exceeded - image too large
        console.warn('localStorage quota exceeded, image not saved locally');
      }
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, [imageSrc, storageKey]);

  const onPick = () => inputRef.current?.click();

  const onRemove = () => setImageSrc(null);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Check if file is too large (>10MB is unreasonable)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Image is too large (${formatFileSize(file.size)}). Maximum size is 10MB.`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      let fileToProcess = file;
      
      // Compress if larger than 1MB to prevent localStorage issues
      if (needsCompression(file, 1024)) {
        toast.info(`Optimizing image (${formatFileSize(file.size)})...`);
        fileToProcess = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.7,
          format: 'jpeg'
        });
        console.log(`Image compressed: ${formatFileSize(file.size)} → ${formatFileSize(fileToProcess.size)}`);
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const data = typeof reader.result === "string" ? reader.result : null;
        if (data) {
          setImageSrc(data);
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setIsProcessing(false);
      };
      reader.readAsDataURL(fileToProcess);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
      setIsProcessing(false);
    }
  };

  const hasDims = width !== undefined && height !== undefined;
  const widthLabel = hasDims ? `${width} ${unit ?? ""}` : undefined;
  const heightLabel = hasDims ? `${height} ${unit ?? ""}` : undefined;

  return (
    <div className="relative h-28 rounded-md border border-border bg-muted/30 overflow-hidden">
      {/* Photo layer */}
      {imageSrc ? (
        <img src={imageSrc} alt="Window reference" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}

      {/* Fallback empty state when no photo */}
      {!imageSrc && (
        <button
          type="button"
          onClick={onPick}
          className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
          aria-label="Add photo"
        >
          <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-dashed border-border bg-background/60">
            <Camera className="h-4 w-4" />
            <span>Add photo</span>
          </div>
        </button>
      )}

      {/* Measurement overlays */}
      <div className="absolute inset-3 border-2 border-dashed border-muted-foreground/40 rounded-sm pointer-events-none" />
      {/* Top width label */}
      <div className="absolute top-1 left-1 right-1 text-center text-[10px] text-muted-foreground">
        {hasDims ? `${width} × ${height} ${unit ?? ""}` : "No dimensions"}
      </div>
      {/* Right height label */}
      {heightLabel && (
        <div className="absolute top-1/2 -translate-y-1/2 right-1 text-[10px] text-muted-foreground">
          {heightLabel}
        </div>
      )}
      {/* Bottom width ruler + label */}
      {widthLabel && (
        <>
          <div className="absolute left-3 right-3 bottom-4 h-px bg-muted-foreground/40" />
          <div className="absolute bottom-1 left-1 right-1 text-center text-[10px] text-muted-foreground">
            {widthLabel}
          </div>
        </>
      )}

      {/* Treatment badge */}
      {treatment && (
        <div className="absolute bottom-1 left-1">
          <Badge variant="secondary" className="text-[10px]">
            {treatment}
          </Badge>
        </div>
      )}

      {/* Controls (compact) */}
      <div className="absolute bottom-1 right-1 flex items-center gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
        <Button variant="secondary" size="sm" className="h-6 px-2" onClick={onPick} disabled={isProcessing}>
          {isProcessing ? (
            <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing...</>
          ) : imageSrc ? "Change" : "Upload"}
        </Button>
        {imageSrc && (
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={onRemove} aria-label="Remove photo">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const RoomSection: React.FC<RoomSectionProps> = ({ section }) => {
  const [lightboxState, setLightboxState] = useState<{ photos: string[]; index: number } | null>(null);

  return (
    <>
    <Card className="workshop-room-section break-inside-avoid">
      <CardHeader>
        <CardTitle>{section.roomName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {section.items.map((item) => {
            const fabricImageUrl = item.summary?.fabric?.image_url || 
                                   item.summary?.material?.image_url || 
                                   item.summary?.fabric_details?.image_url ||
                                   item.summary?.material_details?.image_url;
            const treatmentPhotos: string[] = item.treatmentPhotos || [];
            
            return (
              <div key={item.id} className="workshop-item-card rounded-md border p-3 bg-background">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Left: Visual */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">{item.name}</div>
                    
                    {/* Treatment Photos from Supabase */}
                    {treatmentPhotos.length > 0 ? (
                      <div className="flex gap-1.5">
                        {treatmentPhotos.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setLightboxState({ photos: treatmentPhotos, index: i })}
                            className="relative w-20 h-20 rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
                          >
                            <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <WorkItemPhotoGallery itemId={item.id} />
                    )}
                    
                    <div className="rounded-lg border overflow-hidden bg-card h-48 flex items-center justify-center">
                      {fabricImageUrl ? (
                        <img 
                          src={fabricImageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-muted-foreground p-4">
                          <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No image uploaded</p>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.treatmentType ?? "—"} • Qty: {item.quantity ?? 1}
                    </div>
                  </div>

                  {/* Right: All measurements & breakdown */}
                  <div className="md:col-span-2">
                  {item.summary ? (
                    <CalculationBreakdown
                      summary={item.summary}
                      surface={item.surface}
                      compact
                      costBreakdown={Array.isArray(item.summary?.cost_breakdown) ? item.summary.cost_breakdown : []}
                      currency={item.summary?.currency}
                      totalCost={item.summary?.total_cost}
                      embedded
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">No worksheet data saved yet.</div>
                  )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    <PhotoLightbox
      photos={lightboxState?.photos || []}
      initialIndex={lightboxState?.index || 0}
      open={!!lightboxState}
      onOpenChange={(open) => !open && setLightboxState(null)}
    />
    </>
  );
};
