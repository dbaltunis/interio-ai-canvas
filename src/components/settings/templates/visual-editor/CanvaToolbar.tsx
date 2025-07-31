import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Trash2,
  Move,
  MousePointer
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CanvaToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onToggleGrid?: () => void;
  showGrid?: boolean;
  zoomLevel?: number;
  selectedTool?: 'select' | 'move' | 'text' | 'shape';
  onToolChange?: (tool: 'select' | 'move' | 'text' | 'shape') => void;
  hasSelection?: boolean;
  onCopy?: () => void;
  onDelete?: () => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
}

export const CanvaToolbar = ({
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleGrid,
  showGrid = true,
  zoomLevel = 100,
  selectedTool = 'select',
  onToolChange,
  hasSelection = false,
  onCopy,
  onDelete,
  onAlignLeft,
  onAlignCenter,
  onAlignRight
}: CanvaToolbarProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-2">
        {/* History Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            className="h-8 w-8 p-0"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            className="h-8 w-8 p-0"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Tools */}
        <div className="flex items-center gap-1">
          <Button
            variant={selectedTool === 'select' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolChange?.('select')}
            className="h-8 w-8 p-0"
            title="Select Tool"
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedTool === 'move' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolChange?.('move')}
            className="h-8 w-8 p-0"
            title="Move Tool"
          >
            <Move className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            className="h-8 w-8 p-0"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Badge variant="secondary" className="text-xs min-w-[50px] text-center">
            {zoomLevel}%
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomIn}
            className="h-8 w-8 p-0"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 w-8 p-0"
            title="Reset Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Grid Toggle */}
        <Button
          variant={showGrid ? 'default' : 'ghost'}
          size="sm"
          onClick={onToggleGrid}
          className="h-8 w-8 p-0"
          title="Toggle Grid"
        >
          <Grid className="h-4 w-4" />
        </Button>

        {/* Selection-dependent tools */}
        {hasSelection && (
          <>
            <Separator orientation="vertical" className="h-6" />
            
            {/* Alignment */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onAlignLeft}
                className="h-8 w-8 p-0"
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAlignCenter}
                className="h-8 w-8 p-0"
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAlignRight}
                className="h-8 w-8 p-0"
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Copy/Delete */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                className="h-8 w-8 p-0"
                title="Copy"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};