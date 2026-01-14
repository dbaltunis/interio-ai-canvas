import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import type { CreateShareLinkInput } from '@/hooks/useShareLinks';

interface CreateShareLinkFormProps {
  availableTreatments: string[];
  isCreating: boolean;
  onSubmit: (input: CreateShareLinkInput) => Promise<void>;
  onCancel: () => void;
}

const TREATMENT_LABELS: Record<string, string> = {
  curtains: 'Curtains',
  roman_blinds: 'Roman Blinds',
  roller_blinds: 'Roller Blinds',
  venetian_blinds: 'Venetian Blinds',
  vertical_blinds: 'Vertical Blinds',
  shutters: 'Shutters',
  honeycomb_blinds: 'Honeycomb Blinds',
  panel_blinds: 'Panel Blinds',
};

export const CreateShareLinkForm: React.FC<CreateShareLinkFormProps> = ({
  availableTreatments,
  isCreating,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [documentType, setDocumentType] = useState<'work_order' | 'installation' | 'fitting'>('work_order');
  const [contentFilter, setContentFilter] = useState<'all' | 'field_ready' | 'specs_only'>('all');
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [includeAllTreatments, setIncludeAllTreatments] = useState(true);

  const handleTreatmentToggle = (treatment: string) => {
    setSelectedTreatments(prev =>
      prev.includes(treatment)
        ? prev.filter(t => t !== treatment)
        : [...prev, treatment]
    );
    setIncludeAllTreatments(false);
  };

  const handleAllTreatmentsChange = (checked: boolean) => {
    setIncludeAllTreatments(checked);
    if (checked) {
      setSelectedTreatments([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: name || undefined,
      document_type: documentType,
      content_filter: contentFilter,
      treatment_filter: includeAllTreatments ? [] : selectedTreatments,
    });
  };

  const formatTreatmentLabel = (value: string): string => {
    return TREATMENT_LABELS[value] || value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-3">
      <div className="space-y-2">
        <Label htmlFor="link-name" className="text-xs">Link Name (optional)</Label>
        <Input
          id="link-name"
          placeholder="e.g., For Curtain Maker"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Document Type</Label>
        <Select value={documentType} onValueChange={(v) => setDocumentType(v as typeof documentType)}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="work_order">Work Order</SelectItem>
            <SelectItem value="installation">Installation Sheet</SelectItem>
            <SelectItem value="fitting">Fitting Sheet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Content Detail</Label>
        <Select value={contentFilter} onValueChange={(v) => setContentFilter(v as typeof contentFilter)}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Full Details</SelectItem>
            <SelectItem value="field_ready">Field-Ready (No Pricing)</SelectItem>
            <SelectItem value="specs_only">Specs Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {availableTreatments.length > 1 && (
        <div className="space-y-2">
          <Label className="text-xs">Treatments to Include</Label>
          <div className="space-y-1.5 p-2 bg-muted/50 rounded-md max-h-32 overflow-y-auto">
            <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-background p-1 rounded">
              <Checkbox
                checked={includeAllTreatments}
                onCheckedChange={handleAllTreatmentsChange}
                className="h-3.5 w-3.5"
              />
              <span className="font-medium">All Treatments</span>
            </label>
            
            {availableTreatments.map(treatment => (
              <label 
                key={treatment}
                className={`flex items-center gap-2 text-xs cursor-pointer hover:bg-background p-1 rounded ${
                  includeAllTreatments ? 'opacity-50' : ''
                }`}
              >
                <Checkbox
                  checked={includeAllTreatments || selectedTreatments.includes(treatment)}
                  onCheckedChange={() => handleTreatmentToggle(treatment)}
                  disabled={includeAllTreatments}
                  className="h-3.5 w-3.5"
                />
                {formatTreatmentLabel(treatment)}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isCreating}
          className="flex-1"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Create Link
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
