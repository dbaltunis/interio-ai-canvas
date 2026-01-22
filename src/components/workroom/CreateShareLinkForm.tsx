import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, FileText, LayoutGrid } from 'lucide-react';
import { ShareItemPicker } from './ShareItemPicker';
import type { CreateShareLinkInput } from '@/hooks/useShareLinks';

interface CreateShareLinkFormProps {
  projectId: string;
  isCreating: boolean;
  onSubmit: (input: CreateShareLinkInput) => Promise<void>;
  onCancel: () => void;
}

export const CreateShareLinkForm: React.FC<CreateShareLinkFormProps> = ({
  projectId,
  isCreating,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [documentType, setDocumentType] = useState<'work_order' | 'installation' | 'fitting'>('work_order');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [includeAllItems, setIncludeAllItems] = useState(true);

  // Track if user explicitly unchecked "All Items"
  const handleSelectionChange = (itemIds: string[]) => {
    setSelectedItemIds(itemIds);
    setIncludeAllItems(itemIds.length === 0 && selectedItemIds.length === 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: name || undefined,
      document_type: documentType,
      orientation: orientation,
      item_filter: includeAllItems ? [] : selectedItemIds,
    });
  };

  // Calculate button text
  const getButtonText = () => {
    if (isCreating) return 'Creating...';
    if (includeAllItems || selectedItemIds.length === 0) return 'Create Link';
    return `Create Link (${selectedItemIds.length} items)`;
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
        <Label className="text-xs">Page Orientation</Label>
        <Select value={orientation} onValueChange={(v) => setOrientation(v as 'portrait' | 'landscape')}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="landscape">
              <span className="flex items-center gap-2">
                <LayoutGrid className="h-3 w-3" />
                Landscape (Wide)
              </span>
            </SelectItem>
            <SelectItem value="portrait">
              <span className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                Portrait (Tall)
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Item Picker - replaces the old treatment filter */}
      <ShareItemPicker
        projectId={projectId}
        selectedItems={selectedItemIds}
        onSelectionChange={(ids) => {
          setSelectedItemIds(ids);
          // If user selects nothing after having something, they want all
          setIncludeAllItems(ids.length === 0);
        }}
      />

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
          disabled={isCreating || (!includeAllItems && selectedItemIds.length === 0)}
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
              {getButtonText()}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
