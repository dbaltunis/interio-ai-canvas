import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface TreatmentChecklistProps {
  treatmentType: string;
  templateType: 'fitting' | 'installation';
  pooling?: number;
  unit?: string;
  isPrintMode?: boolean;
  isReadOnly?: boolean;
  onProgressChange?: (completed: number, total: number) => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
}

const getCurtainFittingChecklist = (pooling?: number, unit?: string): ChecklistItem[] => [
  { id: 'steam', label: 'Steamed', detail: 'Remove transport creases' },
  { id: 'track', label: 'Track/rod secure & level' },
  { id: 'drop', label: 'Drop correct', detail: pooling ? `Pooling: ${pooling}${unit}` : undefined },
  { id: 'pleats', label: 'Pleats evenly spaced' },
  { id: 'lining', label: 'Lining hangs straight' },
  { id: 'function', label: 'Glides smoothly' },
];

const getCurtainInstallationChecklist = (): ChecklistItem[] => [
  { id: 'level', label: 'Brackets level' },
  { id: 'secure', label: 'Fixings secure' },
  { id: 'track', label: 'Track/rod mounted' },
  { id: 'smooth', label: 'Opens/closes smoothly' },
  { id: 'stackback', label: 'Stackback clears window' },
  { id: 'approval', label: 'Client approved' },
];

const getRollerBlindFittingChecklist = (): ChecklistItem[] => [
  { id: 'clean', label: 'Fabric clean & unmarked' },
  { id: 'mechanism', label: 'Chain/motor works' },
  { id: 'level', label: 'Bottom bar level' },
  { id: 'gaps', label: 'No light gaps' },
];

const getRollerBlindInstallationChecklist = (): ChecklistItem[] => [
  { id: 'brackets', label: 'Brackets level & secure' },
  { id: 'click', label: 'Blind clicked into place' },
  { id: 'smooth', label: 'Rolls up/down smoothly' },
  { id: 'stops', label: 'Stops at correct position' },
  { id: 'child-safety', label: 'Child safety fitted' },
  { id: 'approval', label: 'Client approved' },
];

const getShutterChecklist = (): ChecklistItem[] => [
  { id: 'panels', label: 'All panels open freely' },
  { id: 'louvres', label: 'Louvres tilt correctly' },
  { id: 'gaps', label: 'Even gaps around frame' },
  { id: 'hinges', label: 'Hinges secure' },
  { id: 'touch-up', label: 'Touch-up paint applied' },
  { id: 'approval', label: 'Client approved' },
];

const getRomanBlindChecklist = (): ChecklistItem[] => [
  { id: 'folds', label: 'Folds even & straight' },
  { id: 'cords', label: 'Cords aligned' },
  { id: 'mechanism', label: 'Raises/lowers smoothly' },
  { id: 'level', label: 'Bottom bar level' },
  { id: 'approval', label: 'Client approved' },
];

const getVenetianBlindChecklist = (): ChecklistItem[] => [
  { id: 'slats', label: 'Slats tilt correctly' },
  { id: 'raise', label: 'Raises/lowers evenly' },
  { id: 'cords', label: 'Cords not tangled' },
  { id: 'level', label: 'Bottom rail level' },
  { id: 'approval', label: 'Client approved' },
];

const getGenericChecklist = (templateType: 'fitting' | 'installation'): ChecklistItem[] => {
  if (templateType === 'fitting') {
    return [
      { id: 'condition', label: 'Item in good condition' },
      { id: 'measurements', label: 'Measurements verified' },
      { id: 'hardware', label: 'Hardware complete' },
      { id: 'finish', label: 'Finish quality checked' },
      { id: 'approval', label: 'Client approved' },
    ];
  }
  return [
    { id: 'site-ready', label: 'Site prepared' },
    { id: 'installed', label: 'Item installed' },
    { id: 'level', label: 'Level & aligned' },
    { id: 'function', label: 'Functions correctly' },
    { id: 'cleanup', label: 'Area cleaned' },
    { id: 'approval', label: 'Client approved' },
  ];
};

const getChecklistForTreatment = (
  treatmentType: string,
  templateType: 'fitting' | 'installation',
  pooling?: number,
  unit?: string
): ChecklistItem[] => {
  const type = treatmentType.toLowerCase();
  
  if (type.includes('curtain') || type.includes('drape')) {
    return templateType === 'fitting' 
      ? getCurtainFittingChecklist(pooling, unit)
      : getCurtainInstallationChecklist();
  }
  
  if (type.includes('roller') || type.includes('sunscreen')) {
    return templateType === 'fitting'
      ? getRollerBlindFittingChecklist()
      : getRollerBlindInstallationChecklist();
  }
  
  if (type.includes('shutter')) {
    return getShutterChecklist();
  }
  
  if (type.includes('roman')) {
    return getRomanBlindChecklist();
  }
  
  if (type.includes('venetian') || type.includes('timber')) {
    return getVenetianBlindChecklist();
  }
  
  return getGenericChecklist(templateType);
};

export const TreatmentChecklist: React.FC<TreatmentChecklistProps> = ({
  treatmentType,
  templateType,
  pooling,
  unit,
  isPrintMode = false,
  isReadOnly = false,
  onProgressChange
}) => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  
  const checklistItems = getChecklistForTreatment(treatmentType, templateType, pooling, unit);

  useEffect(() => {
    onProgressChange?.(completedItems.size, checklistItems.length);
  }, [completedItems.size, checklistItems.length, onProgressChange]);

  const toggleItem = (id: string) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-muted/30 rounded-md p-3">
      <div className="grid grid-cols-2 gap-2">
        {checklistItems.map((item) => (
          <div 
            key={item.id} 
            className={`flex items-start gap-2 p-2 rounded text-sm transition-colors ${
              completedItems.has(item.id) ? 'bg-green-50' : 'bg-background'
            }`}
          >
            {!isPrintMode && (
              <Checkbox
                checked={completedItems.has(item.id)}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-0.5 no-print"
                disabled={isReadOnly}
              />
            )}
            {isPrintMode && (
              <div className="w-4 h-4 border border-muted-foreground rounded mt-0.5 shrink-0" />
            )}
            <div className="min-w-0">
              <span className={`font-medium ${completedItems.has(item.id) ? 'line-through text-muted-foreground' : ''}`}>
                {item.label}
              </span>
              {item.detail && (
                <div className="text-xs text-muted-foreground">{item.detail}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
