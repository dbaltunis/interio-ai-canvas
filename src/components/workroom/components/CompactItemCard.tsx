import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, ChevronDown, ChevronUp, Camera, MessageSquare, ClipboardCheck } from "lucide-react";
import { BeforeAfterPhotoUpload } from "./BeforeAfterPhotoUpload";
import { TreatmentChecklist } from "./TreatmentChecklist";

interface CompactItemCardProps {
  item: {
    id: string;
    name: string;
    treatmentType?: string;
    measurements?: {
      width?: number | string;
      drop?: number | string;
      height?: number | string;
      unit?: string;
      pooling?: number;
    };
    fullness?: {
      headingType?: string;
      ratio?: number;
      hardware?: {
        type?: string;
      };
    };
    options?: Array<{
      optionKey: string;
      name: string;
      quantity?: number;
    }>;
  };
  isComplete: boolean;
  onToggleComplete: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  isPrintMode?: boolean;
  isReadOnly?: boolean;
  templateType: 'fitting' | 'installation';
  photoPrefix?: string;
}

export const CompactItemCard: React.FC<CompactItemCardProps> = ({
  item,
  isComplete,
  onToggleComplete,
  notes,
  onNotesChange,
  isPrintMode = false,
  isReadOnly = false,
  templateType,
  photoPrefix = ''
}) => {
  const [showChecklist, setShowChecklist] = useState(false);
  const [showNotes, setShowNotes] = useState(!!notes);
  const [showPhotos, setShowPhotos] = useState(false);
  const [checklistProgress, setChecklistProgress] = useState({ completed: 0, total: 0 });

  const hardware = (item.fullness as any)?.hardware;
  const mountType = hardware?.type || item.fullness?.headingType || "—";
  
  const width = item.measurements?.width ?? "—";
  const drop = item.measurements?.drop ?? item.measurements?.height ?? "—";
  const unit = item.measurements?.unit ?? "mm";

  const handleChecklistProgress = (completed: number, total: number) => {
    setChecklistProgress({ completed, total });
  };

  return (
    <Card className={`workshop-item-card avoid-page-break transition-all ${isComplete ? "border-green-500 bg-green-50/30" : ""}`}>
      <CardContent className="p-4">
        {/* Compact Header Row */}
        <div className="flex items-center gap-3">
          {!isPrintMode && (
            <Checkbox
              checked={isComplete}
              onCheckedChange={onToggleComplete}
              className="no-print h-5 w-5"
              disabled={isReadOnly}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-base truncate">{item.name}</span>
              <Badge variant="secondary" className="text-xs shrink-0">
                {item.treatmentType}
              </Badge>
              {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
            </div>
          </div>
          {checklistProgress.total > 0 && (
            <Badge 
              variant={checklistProgress.completed === checklistProgress.total ? "default" : "outline"}
              className={`shrink-0 ${checklistProgress.completed === checklistProgress.total ? "bg-green-500" : ""}`}
            >
              {checklistProgress.completed}/{checklistProgress.total}
            </Badge>
          )}
        </div>

        {/* Compact Measurements Row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm bg-muted/50 rounded-md px-3 py-2">
          <div>
            <span className="text-muted-foreground">W:</span>{" "}
            <span className="font-semibold">{width}</span>
            <span className="text-muted-foreground text-xs ml-0.5">{unit}</span>
          </div>
          <div className="text-muted-foreground">|</div>
          <div>
            <span className="text-muted-foreground">H:</span>{" "}
            <span className="font-semibold">{drop}</span>
            <span className="text-muted-foreground text-xs ml-0.5">{unit}</span>
          </div>
          <div className="text-muted-foreground">|</div>
          <div>
            <span className="text-muted-foreground">Mount:</span>{" "}
            <span className="font-medium">{mountType}</span>
          </div>
          {item.measurements?.pooling && item.measurements.pooling > 0 && (
            <>
              <div className="text-muted-foreground">|</div>
              <div>
                <span className="text-muted-foreground">Pool:</span>{" "}
                <span className="font-medium">{item.measurements.pooling}{unit}</span>
              </div>
            </>
          )}
        </div>

        {/* Expandable Sections - Compact Buttons */}
        {!isPrintMode && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant={showChecklist ? "default" : "outline"}
              size="sm"
              onClick={() => setShowChecklist(!showChecklist)}
              className="h-7 text-xs gap-1"
            >
              <ClipboardCheck className="h-3 w-3" />
              Checklist
              {showChecklist ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Button
              variant={showNotes ? "default" : "outline"}
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className="h-7 text-xs gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              Notes
              {notes && <span className="ml-1 w-2 h-2 rounded-full bg-primary" />}
            </Button>
            <Button
              variant={showPhotos ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPhotos(!showPhotos)}
              className="h-7 text-xs gap-1"
            >
              <Camera className="h-3 w-3" />
              Photos
            </Button>
          </div>
        )}

        {/* Checklist Section */}
        <Collapsible open={showChecklist || isPrintMode}>
          <CollapsibleContent className="mt-3">
            <TreatmentChecklist
              treatmentType={item.treatmentType}
              templateType={templateType}
              pooling={item.measurements?.pooling}
              unit={item.measurements?.unit}
              isPrintMode={isPrintMode}
              isReadOnly={isReadOnly}
              onProgressChange={handleChecklistProgress}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Notes Section */}
        <Collapsible open={showNotes || isPrintMode}>
          <CollapsibleContent className="mt-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {templateType === 'fitting' ? 'Fitting Notes' : 'Installation Notes'}
              </label>
              {isPrintMode ? (
                <div className="text-sm min-h-[40px] p-2 bg-muted/30 rounded whitespace-pre-wrap">
                  {notes || "No notes"}
                </div>
              ) : (
                <Textarea
                  placeholder={`Add ${templateType} notes...`}
                  className="text-sm min-h-[60px] resize-none"
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  disabled={isReadOnly}
                />
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Photos Section */}
        <Collapsible open={showPhotos}>
          <CollapsibleContent className="mt-3">
            <div className="grid grid-cols-2 gap-3">
              <BeforeAfterPhotoUpload
                itemId={`${photoPrefix}${item.id}`}
                stage="before"
                label="Before"
              />
              <BeforeAfterPhotoUpload
                itemId={`${photoPrefix}${item.id}`}
                stage="after"
                label="After"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
