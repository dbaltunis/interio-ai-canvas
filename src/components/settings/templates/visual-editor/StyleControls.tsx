import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Paintbrush,
  Layers,
  Square,
  Circle,
  Move,
  RotateCw,
  Copy,
  Trash2
} from "lucide-react";

interface StyleControlsProps {
  selectedBlock?: any;
  onStyleChange: (blockId: string, styles: any) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const colorPalette = [
  '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' }
];

export const StyleControls = ({ selectedBlock, onStyleChange, isCollapsed, onToggle }: StyleControlsProps) => {
  const [activeTab, setActiveTab] = React.useState<'style' | 'layout' | 'effects'>('style');

  if (!selectedBlock) {
    return (
      <div className={`${isCollapsed ? 'w-12' : 'w-80'} border-l bg-gray-50 flex items-center justify-center`}>
        {isCollapsed ? (
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <Paintbrush className="h-4 w-4" />
          </Button>
        ) : (
          <div className="text-center p-6">
            <Layers className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Select a block to edit its style</p>
          </div>
        )}
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <div className="w-12 border-l bg-gray-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full h-12 rounded-none border-b"
        >
          <Paintbrush className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const currentStyle = selectedBlock.content?.style || {};

  const updateStyle = (newStyles: any) => {
    onStyleChange(selectedBlock.id, {
      ...selectedBlock.content,
      style: { ...currentStyle, ...newStyles }
    });
  };

  const renderStyleTab = () => (
    <div className="space-y-6">
      {/* Typography */}
      <div className="space-y-3">
        <Label className="font-medium">Typography</Label>
        
        <div className="space-y-2">
          <Label className="text-sm">Font Family</Label>
          <Select
            value={currentStyle.fontFamily || 'Arial'}
            onValueChange={(value) => updateStyle({ fontFamily: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-sm">Size</Label>
            <Input
              type="number"
              value={parseInt(currentStyle.fontSize) || 16}
              onChange={(e) => updateStyle({ fontSize: `${e.target.value}px` })}
              min="8"
              max="72"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Weight</Label>
            <Select
              value={currentStyle.fontWeight || 'normal'}
              onValueChange={(value) => updateStyle({ fontWeight: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">Light</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Semi Bold</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={currentStyle.fontStyle === 'italic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateStyle({ fontStyle: currentStyle.fontStyle === 'italic' ? 'normal' : 'italic' })}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={currentStyle.textDecoration === 'underline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateStyle({ textDecoration: currentStyle.textDecoration === 'underline' ? 'none' : 'underline' })}
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={currentStyle.textAlign === 'left' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateStyle({ textAlign: 'left' })}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={currentStyle.textAlign === 'center' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateStyle({ textAlign: 'center' })}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={currentStyle.textAlign === 'right' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateStyle({ textAlign: 'right' })}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div className="space-y-3">
        <Label className="font-medium">Colors</Label>
        
        <div className="space-y-2">
          <Label className="text-sm">Text Color</Label>
          <div className="grid grid-cols-7 gap-1 p-2 border rounded">
            {colorPalette.map((color) => (
              <Button
                key={color}
                className="w-6 h-6 p-0 rounded border-2"
                style={{ 
                  backgroundColor: color,
                  borderColor: currentStyle.color === color ? '#3b82f6' : 'transparent'
                }}
                onClick={() => updateStyle({ color })}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Background Color</Label>
          <div className="grid grid-cols-7 gap-1 p-2 border rounded">
            {colorPalette.map((color) => (
              <Button
                key={color}
                className="w-6 h-6 p-0 rounded border-2"
                style={{ 
                  backgroundColor: color,
                  borderColor: currentStyle.backgroundColor === color ? '#3b82f6' : 'transparent'
                }}
                onClick={() => updateStyle({ backgroundColor: color })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-6">
      {/* Spacing */}
      <div className="space-y-3">
        <Label className="font-medium">Spacing</Label>
        
        <div className="space-y-2">
          <Label className="text-sm">Padding</Label>
          <Input
            placeholder="e.g. 16px or 1rem"
            value={currentStyle.padding || ''}
            onChange={(e) => updateStyle({ padding: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Margin</Label>
          <Input
            placeholder="e.g. 16px or 1rem"
            value={currentStyle.margin || ''}
            onChange={(e) => updateStyle({ margin: e.target.value })}
          />
        </div>
      </div>

      <Separator />

      {/* Border */}
      <div className="space-y-3">
        <Label className="font-medium">Border</Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-sm">Style</Label>
            <Select
              value={currentStyle.borderStyle || 'none'}
              onValueChange={(value) => updateStyle({ borderStyle: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Width</Label>
            <Input
              placeholder="1px"
              value={currentStyle.borderWidth || ''}
              onChange={(e) => updateStyle({ borderWidth: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Border Radius</Label>
          <Input
            placeholder="e.g. 8px"
            value={currentStyle.borderRadius || ''}
            onChange={(e) => updateStyle({ borderRadius: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  const renderEffectsTab = () => (
    <div className="space-y-6">
      {/* Shadow */}
      <div className="space-y-3">
        <Label className="font-medium">Shadow</Label>
        
        <div className="space-y-2">
          <Label className="text-sm">Box Shadow</Label>
          <Textarea
            placeholder="e.g. 0 4px 6px rgba(0, 0, 0, 0.1)"
            value={currentStyle.boxShadow || ''}
            onChange={(e) => updateStyle({ boxShadow: e.target.value })}
          />
        </div>
      </div>

      <Separator />

      {/* Opacity */}
      <div className="space-y-3">
        <Label className="font-medium">Opacity</Label>
        <Slider
          value={[parseFloat(currentStyle.opacity) || 1]}
          onValueChange={([value]) => updateStyle({ opacity: value })}
          max={1}
          min={0}
          step={0.1}
          className="w-full"
        />
      </div>

      <Separator />

      {/* Transform */}
      <div className="space-y-3">
        <Label className="font-medium">Transform</Label>
        
        <div className="space-y-2">
          <Label className="text-sm">Rotate (degrees)</Label>
          <Input
            type="number"
            placeholder="0"
            value={extractRotation(currentStyle.transform)}
            onChange={(e) => updateStyle({ 
              transform: `rotate(${e.target.value}deg)` 
            })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-80 border-l bg-white overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Style Properties</h3>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <Move className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-1">
          <Button
            variant={activeTab === 'style' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('style')}
          >
            <Type className="h-4 w-4 mr-1" />
            Style
          </Button>
          <Button
            variant={activeTab === 'layout' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('layout')}
          >
            <Square className="h-4 w-4 mr-1" />
            Layout
          </Button>
          <Button
            variant={activeTab === 'effects' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('effects')}
          >
            <Circle className="h-4 w-4 mr-1" />
            Effects
          </Button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'style' && renderStyleTab()}
        {activeTab === 'layout' && renderLayoutTab()}
        {activeTab === 'effects' && renderEffectsTab()}
      </div>

      {/* Block Actions */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

const extractRotation = (transform: string): number => {
  if (!transform) return 0;
  const match = transform.match(/rotate\((-?\d+)deg\)/);
  return match ? parseInt(match[1]) : 0;
};