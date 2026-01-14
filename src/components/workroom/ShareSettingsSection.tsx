import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Filter, Factory, Scissors, Wrench, Sparkles, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export type DocumentType = 'work_order' | 'installation' | 'fitting';
export type ContentFilter = 'all' | 'field_ready' | 'specs_only';
export type TreatmentFilter = 'all' | 'curtains' | 'roman_blinds' | 'roller_blinds' | 'venetian_blinds' | 'vertical_blinds' | 'shutters' | 'custom';

// Workshop presets for quick setup
export const WORKSHOP_PRESETS = {
  curtain_maker: {
    label: 'Curtain Maker',
    icon: Scissors,
    documentType: 'work_order' as DocumentType,
    contentFilter: 'specs_only' as ContentFilter,
    treatmentFilter: 'custom' as TreatmentFilter,
    selectedTreatments: ['curtains', 'roman_blinds'],
    color: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100',
  },
  blind_manufacturer: {
    label: 'Blind Factory',
    icon: Factory,
    documentType: 'work_order' as DocumentType,
    contentFilter: 'specs_only' as ContentFilter,
    treatmentFilter: 'custom' as TreatmentFilter,
    selectedTreatments: ['roller_blinds', 'venetian_blinds', 'vertical_blinds'],
    color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  },
  installer: {
    label: 'Installer',
    icon: Wrench,
    documentType: 'installation' as DocumentType,
    contentFilter: 'field_ready' as ContentFilter,
    treatmentFilter: 'all' as TreatmentFilter,
    selectedTreatments: [],
    color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
  },
  fitter: {
    label: 'Fitter',
    icon: Sparkles,
    documentType: 'fitting' as DocumentType,
    contentFilter: 'field_ready' as ContentFilter,
    treatmentFilter: 'all' as TreatmentFilter,
    selectedTreatments: [],
    color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
  },
};

// Treatment types with labels
export const TREATMENT_TYPES = [
  { value: 'curtains', label: 'Curtains' },
  { value: 'roman_blinds', label: 'Roman Blinds' },
  { value: 'roller_blinds', label: 'Roller Blinds' },
  { value: 'venetian_blinds', label: 'Venetian Blinds' },
  { value: 'vertical_blinds', label: 'Vertical Blinds' },
  { value: 'shutters', label: 'Shutters' },
  { value: 'honeycomb_blinds', label: 'Honeycomb Blinds' },
  { value: 'panel_blinds', label: 'Panel Blinds' },
];

interface ShareSettingsSectionProps {
  documentType: DocumentType;
  contentFilter: ContentFilter;
  treatmentFilter: TreatmentFilter;
  selectedTreatments: string[];
  availableTreatments: string[];
  activePreset?: string | null;
  onDocumentTypeChange: (type: DocumentType) => void;
  onContentFilterChange: (filter: ContentFilter) => void;
  onTreatmentFilterChange: (filter: TreatmentFilter, selected: string[]) => void;
  onPresetApply?: (presetKey: string) => void;
}

export const ShareSettingsSection: React.FC<ShareSettingsSectionProps> = ({
  documentType,
  contentFilter,
  treatmentFilter,
  selectedTreatments,
  availableTreatments,
  activePreset,
  onDocumentTypeChange,
  onContentFilterChange,
  onTreatmentFilterChange,
  onPresetApply,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleTreatmentToggle = (treatment: string) => {
    const newSelected = selectedTreatments.includes(treatment)
      ? selectedTreatments.filter(t => t !== treatment)
      : [...selectedTreatments, treatment];
    onTreatmentFilterChange('custom', newSelected);
  };

  const formatTreatmentLabel = (value: string): string => {
    const found = TREATMENT_TYPES.find(t => t.value === value);
    return found?.label || value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Show only treatments that exist in the project
  const projectTreatments = availableTreatments.length > 0 
    ? TREATMENT_TYPES.filter(t => availableTreatments.includes(t.value))
    : TREATMENT_TYPES;

  return (
    <div className="space-y-3 p-3 border-b border-border">
      {/* Workshop Presets - Quick Action Buttons */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Quick Setup</label>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(WORKSHOP_PRESETS).map(([key, preset]) => {
            const Icon = preset.icon;
            const isActive = activePreset === key;
            return (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => onPresetApply?.(key)}
                className={`h-8 text-xs justify-start gap-1.5 ${
                  isActive 
                    ? `ring-2 ring-primary ${preset.color}` 
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {preset.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Treatment Filter - Most Important */}
      {availableTreatments.length > 1 && (
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Include Treatments
          </label>
          <Select 
            value={treatmentFilter} 
            onValueChange={(v) => onTreatmentFilterChange(v as TreatmentFilter, selectedTreatments)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All treatments ({availableTreatments.length})</SelectItem>
              {projectTreatments.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label} only</SelectItem>
              ))}
              <SelectItem value="custom">Custom selection...</SelectItem>
            </SelectContent>
          </Select>

          {/* Custom selection checkboxes */}
          {treatmentFilter === 'custom' && (
            <div className="mt-2 p-2 bg-muted/50 rounded space-y-1.5">
              {projectTreatments.map(t => (
                <label 
                  key={t.value} 
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-background p-1 rounded"
                >
                  <Checkbox
                    checked={selectedTreatments.includes(t.value)}
                    onCheckedChange={() => handleTreatmentToggle(t.value)}
                    className="h-3.5 w-3.5"
                  />
                  {t.label}
                </label>
              ))}
              {selectedTreatments.length > 0 && (
                <p className="text-[10px] text-muted-foreground pt-1">
                  {selectedTreatments.length} selected
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Advanced Settings - Collapsible */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full h-7 text-xs text-muted-foreground justify-between"
          >
            Advanced options
            <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {/* Document Type */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Document Type
            </label>
            <Select value={documentType} onValueChange={(v) => onDocumentTypeChange(v as DocumentType)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work_order">
                  <div className="flex flex-col items-start">
                    <span>Work Order</span>
                    <span className="text-[10px] text-muted-foreground">Full specs table for manufacturing</span>
                  </div>
                </SelectItem>
                <SelectItem value="installation">
                  <div className="flex flex-col items-start">
                    <span>Installation</span>
                    <span className="text-[10px] text-muted-foreground">Compact view with checklist</span>
                  </div>
                </SelectItem>
                <SelectItem value="fitting">
                  <div className="flex flex-col items-start">
                    <span>Fitting Sheet</span>
                    <span className="text-[10px] text-muted-foreground">Final adjustments checklist</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Filter */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Content Detail
            </label>
            <Select value={contentFilter} onValueChange={(v) => onContentFilterChange(v as ContentFilter)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex flex-col items-start">
                    <span>All content</span>
                    <span className="text-[10px] text-muted-foreground">Full details including pricing</span>
                  </div>
                </SelectItem>
                <SelectItem value="field_ready">
                  <div className="flex flex-col items-start">
                    <span>Field-ready</span>
                    <span className="text-[10px] text-muted-foreground">No pricing, for field workers</span>
                  </div>
                </SelectItem>
                <SelectItem value="specs_only">
                  <div className="flex flex-col items-start">
                    <span>Specs only</span>
                    <span className="text-[10px] text-muted-foreground">Measurements & materials only</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
