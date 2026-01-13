import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
}

interface PublicChecklistProps {
  category: 'curtain' | 'roller' | 'venetian' | 'shutter' | 'roman' | 'other';
  completedSteps: string[];
  onStepsChange: (steps: string[]) => void;
}

const CHECKLISTS: Record<string, ChecklistItem[]> = {
  curtain: [
    { id: 'track_smooth', label: 'Track/rod glides smoothly' },
    { id: 'pleats_even', label: 'Pleats evenly spaced' },
    { id: 'drop_correct', label: 'Drop correct (hook to hem)' },
    { id: 'stackback_clears', label: 'Stackback clears window' },
    { id: 'lining_hidden', label: 'Lining doesn\'t show from front' },
  ],
  roller: [
    { id: 'bracket_level', label: 'Brackets level' },
    { id: 'rolls_smooth', label: 'Rolls up/down smoothly' },
    { id: 'no_light_gaps', label: 'No light gaps at edges' },
    { id: 'chain_works', label: 'Chain operates correctly' },
    { id: 'child_safety', label: 'Child safety device installed' },
  ],
  venetian: [
    { id: 'bracket_secure', label: 'Brackets secure' },
    { id: 'slats_tilt', label: 'Slats tilt correctly' },
    { id: 'cords_work', label: 'Cords/wand operates smoothly' },
    { id: 'level_hang', label: 'Hangs level' },
    { id: 'valance_fitted', label: 'Valance/pelmet fitted' },
  ],
  shutter: [
    { id: 'panels_open', label: 'All panels open freely' },
    { id: 'louvres_tilt', label: 'Louvres tilt correctly' },
    { id: 'gaps_even', label: 'Gaps even around frame' },
    { id: 'hinges_secure', label: 'Hinges secure' },
    { id: 'frame_level', label: 'Frame is level and plumb' },
  ],
  roman: [
    { id: 'bracket_secure', label: 'Brackets secure' },
    { id: 'folds_even', label: 'Folds are even when raised' },
    { id: 'chain_works', label: 'Chain/cord operates smoothly' },
    { id: 'drop_correct', label: 'Drop length correct' },
    { id: 'valance_straight', label: 'Valance is straight' },
  ],
};

export const PublicChecklist: React.FC<PublicChecklistProps> = ({
  category,
  completedSteps,
  onStepsChange
}) => {
  const checklist = CHECKLISTS[category] || [];

  if (checklist.length === 0) return null;

  const toggleStep = (stepId: string) => {
    if (completedSteps.includes(stepId)) {
      onStepsChange(completedSteps.filter(s => s !== stepId));
    } else {
      onStepsChange([...completedSteps, stepId]);
    }
  };

  return (
    <div className="space-y-2 border-t pt-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Installation Checklist
      </p>
      {checklist.map((item) => {
        const isChecked = completedSteps.includes(item.id);
        return (
          <label
            key={item.id}
            className={cn(
              "flex items-center gap-3 p-2 -mx-2 rounded-md cursor-pointer transition-colors",
              "hover:bg-muted/50",
              isChecked && "bg-green-50 dark:bg-green-950/20"
            )}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => toggleStep(item.id)}
              className="h-5 w-5"
            />
            <span className={cn(
              "text-sm",
              isChecked && "text-muted-foreground line-through"
            )}>
              {item.label}
            </span>
          </label>
        );
      })}
    </div>
  );
};
