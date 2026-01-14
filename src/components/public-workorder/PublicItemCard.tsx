import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, CheckCircle2, StickyNote, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PublicChecklist } from './PublicChecklist';

interface PublicItemCardProps {
  treatment: {
    id: string;
    treatment_type: string;
    treatment_name?: string;
    product_name?: string;
    mounting_type?: string;
    surface_name?: string;
    measurements?: {
      width?: number;
      height?: number;
      [key: string]: any;
    };
    notes?: string;
    status?: string;
    rooms?: {
      id: string;
      name: string;
    };
  };
  completedSteps: string[];
  onStepsChange: (steps: string[]) => void;
}

export const PublicItemCard: React.FC<PublicItemCardProps> = ({
  treatment,
  completedSteps,
  onStepsChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const treatmentType = treatment.treatment_name || treatment.product_name || treatment.treatment_type || 'Treatment';
  const measurements = treatment.measurements || {};
  const width = measurements.width;
  const height = measurements.height;
  const mountType = treatment.mounting_type;
  const notes = treatment.notes;

  // Determine treatment category for checklist
  const getTreatmentCategory = (): 'curtain' | 'roller' | 'venetian' | 'shutter' | 'roman' | 'other' => {
    const type = treatmentType.toLowerCase();
    if (type.includes('curtain') || type.includes('drape')) return 'curtain';
    if (type.includes('roller') || type.includes('roll')) return 'roller';
    if (type.includes('venetian') || type.includes('aluminium') || type.includes('timber blind')) return 'venetian';
    if (type.includes('shutter') || type.includes('plantation')) return 'shutter';
    if (type.includes('roman')) return 'roman';
    return 'other';
  };

  const category = getTreatmentCategory();
  const hasChecklist = category !== 'other';
  
  // Calculate progress
  const checklistSteps = getChecklistSteps(category);
  const progress = hasChecklist 
    ? Math.round((completedSteps.length / checklistSteps.length) * 100)
    : 0;

  const isComplete = hasChecklist && completedSteps.length === checklistSteps.length;

  return (
    <Card className={cn(
      "transition-all duration-200",
      isComplete && "border-green-500/50 bg-green-50/30 dark:bg-green-950/10"
    )}>
      <CardContent className="p-3">
        {/* Header Row */}
        <div className="flex items-center gap-3">
          {/* Completion indicator */}
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            isComplete 
              ? "bg-green-500 text-white" 
              : "bg-muted text-muted-foreground"
          )}>
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <span className="text-xs font-medium">{progress}%</span>
            )}
          </div>

          {/* Treatment Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">{treatmentType}</span>
              {mountType && (
                <Badge variant="outline" className="text-xs">
                  {mountType}
                </Badge>
              )}
            </div>
            
            {/* Surface/Window name */}
            {treatment.surface_name && (
              <span className="text-xs text-muted-foreground block">
                {treatment.surface_name}
              </span>
            )}
            
            {/* Measurements */}
            {(width || height) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Ruler className="h-3 w-3" />
                {width && <span>W: {width}mm</span>}
                {width && height && <span>×</span>}
                {height && <span>H: {height}mm</span>}
              </div>
            )}
          </div>

          {/* Expand button */}
          {hasChecklist && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-md hover:bg-muted transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Notes (always visible if present) */}
        {notes && (
          <div className="mt-3 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <StickyNote className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">{notes}</p>
            </div>
          </div>
        )}

        {/* Expandable Checklist */}
        {hasChecklist && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleContent className="mt-3">
              <PublicChecklist
                category={category}
                completedSteps={completedSteps}
                onStepsChange={onStepsChange}
              />
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

// Get checklist steps for a category (used for progress calculation)
function getChecklistSteps(category: string): string[] {
  switch (category) {
    case 'curtain':
      return ['track_smooth', 'pleats_even', 'drop_correct', 'stackback_clears', 'lining_hidden'];
    case 'roller':
      return ['bracket_level', 'rolls_smooth', 'no_light_gaps', 'chain_works', 'child_safety'];
    case 'venetian':
      return ['bracket_secure', 'slats_tilt', 'cords_work', 'level_hang', 'valance_fitted'];
    case 'shutter':
      return ['panels_open', 'louvres_tilt', 'gaps_even', 'hinges_secure', 'frame_level'];
    case 'roman':
      return ['bracket_secure', 'folds_even', 'chain_works', 'drop_correct', 'valance_straight'];
    default:
      return [];
  }
}
