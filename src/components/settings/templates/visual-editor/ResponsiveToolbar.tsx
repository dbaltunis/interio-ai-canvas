import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Save, 
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  ImageIcon,
  Square,
  Table,
  Heading1,
  Heading2,
  Heading3,
  FileText,
  Menu,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Grid,
  Eye,
  EyeOff,
  Settings,
  Sparkles
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveToolbarProps {
  hasSelection?: boolean;
  selectedBlock?: any;
  onUpdateBlock?: (updates: any) => void;
  onSave?: () => void;
  onInsertImage?: () => void;
  onInsertTable?: () => void;
  onInsertShape?: (shape: string) => void;
  onToggleBold?: () => void;
  onToggleItalic?: () => void;
  onToggleUnderline?: () => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onApplyHeading?: (level: number) => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleGrid?: () => void;
  onTogglePreview?: () => void;
  showGrid?: boolean;
  showPreview?: boolean;
  zoomLevel?: number;
}

const fontFamilies = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Georgia", value: "Georgia, serif" },
];

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

const colorPresets = [
  "#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF",
  "#ef4444", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"
];

// Advanced Style Panel Component
const AdvancedStylePanel = ({ selectedBlock, onUpdateBlock }: { selectedBlock: any, onUpdateBlock?: (updates: any) => void }) => {
  const updateStyle = (field: string, value: any) => {
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Advanced Styling</h3>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Font Size</Label>
        <Select
          value={currentStyle.fontSize?.replace('px', '') || '16'}
          onValueChange={(value) => updateStyle('fontSize', `${value}px`)}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Background Color</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={currentStyle.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            className="w-12 h-8 p-0 border rounded cursor-pointer"
          />
          <Input
            value={currentStyle.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            placeholder="#ffffff"
            className="flex-1 h-8 font-mono text-xs"
          />
        </div>
      </div>

      {/* Border */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Border</Label>
        <div className="flex items-center gap-2">
          <Select
            value={currentStyle.borderStyle || 'none'}
            onValueChange={(value) => updateStyle('borderStyle', value)}
          >
            <SelectTrigger className="h-8 flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="dotted">Dotted</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={currentStyle.borderWidth?.replace('px', '') || '1'}
            onChange={(e) => updateStyle('borderWidth', `${e.target.value}px`)}
            placeholder="Width"
            className="w-16 h-8 text-xs"
            min="0"
            max="10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={currentStyle.borderColor || '#000000'}
            onChange={(e) => updateStyle('borderColor', e.target.value)}
            className="w-12 h-8 p-0 border rounded cursor-pointer"
          />
          <Input
            value={currentStyle.borderColor || '#000000'}
            onChange={(e) => updateStyle('borderColor', e.target.value)}
            placeholder="#000000"
            className="flex-1 h-8 font-mono text-xs"
          />
        </div>
      </div>

      {/* Padding */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Padding</Label>
        <Input
          value={currentStyle.padding || ''}
          onChange={(e) => updateStyle('padding', e.target.value)}
          placeholder="e.g. 16px or 1rem"
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
};

export const ResponsiveToolbar = ({
  hasSelection = false,
  selectedBlock,
  onUpdateBlock,
  onSave,
  onInsertImage,
  onInsertTable,
  onInsertShape,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onApplyHeading,
  onCopy,
  onDelete,
  onZoomIn,
  onZoomOut,
  onToggleGrid,
  onTogglePreview,
  showGrid = true,
  showPreview = false,
  zoomLevel = 100
}: ResponsiveToolbarProps) => {
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

  // Mobile toolbar content
  const MobileToolbarContent = () => (
    <div className="space-y-4">
      {/* File Operations */}
      <div>
        <h3 className="font-medium mb-2">File</h3>
        <div className="flex gap-2">
          <Button onClick={onSave} size="sm" className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={onTogglePreview} variant="outline" size="sm" className="flex-1">
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* View Controls */}
      <div>
        <h3 className="font-medium mb-2">View</h3>
        <div className="flex gap-2">
          <Button onClick={onZoomOut} variant="outline" size="sm">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button onClick={onToggleGrid} variant="outline" size="sm">
            <Grid className="h-4 w-4" />
          </Button>
          <Button onClick={onZoomIn} variant="outline" size="sm">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{zoomLevel}% zoom</div>
      </div>

      {/* Insert Content */}
      <div>
        <h3 className="font-medium mb-2">Insert</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={onInsertImage} variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Image
          </Button>
          <Button onClick={onInsertTable} variant="outline" size="sm">
            <Table className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button onClick={() => onInsertShape?.('rectangle')} variant="outline" size="sm">
            <Square className="h-4 w-4 mr-2" />
            Shape
          </Button>
        </div>
      </div>

      {/* Format (when selection exists) */}
      {hasSelection && (
        <div>
          <h3 className="font-medium mb-2">Format</h3>
          
          {/* Font Family & Size */}
          <div className="space-y-2 mb-3">
            <Select
              value={currentStyle.fontFamily || 'Inter, sans-serif'}
              onValueChange={(value) => updateBlockStyle('fontFamily', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentStyle.fontSize?.replace('px', '') || '16'}
              onValueChange={(value) => updateBlockStyle('fontSize', `${value}px`)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Formatting */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Button
              variant={currentStyle.fontWeight === 'bold' ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleBold}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={currentStyle.fontStyle === 'italic' ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleItalic}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={currentStyle.textDecoration === 'underline' ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleUnderline}
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          {/* Alignment */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Button onClick={onAlignLeft} variant="outline" size="sm">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button onClick={onAlignCenter} variant="outline" size="sm">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button onClick={onAlignRight} variant="outline" size="sm">
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <Label className="text-xs">Text Color</Label>
            <div className="grid grid-cols-6 gap-1">
              {colorPresets.map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  size="sm"
                  onClick={() => updateBlockStyle('color', color)}
                  className="h-8 w-8 p-0"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Button onClick={onCopy} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button onClick={onDelete} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Desktop toolbar
  const DesktopToolbar = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {/* File Operations */}
      <Button onClick={onSave} size="sm" className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Save
      </Button>
      
      <Separator orientation="vertical" className="h-6" />

      {/* View Controls */}
      <div className="flex items-center gap-1">
        <Button onClick={onZoomOut} variant="outline" size="sm" title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground px-2">{zoomLevel}%</span>
        <Button onClick={onZoomIn} variant="outline" size="sm" title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          onClick={onToggleGrid} 
          variant={showGrid ? "default" : "outline"} 
          size="sm" 
          title="Toggle Grid"
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button onClick={onTogglePreview} variant="outline" size="sm">
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Insert Content */}
      <div className="flex items-center gap-1">
        <Button onClick={onInsertImage} variant="outline" size="sm">
          <ImageIcon className="h-4 w-4 mr-1" />
          Image
        </Button>
        <Button onClick={onInsertTable} variant="outline" size="sm">
          <Table className="h-4 w-4 mr-1" />
          Table
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Square className="h-4 w-4 mr-1" />
              Shape
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => onInsertShape?.('rectangle')} variant="ghost" size="sm">
                Rectangle
              </Button>
              <Button onClick={() => onInsertShape?.('circle')} variant="ghost" size="sm">
                Circle
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Format Controls (when selection exists) */}
      {hasSelection && (
        <>
          <Separator orientation="vertical" className="h-6" />
          
          {/* Font Controls */}
          <div className="flex items-center gap-2">
            <Select
              value={currentStyle.fontFamily || 'Inter, sans-serif'}
              onValueChange={(value) => updateBlockStyle('fontFamily', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentStyle.fontSize?.replace('px', '') || '16'}
              onValueChange={(value) => updateBlockStyle('fontSize', `${value}px`)}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <Button
              variant={currentStyle.fontWeight === 'bold' ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleBold}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={currentStyle.fontStyle === 'italic' ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleItalic}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={currentStyle.textDecoration === 'underline' ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleUnderline}
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <Button onClick={onAlignLeft} variant="outline" size="sm">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button onClick={onAlignCenter} variant="outline" size="sm">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button onClick={onAlignRight} variant="outline" size="sm">
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="grid grid-cols-6 gap-1">
                {colorPresets.map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    size="sm"
                    onClick={() => updateBlockStyle('color', color)}
                    className="h-8 w-8 p-0"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Advanced Styling */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Style
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <AdvancedStylePanel 
                selectedBlock={selectedBlock}
                onUpdateBlock={onUpdateBlock}
              />
            </PopoverContent>
          </Popover>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button onClick={onCopy} variant="outline" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={onDelete} variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="bg-white border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Editor Tools</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <MobileToolbarContent />
                </div>
              </SheetContent>
            </Sheet>
            
            <Button onClick={onTogglePreview} variant="outline" size="sm">
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          
          <Button onClick={onSave} size="sm">
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b px-4 py-2 overflow-x-auto">
      <DesktopToolbar />
    </div>
  );
};