import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  MapPin, 
  Calendar, 
  Layers, 
  ClipboardCheck, 
  ExternalLink,
  Info
} from 'lucide-react';

interface SharePreviewInfoProps {
  shareUrl?: string;
  onPreview?: () => void;
}

export const SharePreviewInfo: React.FC<SharePreviewInfoProps> = ({
  shareUrl,
  onPreview
}) => {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-2 mb-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="text-sm font-medium">What's included:</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span>Client contact</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>Site address</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>Install date</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5" />
            <span>All treatments</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span>Measurements & checklists</span>
          </div>
        </div>
        
        {shareUrl && (
          <Button 
            variant="link" 
            size="sm" 
            className="mt-2 h-auto p-0 text-xs gap-1"
            onClick={onPreview}
          >
            <ExternalLink className="h-3 w-3" />
            Preview what they'll see
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
