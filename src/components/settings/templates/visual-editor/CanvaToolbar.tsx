import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  MousePointer,
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  ImageIcon,
  Square,
  Circle,
  Minus,
  MoreHorizontal,
  Table,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  FileText,
  PaintBucket,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Upload,
  Download,
  Save,
  Settings,
  Strikethrough,
  Subscript,
  Superscript,
  IndentIncrease,
  IndentDecrease,
  Link,
  Frame
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  // Text formatting
  selectedBlock?: any;
  onUpdateBlock?: (updates: any) => void;
  // File operations
  onSave?: () => void;
  onInsertImage?: () => void;
  onInsertTable?: () => void;
  onInsertShape?: (shape: string) => void;
  // Style operations
  onApplyHeading?: (level: number) => void;
  onToggleBold?: () => void;
  onToggleItalic?: () => void;
  onToggleUnderline?: () => void;
  onToggleStrikethrough?: () => void;
  onInsertLink?: () => void;
}

const fontFamilies = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Courier New", value: "Courier New, monospace" }
];

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

const colorPresets = [
  "#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF",
  "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#800000", "#008000", "#000080", "#808000", "#800080", "#008080",
  "#415e6b", "#0ea5e9", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6"
];

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
  onAlignRight,
  selectedBlock,
  onUpdateBlock,
  onSave,
  onInsertImage,
  onInsertTable,
  onInsertShape,
  onApplyHeading,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrikethrough,
  onInsertLink
}: CanvaToolbarProps) => {
  const isMobile = useIsMobile();
  
  const updateBlockStyle = (field: string, value: any) => {
    if (!selectedBlock || !onUpdateBlock) return;
    
    const currentStyle = selectedBlock.content?.style || {};
    onUpdateBlock({
      style: {
        ...currentStyle,
        [field]: value
      }
    });
  };

  const currentStyle = selectedBlock?.content?.style || {};

  return (
    <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2">
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        {/* File Operations */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            title="Save Template"
          >
            <Save className="h-4 w-4 sm:mr-1" />
            {!isMobile && "Save"}
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

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
            variant={selectedTool === 'text' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolChange?.('text')}
            className="h-8 w-8 p-0"
            title="Text Tool"
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Insert Content */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onInsertImage}
            className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4 sm:mr-1" />
            {!isMobile && "Image"}
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                title="Insert Shape"
              >
                <Square className="h-4 w-4 sm:mr-1" />
                {!isMobile && "Shape"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onInsertShape?.('rectangle')}
                  className="h-8 w-8 p-0"
                  title="Rectangle"
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onInsertShape?.('circle')}
                  className="h-8 w-8 p-0"
                  title="Circle"
                >
                  <Circle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onInsertShape?.('line')}
                  className="h-8 w-8 p-0"
                  title="Line"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            onClick={onInsertTable}
            className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            title="Insert Table"
          >
            <Table className="h-4 w-4 sm:mr-1" />
            {!isMobile && "Table"}
          </Button>
        </div>

        {hasSelection && (
          <>
            <Separator orientation="vertical" className="h-6" />

            {/* Headings */}
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                    title="Headings"
                  >
                    <Heading1 className="h-4 w-4 sm:mr-1" />
                    {!isMobile && "Style"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onApplyHeading?.(1)}
                      className="w-full justify-start"
                    >
                      <Heading1 className="h-4 w-4 mr-2" />
                      Heading 1
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onApplyHeading?.(2)}
                      className="w-full justify-start"
                    >
                      <Heading2 className="h-4 w-4 mr-2" />
                      Heading 2
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onApplyHeading?.(3)}
                      className="w-full justify-start"
                    >
                      <Heading3 className="h-4 w-4 mr-2" />
                      Heading 3
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onApplyHeading?.(0)}
                      className="w-full justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Normal Text
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Font Formatting */}
            <div className="flex items-center gap-1">
              {!isMobile && (
                <>
                  <Select
                    value={currentStyle.fontFamily || 'Inter, sans-serif'}
                    onValueChange={(value) => updateBlockStyle('fontFamily', value)}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[999]">
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={currentStyle.fontSize?.replace('px', '') || '16'}
                    onValueChange={(value) => updateBlockStyle('fontSize', `${value}px`)}
                  >
                    <SelectTrigger className="w-16 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[999]">
                      {fontSizes.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              <Button
                variant={currentStyle.fontWeight === 'bold' ? 'default' : 'ghost'}
                size="sm"
                onClick={onToggleBold}
                className="h-8 w-8 p-0"
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={currentStyle.fontStyle === 'italic' ? 'default' : 'ghost'}
                size="sm"
                onClick={onToggleItalic}
                className="h-8 w-8 p-0"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant={currentStyle.textDecoration === 'underline' ? 'default' : 'ghost'}
                size="sm"
                onClick={onToggleUnderline}
                className="h-8 w-8 p-0"
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button
                variant={currentStyle.textDecoration === 'line-through' ? 'default' : 'ghost'}
                size="sm"
                onClick={onToggleStrikethrough}
                className="h-8 w-8 p-0"
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Text Color & Background */}
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 relative"
                    title="Text Color"
                  >
                    <Type className="h-4 w-4" />
                    <div 
                      className="absolute bottom-0.5 left-1 right-1 h-0.5 rounded"
                      style={{ backgroundColor: currentStyle.color || '#000000' }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Text Color</Label>
                      <div className="grid grid-cols-6 gap-1">
                        {colorPresets.map((color) => (
                          <Button
                            key={color}
                            variant="ghost"
                            size="sm"
                            onClick={() => updateBlockStyle('color', color)}
                            className="h-8 w-8 p-0 border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Custom Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={currentStyle.color || '#000000'}
                          onChange={(e) => updateBlockStyle('color', e.target.value)}
                          className="w-12 h-8 p-0 border rounded cursor-pointer"
                        />
                        <Input
                          value={currentStyle.color || '#000000'}
                          onChange={(e) => updateBlockStyle('color', e.target.value)}
                          placeholder="#000000"
                          className="flex-1 h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 relative"
                    title="Background Color"
                  >
                    <PaintBucket className="h-4 w-4" />
                    <div 
                      className="absolute bottom-0.5 left-1 right-1 h-0.5 rounded"
                      style={{ backgroundColor: currentStyle.backgroundColor || '#ffffff' }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Background Color</Label>
                      <div className="grid grid-cols-6 gap-1">
                        {colorPresets.map((color) => (
                          <Button
                            key={color}
                            variant="ghost"
                            size="sm"
                            onClick={() => updateBlockStyle('backgroundColor', color)}
                            className="h-8 w-8 p-0 border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Custom Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={currentStyle.backgroundColor || '#ffffff'}
                          onChange={(e) => updateBlockStyle('backgroundColor', e.target.value)}
                          className="w-12 h-8 p-0 border rounded cursor-pointer"
                        />
                        <Input
                          value={currentStyle.backgroundColor || '#ffffff'}
                          onChange={(e) => updateBlockStyle('backgroundColor', e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1 h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Alignment */}
            <div className="flex items-center gap-1">
              <Button
                variant={currentStyle.textAlign === 'left' ? 'default' : 'ghost'}
                size="sm"
                onClick={onAlignLeft}
                className="h-8 w-8 p-0"
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={currentStyle.textAlign === 'center' ? 'default' : 'ghost'}
                size="sm"
                onClick={onAlignCenter}
                className="h-8 w-8 p-0"
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={currentStyle.textAlign === 'right' ? 'default' : 'ghost'}
                size="sm"
                onClick={onAlignRight}
                className="h-8 w-8 p-0"
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Borders & Effects */}
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Borders"
                  >
                    <Frame className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Border Style</Label>
                      <Select
                        value={currentStyle.borderStyle || 'none'}
                        onValueChange={(value) => updateBlockStyle('borderStyle', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="dashed">Dashed</SelectItem>
                          <SelectItem value="dotted">Dotted</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Border Width</Label>
                      <Select
                        value={currentStyle.borderWidth || '1px'}
                        onValueChange={(value) => updateBlockStyle('borderWidth', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1px">1px</SelectItem>
                          <SelectItem value="2px">2px</SelectItem>
                          <SelectItem value="3px">3px</SelectItem>
                          <SelectItem value="4px">4px</SelectItem>
                          <SelectItem value="5px">5px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Border Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={currentStyle.borderColor || '#000000'}
                          onChange={(e) => updateBlockStyle('borderColor', e.target.value)}
                          className="w-12 h-8 p-0 border rounded cursor-pointer"
                        />
                        <Input
                          value={currentStyle.borderColor || '#000000'}
                          onChange={(e) => updateBlockStyle('borderColor', e.target.value)}
                          placeholder="#000000"
                          className="flex-1 h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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

        {/* Right side controls */}
        <div className="flex-1" />
        
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
      </div>
    </div>
  );
};