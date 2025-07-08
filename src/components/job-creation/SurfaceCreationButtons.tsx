
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
  
  const handleWindowClick = () => {
    console.log("Window button clicked, calling onCreateSurface with 'window'");
    onCreateSurface('window');
  };

  const handleWallClick = () => {
    console.log("Wall button clicked, calling onCreateSurface with 'wall'");
    onCreateSurface('wall');
  };

  return (
    <div className="flex space-x-3">
      <Button
        size="sm"
        variant="outline"
        onClick={handleWindowClick}
        disabled={isCreating}
        className="flex items-center space-x-2"
      >
        <Home className="h-4 w-4" />
        <span>{isCreating ? 'Adding Window...' : 'Add Window'}</span>
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleWallClick}
        disabled={isCreating}
        className="flex items-center space-x-2"
      >
        <Square className="h-4 w-4" />
        <span>{isCreating ? 'Adding Wall...' : 'Add Wall'}</span>
      </Button>
    </div>
  );
};
