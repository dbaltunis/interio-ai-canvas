
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Trash2 } from "lucide-react";
import { WorkshopRoomSection } from "@/hooks/useWorkshopData";
import CalculationBreakdown from "@/components/job-creation/CalculationBreakdown";
import { TreatmentVisualizer } from "@/components/measurements/TreatmentVisualizer";
import { WorkItemPhotoGallery } from "@/components/workroom/components/WorkItemPhotoGallery";
import { toTreatmentVisualizerData } from "@/components/workroom/utils/visual-adapter";

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
  const inputRef = React.useRef<HTMLInputElement>(null);

  const storageKey = React.useMemo(() => `workshop:photo:${itemId}`, [itemId]);

  React.useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    setImageSrc(saved || defaultImageUrl || null);
  }, [storageKey, defaultImageUrl]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (imageSrc) {
      window.localStorage.setItem(storageKey, imageSrc);
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, [imageSrc, storageKey]);

  const onPick = () => inputRef.current?.click();

  const onRemove = () => setImageSrc(null);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = typeof reader.result === "string" ? reader.result : null;
      if (data) setImageSrc(data);
    };
    reader.readAsDataURL(file);
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
        <Button variant="secondary" size="sm" className="h-6 px-2" onClick={onPick}>
          {imageSrc ? "Change" : "Upload"}
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
  return (
    <Card className="break-inside-avoid">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{section.roomName}</CardTitle>
          <Badge variant="outline" className="text-sm">
            {section.items.length} item{section.items.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {section.items.map((item) => (
            <Card key={item.id} className="bg-muted/30 border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">{item.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.treatmentType ?? "Unknown"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Qty: {item.quantity ?? 1}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Integrated Treatment Information */}
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Left: Photos and Visual */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Visual Reference</div>
                    <WorkItemPhotoGallery itemId={item.id} />
                  </div>

                  {/* Right: Treatment Details */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Treatment Specifications</div>
                    <div className="rounded-lg border bg-background p-4">
                      <TreatmentVisualizer {...toTreatmentVisualizerData(item)} />
                    </div>
                  </div>
                </div>

                {/* Calculations and Breakdown */}
                <div className="pt-3 border-t">
                  <div className="text-sm font-medium text-muted-foreground mb-3">Worksheet Details</div>
                  {item.summary ? (
                    <div className="rounded-lg border bg-background p-4">
                      <CalculationBreakdown
                        summary={item.summary}
                        surface={item.surface}
                        compact={false}
                        costBreakdown={Array.isArray(item.summary?.cost_breakdown) ? item.summary.cost_breakdown : []}
                        currency={item.summary?.currency}
                        totalCost={item.summary?.total_cost}
                        embedded
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
                      <div className="text-sm text-muted-foreground">
                        No worksheet data available yet.
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Complete measurements to see calculations
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
