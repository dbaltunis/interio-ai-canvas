import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Image } from 'lucide-react';

interface ImagePreferenceToggleProps {
  preference: 'fabric' | 'treatment';
  onToggle: (preference: 'fabric' | 'treatment') => void;
  className?: string;
}

export const ImagePreferenceToggle: React.FC<ImagePreferenceToggleProps> = ({
  preference,
  onToggle,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image className="h-4 w-4 text-muted-foreground" />
      <Label htmlFor="image-preference" className="text-sm cursor-pointer">
        Show {preference === 'fabric' ? 'Fabric' : 'Treatment'} Image
      </Label>
      <Switch
        id="image-preference"
        checked={preference === 'treatment'}
        onCheckedChange={(checked) => onToggle(checked ? 'treatment' : 'fabric')}
      />
    </div>
  );
};
