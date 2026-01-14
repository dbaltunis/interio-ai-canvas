import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Filter } from 'lucide-react';

export type DocumentType = 'work_order' | 'installation' | 'fitting';
export type ContentFilter = 'all' | 'field_ready' | 'specs_only';

interface ShareSettingsSectionProps {
  documentType: DocumentType;
  contentFilter: ContentFilter;
  onDocumentTypeChange: (type: DocumentType) => void;
  onContentFilterChange: (filter: ContentFilter) => void;
}

export const ShareSettingsSection: React.FC<ShareSettingsSectionProps> = ({
  documentType,
  contentFilter,
  onDocumentTypeChange,
  onContentFilterChange,
}) => {
  return (
    <div className="space-y-2 p-3 border-b border-border">
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
            <SelectItem value="work_order">Work Order</SelectItem>
            <SelectItem value="installation">Installation Instructions</SelectItem>
            <SelectItem value="fitting">Fitting Instructions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Filter */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Filter className="h-3 w-3" />
          Content
        </label>
        <Select value={contentFilter} onValueChange={(v) => onContentFilterChange(v as ContentFilter)}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex flex-col items-start">
                <span>All content</span>
                <span className="text-[10px] text-muted-foreground">Full details for internal team</span>
              </div>
            </SelectItem>
            <SelectItem value="field_ready">
              <div className="flex flex-col items-start">
                <span>Field-ready</span>
                <span className="text-[10px] text-muted-foreground">No pricing, for installers</span>
              </div>
            </SelectItem>
            <SelectItem value="specs_only">
              <div className="flex flex-col items-start">
                <span>Specs only</span>
                <span className="text-[10px] text-muted-foreground">Measurements only, for manufacturers</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
