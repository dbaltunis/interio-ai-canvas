
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Info } from "lucide-react";

interface SurfaceCreationButtonsProps {
  onCreateSurface: (surfaceType: 'window') => void;
  isCreating: boolean;
  hasSurfaces?: boolean;
}

export const SurfaceCreationButtons = ({
  onCreateSurface,
  isCreating,
  hasSurfaces = false
}: SurfaceCreationButtonsProps) => {
  
  const handleWindowClick = () => {
    console.log("Window button clicked, calling onCreateSurface with 'window'");
    onCreateSurface('window');
  };

  return (
    <div className="space-y-3">
      {!hasSurfaces && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>First, add windows:</strong> Create windows before adding window treatments. Each treatment needs a window to attach to.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex space-x-3">
        <Button
          size="sm"
          variant="outline"
          onClick={handleWindowClick}
          disabled={isCreating}
          className="flex items-center space-x-2 bg-brand-light hover:bg-brand-secondary/10 border-brand-secondary text-brand-primary transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Home className="h-4 w-4" />
          <span>{isCreating ? 'Adding Window...' : 'Add Window'}</span>
        </Button>
      </div>
    </div>
  );
};
