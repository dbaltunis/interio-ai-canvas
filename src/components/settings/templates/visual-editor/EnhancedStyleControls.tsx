import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Palette,
  Type,
  Layout,
  Sparkles,
  Copy,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
} from "lucide-react";

interface EnhancedStyleControlsProps {
  block: any;
  onUpdate: (content: any) => void;
}

const colorPresets = [
  { name: "Brand Blue", value: "#415e6b" },
  { name: "Ocean", value: "#0ea5e9" },
  { name: "Emerald", value: "#10b981" },
  { name: "Company Primary", value: "hsl(var(--company-primary))" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Slate", value: "#64748b" },
  { name: "Black", value: "#000000" }
];

const fontFamilies = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Playfair", value: "Playfair Display, serif" },
  { name: "Merriweather", value: "Merriweather, serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" }
];

export const EnhancedStyleControls = ({ block, onUpdate }: EnhancedStyleControlsProps) => {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  
  const updateStyle = (field: string, value: any) => {
    const currentStyle = block.content?.style || {};
    onUpdate({
      style: {
        ...currentStyle,
        [field]: value
      }
    });
  };

  const updateStyles = (newStyles: any) => {
    const currentStyle = block.content?.style || {};
    onUpdate({
      style: {
        ...currentStyle,
        ...newStyles
      }
    });
  };

  const resetStyles = () => {
    onUpdate({ style: {} });
  };

  const copyStyles = () => {
    navigator.clipboard.writeText(JSON.stringify(block.content?.style || {}));
  };

  const currentStyle = block.content?.style || {};

  return (
    <Card className="w-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Advanced Styling</h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyStyles}
              className="h-8 w-8 p-0"
              title="Copy Styles"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetStyles}
              className="h-8 w-8 p-0"
              title="Reset Styles"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Type</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-6 mt-4">
            {/* Quick Color Themes */}
            <div>
              <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Quick Color Themes
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => updateStyles({ 
                    color: '#1f2937', 
                    backgroundColor: '#ffffff',
                    primaryColor: '#3b82f6' 
                  })}
                  className="h-16 flex flex-col items-center justify-center gap-1 border-2"
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <div className="w-3 h-3 rounded bg-white border"></div>
                    <div className="w-3 h-3 rounded bg-gray-800"></div>
                  </div>
                  <span className="text-xs font-medium">Professional</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateStyles({ 
                    color: '#ffffff', 
                    backgroundColor: '#1f2937',
                    primaryColor: '#10b981' 
                  })}
                  className="h-16 flex flex-col items-center justify-center gap-1 border-2"
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded bg-emerald-500"></div>
                    <div className="w-3 h-3 rounded bg-gray-800"></div>
                    <div className="w-3 h-3 rounded bg-white border"></div>
                  </div>
                  <span className="text-xs font-medium">Dark Mode</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateStyles({ 
                    color: '#7c2d12', 
                    backgroundColor: '#fef7f0',
                    primaryColor: '#ea580c' 
                  })}
                  className="h-16 flex flex-col items-center justify-center gap-1 border-2"
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded bg-orange-600"></div>
                    <div className="w-3 h-3 rounded bg-orange-50 border"></div>
                    <div className="w-3 h-3 rounded bg-orange-900"></div>
                  </div>
                  <span className="text-xs font-medium">Warm</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateStyles({ 
                    color: '#1e293b', 
                    backgroundColor: '#f8fafc',
                    primaryColor: 'hsl(var(--company-primary))' 
                  })}
                  className="h-16 flex flex-col items-center justify-center gap-1 border-2"
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded bg-violet-500"></div>
                    <div className="w-3 h-3 rounded bg-slate-50 border"></div>
                    <div className="w-3 h-3 rounded bg-slate-800"></div>
                  </div>
                  <span className="text-xs font-medium">Modern</span>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Individual Colors */}
            <div className="space-y-4">
              <Label className="text-sm font-medium block">Individual Colors</Label>
              
              {/* Text Color */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Text Color</Label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border-2 border-gray-200 cursor-pointer"
                    style={{ backgroundColor: currentStyle.color || '#000000' }}
                    onClick={() => setActiveColorPicker('text')}
                  />
                  <Input
                    type="color"
                    value={currentStyle.color || '#000000'}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                  />
                  <Input
                    value={currentStyle.color || '#000000'}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    placeholder="#000000"
                    className="flex-1 h-8 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Background Color</Label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border-2 border-gray-200 cursor-pointer"
                    style={{ backgroundColor: currentStyle.backgroundColor || '#ffffff' }}
                    onClick={() => setActiveColorPicker('background')}
                  />
                  <Input
                    type="color"
                    value={currentStyle.backgroundColor || '#ffffff'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                  />
                  <Input
                    value={currentStyle.backgroundColor || '#ffffff'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1 h-8 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Primary/Accent Color */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Accent Color</Label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border-2 border-gray-200 cursor-pointer"
                    style={{ backgroundColor: currentStyle.primaryColor || '#415e6b' }}
                    onClick={() => setActiveColorPicker('primary')}
                  />
                  <Input
                    type="color"
                    value={currentStyle.primaryColor || '#415e6b'}
                    onChange={(e) => updateStyle('primaryColor', e.target.value)}
                    className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                  />
                  <Input
                    value={currentStyle.primaryColor || '#415e6b'}
                    onChange={(e) => updateStyle('primaryColor', e.target.value)}
                    placeholder="#415e6b"
                    className="flex-1 h-8 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Popular Colors */}
            <div>
              <Label className="text-xs text-muted-foreground mb-3 block">Popular Colors</Label>
              <div className="grid grid-cols-8 gap-1">
                {colorPresets.map((color) => (
                  <Button
                    key={color.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => updateStyle('color', color.value)}
                    className="h-8 w-8 p-0 border hover:scale-110 transition-transform"
                    title={`${color.name} - ${color.value}`}
                  >
                    <div 
                      className="w-full h-full rounded"
                      style={{ backgroundColor: color.value }}
                    />
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4 mt-4">
            {/* Font Family */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Font Family</Label>
              <Select
                value={currentStyle.fontFamily || 'Inter, sans-serif'}
                onValueChange={(value) => updateStyle('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Font Size</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[parseInt(currentStyle.fontSize?.replace('px', '') || '16')]}
                  onValueChange={([value]) => updateStyle('fontSize', `${value}px`)}
                  max={72}
                  min={8}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[60px] text-center">
                  {currentStyle.fontSize || '16px'}
                </Badge>
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Text Alignment</Label>
              <div className="flex gap-1">
                <Button
                  variant={currentStyle.textAlign === 'left' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateStyle('textAlign', 'left')}
                  className="h-8 w-8 p-0"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentStyle.textAlign === 'center' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateStyle('textAlign', 'center')}
                  className="h-8 w-8 p-0"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentStyle.textAlign === 'right' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateStyle('textAlign', 'right')}
                  className="h-8 w-8 p-0"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Text Decorations */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Text Style</Label>
              <div className="flex gap-1">
                <Button
                  variant={currentStyle.fontWeight === 'bold' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateStyle('fontWeight', currentStyle.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className="h-8 w-8 p-0"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentStyle.fontStyle === 'italic' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateStyle('fontStyle', currentStyle.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className="h-8 w-8 p-0"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentStyle.textDecoration === 'underline' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateStyle('textDecoration', currentStyle.textDecoration === 'underline' ? 'none' : 'underline')}
                  className="h-8 w-8 p-0"
                >
                  <Underline className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-4">
            {/* Padding */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Padding</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[parseInt(currentStyle.padding?.replace('px', '') || '16')]}
                  onValueChange={([value]) => updateStyle('padding', `${value}px`)}
                  max={100}
                  min={0}
                  step={4}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[60px] text-center">
                  {currentStyle.padding || '16px'}
                </Badge>
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Border Radius</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[parseInt(currentStyle.borderRadius?.replace('px', '') || '0')]}
                  onValueChange={([value]) => updateStyle('borderRadius', `${value}px`)}
                  max={50}
                  min={0}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[60px] text-center">
                  {currentStyle.borderRadius || '0px'}
                </Badge>
              </div>
            </div>

            {/* Border */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Border</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!currentStyle.border}
                  onCheckedChange={(checked) => 
                    updateStyle('border', checked ? '1px solid #e2e8f0' : '')
                  }
                />
                <span className="text-sm">Enable Border</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4 mt-4">
            {/* Drop Shadow */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Drop Shadow</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!currentStyle.boxShadow}
                  onCheckedChange={(checked) => 
                    updateStyle('boxShadow', checked ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '')
                  }
                />
                <span className="text-sm">Enable Shadow</span>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Opacity</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[parseFloat(currentStyle.opacity || '1') * 100]}
                  onValueChange={([value]) => updateStyle('opacity', (value / 100).toString())}
                  max={100}
                  min={0}
                  step={5}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[60px] text-center">
                  {Math.round((parseFloat(currentStyle.opacity || '1')) * 100)}%
                </Badge>
              </div>
            </div>

            {/* Transform */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Rotation</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[parseInt(currentStyle.transform?.match(/rotate\((-?\d+)deg\)/)?.[1] || '0')]}
                  onValueChange={([value]) => updateStyle('transform', `rotate(${value}deg)`)}
                  max={180}
                  min={-180}
                  step={5}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[60px] text-center">
                  {currentStyle.transform?.match(/rotate\((-?\d+)deg\)/)?.[1] || '0'}°
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};