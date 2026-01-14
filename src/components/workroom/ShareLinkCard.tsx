import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Eye, Trash2, Lock, ExternalLink, Users } from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard';
import { useState } from 'react';
import type { ShareLink } from '@/hooks/useShareLinks';

interface ShareLinkCardProps {
  link: ShareLink;
  onDelete: (id: string) => void;
  onEdit?: (link: ShareLink) => void;
  getShareUrl: (token: string) => string;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  work_order: 'Work Order',
  installation: 'Installation',
  fitting: 'Fitting Sheet',
};

const CONTENT_FILTER_LABELS: Record<string, string> = {
  all: 'Full Details',
  field_ready: 'Field-Ready',
  specs_only: 'Specs Only',
};

export const ShareLinkCard: React.FC<ShareLinkCardProps> = ({
  link,
  onDelete,
  onEdit,
  getShareUrl,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = getShareUrl(link.token);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePreview = () => {
    const url = getShareUrl(link.token);
    window.open(url, '_blank');
  };

  const displayName = link.name || DOCUMENT_TYPE_LABELS[link.document_type] || 'Share Link';
  const treatmentCount = link.treatment_filter?.length || 0;

  return (
    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/50 hover:border-border transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{displayName}</span>
          {link.pin && (
            <Lock className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className="text-[10px] h-5">
            {DOCUMENT_TYPE_LABELS[link.document_type]}
          </Badge>
          <Badge variant="outline" className="text-[10px] h-5">
            {CONTENT_FILTER_LABELS[link.content_filter]}
          </Badge>
          {treatmentCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5">
              {treatmentCount} treatment{treatmentCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {link.viewer_count !== undefined && link.viewer_count > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {link.viewer_count} viewer{link.viewer_count !== 1 ? 's' : ''}
            </span>
          )}
          <span>
            Created {new Date(link.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCopy}
          title="Copy link"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handlePreview}
          title="Preview"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(link.id)}
          title="Revoke access"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
