import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Palette, Type, Layout, AlignJustify, Image as ImageIcon } from "lucide-react";

interface TemplateStyleCustomizerProps {
  templateStyle: any;
  onStyleChange: (style: any) => void;
}

export const TemplateStyleCustomizer: React.FC<TemplateStyleCustomizerProps> = ({
  templateStyle = {},
  onStyleChange
}) => {
  const updateStyle = (category: string, property: string, value: any) => {
    const newStyle = {
      ...templateStyle,
      [category]: {
        ...templateStyle[category],
        [property]: value
      }
    };
    onStyleChange(newStyle);
  };

  const colorSchemes = [
    { name: 'Professional Blue', primary: '#1e40af', secondary: '#eff6ff', accent: '#3b82f6' },
    { name: 'Luxury Purple', primary: '#7c3aed', secondary: '#faf5ff', accent: '#a855f7' },
    { name: 'Nature Green', primary: '#059669', secondary: '#f0fdf4', accent: '#10b981' },
    { name: 'Elegant Black', primary: '#1f2937', secondary: '#f9fafb', accent: '#6b7280' },
    { name: 'Warm Orange', primary: '#ea580c', secondary: '#fff7ed', accent: '#fb923c' },
  ];

  const fontFamilies = [
    'Inter, sans-serif',
    'Roboto, sans-serif', 
    'Poppins, sans-serif',
    'Playfair Display, serif',
    'Montserrat, sans-serif',
    'Open Sans, sans-serif'
  ];

  return (
    <div className="space-y-6">
      {/* Color Scheme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Scheme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {colorSchemes.map((scheme) => (
              <div
                key={scheme.name}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => updateStyle('colors', 'scheme', scheme)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{scheme.name}</span>
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: scheme.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: scheme.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: scheme.accent }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Primary Color</Label>
              <Input
                type="color"
                value={templateStyle.colors?.primary || '#1e40af'}
                onChange={(e) => updateStyle('colors', 'primary', e.target.value)}
                className="w-full h-10 mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Background Color</Label>
              <Input
                type="color"
                value={templateStyle.colors?.background || '#ffffff'}
                onChange={(e) => updateStyle('colors', 'background', e.target.value)}
                className="w-full h-10 mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Font Family</Label>
            <Select 
              value={templateStyle.typography?.fontFamily || 'Inter, sans-serif'}
              onValueChange={(value) => updateStyle('typography', 'fontFamily', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">Header Font Size: {templateStyle.typography?.headerSize || 32}px</Label>
            <Slider
              value={[templateStyle.typography?.headerSize || 32]}
              onValueChange={([value]) => updateStyle('typography', 'headerSize', value)}
              min={20}
              max={48}
              step={2}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm">Body Font Size: {templateStyle.typography?.bodySize || 16}px</Label>
            <Slider
              value={[templateStyle.typography?.bodySize || 16]}
              onValueChange={([value]) => updateStyle('typography', 'bodySize', value)}
              min={12}
              max={20}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm">Line Height: {templateStyle.typography?.lineHeight || 1.5}</Label>
            <Slider
              value={[templateStyle.typography?.lineHeight || 1.5]}
              onValueChange={([value]) => updateStyle('typography', 'lineHeight', value)}
              min={1.2}
              max={2.0}
              step={0.1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Layout & Spacing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Layout & Spacing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Page Padding: {templateStyle.layout?.padding || 32}px</Label>
            <Slider
              value={[templateStyle.layout?.padding || 32]}
              onValueChange={([value]) => updateStyle('layout', 'padding', value)}
              min={16}
              max={64}
              step={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm">Section Spacing: {templateStyle.layout?.sectionSpacing || 24}px</Label>
            <Slider
              value={[templateStyle.layout?.sectionSpacing || 24]}
              onValueChange={([value]) => updateStyle('layout', 'sectionSpacing', value)}
              min={8}
              max={48}
              step={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm">Border Radius: {templateStyle.layout?.borderRadius || 8}px</Label>
            <Slider
              value={[templateStyle.layout?.borderRadius || 8]}
              onValueChange={([value]) => updateStyle('layout', 'borderRadius', value)}
              min={0}
              max={20}
              step={2}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm">Shadow Intensity</Label>
            <Select 
              value={templateStyle.layout?.shadow || 'medium'}
              onValueChange={(value) => updateStyle('layout', 'shadow', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Shadow</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Brand Elements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Brand Elements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Logo Size: {templateStyle.brand?.logoSize || 64}px</Label>
            <Slider
              value={[templateStyle.brand?.logoSize || 64]}
              onValueChange={([value]) => updateStyle('brand', 'logoSize', value)}
              min={32}
              max={128}
              step={8}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm">Logo Position</Label>
            <Select 
              value={templateStyle.brand?.logoPosition || 'left'}
              onValueChange={(value) => updateStyle('brand', 'logoPosition', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">Show Company Watermark</Label>
            <Select 
              value={templateStyle.brand?.showWatermark ? 'yes' : 'no'}
              onValueChange={(value) => updateStyle('brand', 'showWatermark', value === 'yes')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Template Mood */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlignJustify className="h-5 w-5" />
            Template Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {['Professional', 'Modern', 'Elegant', 'Fun', 'Minimalist', 'Bold'].map((mood) => (
              <Button
                key={mood}
                variant={templateStyle.mood === mood ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateStyle('general', 'mood', mood)}
                className="justify-start"
              >
                {mood}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};