
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
    <div className="flex space-x-3">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onCreateSurface('window')}
        disabled={isCreating}
        className="flex items-center space-x-2 bg-brand-light hover:bg-brand-secondary/10 border-brand-secondary text-brand-primary transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <Home className="h-4 w-4" />
        <span>{isCreating ? 'Adding Window...' : 'Add Window'}</span>
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onCreateSurface('wall')}
        disabled={isCreating}
        className="flex items-center space-x-2 bg-brand-light hover:bg-brand-accent/10 border-brand-accent text-brand-accent transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <Square className="h-4 w-4" />
        <span>{isCreating ? 'Adding Wall...' : 'Add Wall'}</span>
      </Button>
    </div>
  );
};
