import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
}

export const ErrorFallback = ({ 
  error, 
  resetError, 
  title = "Something went wrong",
  description = "An error occurred while loading this content."
}: ErrorFallbackProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[200px]">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground max-w-md">{description}</p>
        {error && (
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer">Technical details</summary>
            <pre className="mt-2 text-left bg-muted p-2 rounded text-xs">
              {error.message}
            </pre>
          </details>
        )}
      </div>
      <div className="flex gap-2">
        {resetError && (
          <Button onClick={resetError} variant="outline">
            Try Again
          </Button>
        )}
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  );
};