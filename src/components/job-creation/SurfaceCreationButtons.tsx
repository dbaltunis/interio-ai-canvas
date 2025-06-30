
import { Button } from "@/components/ui/button";
import { Home, Square } from "lucide-react";

interface SurfaceCreationButtonsProps {
  onCreateSurface: (surfaceType: 'window' | 'wall') => void;
  isCreating: boolean;
}

export const SurfaceCreationButtons = ({
  onCreateSurface,
  isCreating
}: SurfaceCreationButtonsProps) => {
  return (
    <div className="flex space-x-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onCreateSurface('window')}
        disabled={isCreating}
        className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>{isCreating ? 'Adding Window...' : 'Add Window'}</span>
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onCreateSurface('wall')}
        disabled={isCreating}
        className="flex items-center space-x-2 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 transition-colors"
      >
        <Square className="h-4 w-4" />
        <span>{isCreating ? 'Adding Wall...' : 'Add Wall'}</span>
      </Button>
    </div>
  );
};
