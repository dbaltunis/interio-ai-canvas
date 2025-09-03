import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Grid3x3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Group,
  Ungroup,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Maximize,
  Minimize,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";

interface LayoutElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'container';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  groupId?: string;
}

interface AdvancedLayoutToolsProps {
  selectedElements: LayoutElement[];
  onElementUpdate: (elements: LayoutElement[]) => void;
  onAlignment: (type: string) => void;
  onDistribution: (type: string) => void;
  onGrouping: (action: 'group' | 'ungroup') => void;
}

export const AdvancedLayoutTools = ({
  selectedElements,
  onElementUpdate,
  onAlignment,
  onDistribution,
  onGrouping
}: AdvancedLayoutToolsProps) => {
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState([10]);
  const [showRulers, setShowRulers] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [smartSnap, setSmartSnap] = useState(true);

  const hasSelection = selectedElements.length > 0;
  const multipleSelected = selectedElements.length > 1;

  const handleAlignment = (type: string) => {
    onAlignment(type);
    toast(`Elements aligned ${type}`);
  };

  const handleDistribution = (type: string) => {
    if (selectedElements.length < 3) {
      toast("Select at least 3 elements to distribute");
      return;
    }
    onDistribution(type);
    toast(`Elements distributed ${type}`);
  };

  const handleTransform = (property: string, value: number) => {
    const updatedElements = selectedElements.map(element => ({
      ...element,
      [property]: value
    }));
    onElementUpdate(updatedElements);
  };

  const handleLock = () => {
    const updatedElements = selectedElements.map(element => ({
      ...element,
      locked: !element.locked
    }));
    onElementUpdate(updatedElements);
    toast(selectedElements[0]?.locked ? "Elements unlocked" : "Elements locked");
  };

  const handleDuplicate = () => {
    // Duplicate logic would be handled by parent component
    toast("Elements duplicated");
  };

  const handleDelete = () => {
    // Delete logic would be handled by parent component
    toast("Elements deleted");
  };

  const handleLayering = (direction: 'front' | 'back' | 'forward' | 'backward') => {
    const updatedElements = selectedElements.map(element => {
      let newZIndex = element.zIndex;
      switch (direction) {
        case 'front':
          newZIndex = 1000;
          break;
        case 'back':
          newZIndex = 0;
          break;
        case 'forward':
          newZIndex = element.zIndex + 1;
          break;
        case 'backward':
          newZIndex = Math.max(0, element.zIndex - 1);
          break;
      }
      return { ...element, zIndex: newZIndex };
    });
    onElementUpdate(updatedElements);
    toast(`Moved to ${direction}`);
  };

  return (
    <div className="space-y-4">
      {/* Grid & Snapping */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Grid3x3 className="h-4 w-4" />
            Grid & Snapping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Snap to Grid</Label>
              <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Smart Guides</Label>
              <Switch checked={smartSnap} onCheckedChange={setSmartSnap} />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Rulers</Label>
              <Switch checked={showRulers} onCheckedChange={setShowRulers} />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Guides</Label>
              <Switch checked={showGuides} onCheckedChange={setShowGuides} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Grid Size: {gridSize[0]}px</Label>
            <Slider
              value={gridSize}
              onValueChange={setGridSize}
              max={50}
              min={5}
              step={5}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Alignment Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlignCenter className="h-4 w-4" />
            Alignment
            {!multipleSelected && (
              <Badge variant="outline" className="text-xs">Select 2+ items</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Horizontal Alignment */}
          <div className="space-y-2">
            <Label className="text-xs">Horizontal</Label>
            <div className="grid grid-cols-4 gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAlignment('left')}
                disabled={!multipleSelected}
                className="h-8 p-0"
              >
                <AlignLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAlignment('center-h')}
                disabled={!multipleSelected}
                className="h-8 p-0"
              >
                <AlignCenter className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAlignment('right')}
                disabled={!multipleSelected}
                className="h-8 p-0"
              >
                <AlignRight className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAlignment('justify')}
                disabled={!multipleSelected}
                className="h-8 p-0"
              >
                <AlignJustify className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Vertical Alignment */}
          <div className="space-y-2">
            <Label className="text-xs">Vertical</Label>
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAlignment('top')}
                disabled={!multipleSelected}
                className="h-8 p-0"
              >
                <div className="w-3 h-3 flex items-start justify-center">
                  <div className="w-2 h-0.5 bg-current" />
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAlignment('center-v')}
                disabled={!multipleSelected}
                className="h-8 p-0"
              >
                <div className="w-3 h-3 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-current" />
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAlignment('bottom')}
                disabled={!multipleSelected}
                className="h-8 p-0"
              >
                <div className="w-3 h-3 flex items-end justify-center">
                  <div className="w-2 h-0.5 bg-current" />
                </div>
              </Button>
            </div>
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            <Label className="text-xs">Distribution</Label>
            <div className="grid grid-cols-2 gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDistribution('horizontal')}
                disabled={selectedElements.length < 3}
                className="h-8 text-xs"
              >
                Horizontal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDistribution('vertical')}
                disabled={selectedElements.length < 3}
                className="h-8 text-xs"
              >
                Vertical
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transform Controls */}
      {hasSelection && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Move className="h-4 w-4" />
              Transform
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">X Position</Label>
                <input
                  type="number"
                  value={selectedElements[0]?.x || 0}
                  onChange={(e) => handleTransform('x', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-xs border rounded"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Y Position</Label>
                <input
                  type="number"
                  value={selectedElements[0]?.y || 0}
                  onChange={(e) => handleTransform('y', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-xs border rounded"
                />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Width</Label>
                <input
                  type="number"
                  value={selectedElements[0]?.width || 0}
                  onChange={(e) => handleTransform('width', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-xs border rounded"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Height</Label>
                <input
                  type="number"
                  value={selectedElements[0]?.height || 0}
                  onChange={(e) => handleTransform('height', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-xs border rounded"
                />
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <Label className="text-xs">Rotation: {selectedElements[0]?.rotation || 0}°</Label>
              <Slider
                value={[selectedElements[0]?.rotation || 0]}
                onValueChange={([value]) => handleTransform('rotation', value)}
                max={360}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Transform Actions */}
            <div className="grid grid-cols-2 gap-1">
              <Button variant="outline" size="sm" className="h-8">
                <FlipHorizontal className="h-3 w-3 mr-1" />
                Flip H
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <FlipVertical className="h-3 w-3 mr-1" />
                Flip V
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layer Management */}
      {hasSelection && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Layers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-1">
              <Button variant="outline" size="sm" onClick={() => handleLayering('front')}>
                To Front
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleLayering('back')}>
                To Back
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleLayering('forward')}>
                Forward
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleLayering('backward')}>
                Backward
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Element Actions */}
      {hasSelection && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MoreHorizontal className="h-4 w-4" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Grouping */}
            {multipleSelected && (
              <div className="grid grid-cols-2 gap-1">
                <Button variant="outline" size="sm" onClick={() => onGrouping('group')}>
                  <Group className="h-3 w-3 mr-1" />
                  Group
                </Button>
                <Button variant="outline" size="sm" onClick={() => onGrouping('ungroup')}>
                  <Ungroup className="h-3 w-3 mr-1" />
                  Ungroup
                </Button>
              </div>
            )}

            {/* Basic Actions */}
            <div className="grid grid-cols-3 gap-1">
              <Button variant="outline" size="sm" onClick={handleLock}>
                {selectedElements[0]?.locked ? (
                  <Unlock className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Quick Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Maximize className="h-3 w-3 mr-2" />
            Fit to Canvas
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Minimize className="h-3 w-3 mr-2" />
            Zoom to Selection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};