import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LazyLoadErrorProps {
  moduleName: string;
  error: Error | null;
}

/**
 * Error component shown when lazy loading fails after all retries.
 * Provides a user-friendly message and reload button.
 */
export const LazyLoadError = ({ moduleName, error }: LazyLoadErrorProps) => {
  return (
    <div className="p-6 text-center space-y-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
        <RefreshCw className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="text-destructive font-medium">Failed to load {moduleName}</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {error?.message || 'An unexpected error occurred'}
        </p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => window.location.reload()}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Reload Page
      </Button>
    </div>
  );
};
