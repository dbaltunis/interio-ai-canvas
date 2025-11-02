import React, { useEffect, useState } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export const AutoSaveIndicator = ({ status, className }: AutoSaveIndicatorProps) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status === 'saved') {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === 'idle' && !showSaved) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm transition-all',
        className
      )}
    >
      {status === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}
      {(status === 'saved' || showSaved) && (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-medium">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-destructive">Error saving</span>
        </>
      )}
    </div>
  );
};
