import React from 'react';
import { ModernProgress } from '@/components/ui/modern-progress';
import { Button } from '@/components/ui/button';
import { Pause, Play, X } from 'lucide-react';

interface ImportProgressIndicatorProps {
  current: number;
  total: number;
  percentage: number;
  successCount: number;
  updatedCount: number;
  errorCount: number;
  status: 'preparing' | 'processing' | 'paused' | 'completed' | 'error';
  canPause: boolean;
  canResume: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export const ImportProgressIndicator: React.FC<ImportProgressIndicatorProps> = ({
  current,
  total,
  percentage,
  successCount,
  updatedCount,
  errorCount,
  status,
  canPause,
  canResume,
  onPause,
  onResume,
  onCancel,
}) => {
  const getStatusText = () => {
    switch (status) {
      case 'preparing':
        return 'Preparing import...';
      case 'processing':
        return `Processing ${current}/${total} items`;
      case 'paused':
        return `Paused at ${current}/${total} items`;
      case 'completed':
        return 'Import completed';
      case 'error':
        return 'Import failed';
      default:
        return '';
    }
  };

  const getProgressVariant = () => {
    if (errorCount > 0 && status === 'error') return 'error';
    if (status === 'completed') return 'success';
    if (status === 'paused') return 'warning';
    return 'default';
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{getStatusText()}</p>
          <p className="text-sm text-muted-foreground">{percentage}%</p>
        </div>
        
        <ModernProgress
          value={percentage}
          max={100}
          size="md"
          variant={getProgressVariant()}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Inserted</p>
          <p className="font-semibold text-green-600 dark:text-green-400">{successCount}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Updated</p>
          <p className="font-semibold text-yellow-600 dark:text-yellow-400">{updatedCount}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Errors</p>
          <p className="font-semibold text-red-600 dark:text-red-400">{errorCount}</p>
        </div>
      </div>

      {status !== 'completed' && status !== 'error' && (
        <div className="flex gap-2">
          {canPause && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPause}
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause Import
            </Button>
          )}
          {canResume && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResume}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume Import
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
