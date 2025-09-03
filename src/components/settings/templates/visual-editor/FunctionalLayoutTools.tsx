import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Grid3x3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
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
  Maximize2,
  Minimize2,
  ArrowUpDown,
  ArrowLeftRight,
  Square,
  Circle,
  Triangle,
  Ruler,
  Crosshair,
  FileText
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
  name: string;
}

interface AdvancedLayoutToolsProps {
  selectedElements: LayoutElement[];
  onElementUpdate: (elements: LayoutElement[]) => void;
  onAlignment: (type: string) => void;
  onDistribution: (type: string) => void;
  onGrouping: (action: 'group' | 'ungroup') => void;
}

const mockElements: LayoutElement[] = [
  {
    id: '1',
    type: 'text',
    name: 'Header Text',
    x: 100,
    y: 50,
    width: 200,
    height: 40,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex: 1
  },
  {
    id: '2',
    type: 'image',
    name: 'Company Logo',
    x: 50,
    y: 50,
    width: 100,
    height: 60,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex: 2
  },
  {
    id: '3',
    type: 'shape',
    name: 'Rectangle',
    x: 150,
    y: 150,
    width: 120,
    height: 80,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex: 3
  }
];

const AdvancedLayoutToolsComponent = ({
  selectedElements = [],
  onElementUpdate,
  onAlignment,
  onDistribution,
  onGrouping
}: AdvancedLayoutToolsProps) => {
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState([20]);
  const [showRulers, setShowRulers] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [smartSnap, setSmartSnap] = useState(true);
  const [elements, setElements] = useState<LayoutElement[]>(mockElements);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Transform controls for selected elements
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState([0]);

  const hasSelection = selectedIds.length > 0;
  const multipleSelected = selectedIds.length > 1;
  const selectedElementsData = elements.filter(el => selectedIds.includes(el.id));

  useEffect(() => {
    if (selectedElementsData.length === 1) {
      const element = selectedElementsData[0];
      setPosition({ x: element.x, y: element.y });
      setSize({ width: element.width, height: element.height });
      setRotation([element.rotation]);
    } else if (selectedElementsData.length > 1) {
      // Calculate bounding box for multiple selection
      const minX = Math.min(...selectedElementsData.map(el => el.x));
      const minY = Math.min(...selectedElementsData.map(el => el.y));
      const maxX = Math.max(...selectedElementsData.map(el => el.x + el.width));
      const maxY = Math.max(...selectedElementsData.map(el => el.y + el.height));
      
      setPosition({ x: minX, y: minY });
      setSize({ width: maxX - minX, height: maxY - minY });
      setRotation([0]);
    }
  }, [selectedElementsData]);

  const handleAlignment = (type: string) => {
    if (!hasSelection) {
      toast.error("Please select elements to align");
      return;
    }

    const updatedElements = elements.map(element => {
      if (!selectedIds.includes(element.id)) return element;

      const canvasWidth = 800; // Assuming canvas width
      const canvasHeight = 600; // Assuming canvas height
      
      let newElement = { ...element };

      switch (type) {
        case 'left':
          newElement.x = 0;
          break;
        case 'center':
          newElement.x = (canvasWidth - element.width) / 2;
          break;
        case 'right':
          newElement.x = canvasWidth - element.width;
          break;
        case 'top':
          newElement.y = 0;
          break;
        case 'middle':
          newElement.y = (canvasHeight - element.height) / 2;
          break;
        case 'bottom':
          newElement.y = canvasHeight - element.height;
          break;
      }

      return newElement;
    });

    setElements(updatedElements);
    onAlignment(type);
    toast.success(`Elements aligned ${type}`);
  };

  const handleDistribution = (type: string) => {
    if (selectedElementsData.length < 3) {
      toast.error("Select at least 3 elements to distribute");
      return;
    }

    const sortedElements = [...selectedElementsData];
    
    if (type === 'horizontal') {
      sortedElements.sort((a, b) => a.x - b.x);
      const totalWidth = sortedElements[sortedElements.length - 1].x - sortedElements[0].x;
      const spacing = totalWidth / (sortedElements.length - 1);
      
      sortedElements.forEach((element, index) => {
        if (index > 0 && index < sortedElements.length - 1) {
          element.x = sortedElements[0].x + spacing * index;
        }
      });
    } else if (type === 'vertical') {
      sortedElements.sort((a, b) => a.y - b.y);
      const totalHeight = sortedElements[sortedElements.length - 1].y - sortedElements[0].y;
      const spacing = totalHeight / (sortedElements.length - 1);
      
      sortedElements.forEach((element, index) => {
        if (index > 0 && index < sortedElements.length - 1) {
          element.y = sortedElements[0].y + spacing * index;
        }
      });
    }

    const updatedElements = elements.map(element => {
      const updated = sortedElements.find(el => el.id === element.id);
      return updated || element;
    });

    setElements(updatedElements);
    onDistribution(type);
    toast.success(`Elements distributed ${type}ally`);
  };

  const handleGrouping = (action: 'group' | 'ungroup') => {
    if (!multipleSelected && action === 'group') {
      toast.error("Select multiple elements to group");
      return;
    }

    onGrouping(action);
    toast.success(`Elements ${action}ed`);
  };

  const handleLayering = (action: string) => {
    if (!hasSelection) return;

    const updatedElements = elements.map(element => {
      if (!selectedIds.includes(element.id)) return element;

      let newZIndex = element.zIndex;
      
      switch (action) {
        case 'front':
          newZIndex = Math.max(...elements.map(el => el.zIndex)) + 1;
          break;
        case 'forward':
          newZIndex = element.zIndex + 1;
          break;
        case 'backward':
          newZIndex = Math.max(1, element.zIndex - 1);
          break;
        case 'back':
          newZIndex = 1;
          break;
      }

      return { ...element, zIndex: newZIndex };
    });

    setElements(updatedElements);
    toast.success(`Elements moved ${action}`);
  };

  const handleTransform = (property: string, value: any) => {
    const updatedElements = elements.map(element => {
      if (!selectedIds.includes(element.id)) return element;

      switch (property) {
        case 'x':
          return { ...element, x: value };
        case 'y':
          return { ...element, y: value };
        case 'width':
          return { ...element, width: Math.max(10, value) };
        case 'height':
          return { ...element, height: Math.max(10, value) };
        case 'rotation':
          return { ...element, rotation: value };
        default:
          return element;
      }
    });

    setElements(updatedElements);
    onElementUpdate(updatedElements);
  };

  const toggleElementLock = (elementId: string) => {
    const updatedElements = elements.map(element =>
      element.id === elementId ? { ...element, locked: !element.locked } : element
    );
    setElements(updatedElements);
  };

  const toggleElementVisibility = (elementId: string) => {
    const updatedElements = elements.map(element =>
      element.id === elementId ? { ...element, visible: !element.visible } : element
    );
    setElements(updatedElements);
  };

  const duplicateSelected = () => {
    if (!hasSelection) return;

    const newElements = selectedElementsData.map(element => ({
      ...element,
      id: `${element.id}-copy-${Date.now()}`,
      name: `${element.name} Copy`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: Math.max(...elements.map(el => el.zIndex)) + 1
    }));

    setElements([...elements, ...newElements]);
    setSelectedIds(newElements.map(el => el.id));
    toast.success("Elements duplicated");
  };

  const deleteSelected = () => {
    if (!hasSelection) return;

    const updatedElements = elements.filter(element => !selectedIds.includes(element.id));
    setElements(updatedElements);
    setSelectedIds([]);
    toast.success("Elements deleted");
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="grid" className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grid">Grid & Snap</TabsTrigger>
          <TabsTrigger value="align">Align</TabsTrigger>
          <TabsTrigger value="transform">Transform</TabsTrigger>
          <TabsTrigger value="layers">Layers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="space-y-4 overflow-y-auto">
          {/* Grid and Snap Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Grid & Guides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Snap to Grid</Label>
                <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
              </div>
              
              <div>
                <Label className="text-sm">Grid Size: {gridSize[0]}px</Label>
                <Slider
                  value={gridSize}
                  onValueChange={setGridSize}
                  max={50}
                  min={5}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show Rulers</Label>
                <Switch checked={showRulers} onCheckedChange={setShowRulers} />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show Guides</Label>
                <Switch checked={showGuides} onCheckedChange={setShowGuides} />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Smart Snap</Label>
                <Switch checked={smartSnap} onCheckedChange={setSmartSnap} />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={duplicateSelected} disabled={!hasSelection}>
                <Copy className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={deleteSelected} 
                disabled={!hasSelection}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="align" className="space-y-4 overflow-y-auto">
          {/* Alignment Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Horizontal Alignment</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAlignment('left')}
                disabled={!hasSelection}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAlignment('center')}
                disabled={!hasSelection}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAlignment('right')}
                disabled={!hasSelection}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Vertical Alignment</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAlignment('top')}
                disabled={!hasSelection}
              >
                <AlignVerticalJustifyStart className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAlignment('middle')}
                disabled={!hasSelection}
              >
                <AlignVerticalJustifyCenter className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAlignment('bottom')}
                disabled={!hasSelection}
              >
                <AlignVerticalJustifyEnd className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Distribution</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDistribution('horizontal')}
                disabled={selectedIds.length < 3}
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                Horizontal
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDistribution('vertical')}
                disabled={selectedIds.length < 3}
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Vertical
              </Button>
            </CardContent>
          </Card>

          {/* Grouping */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Grouping</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleGrouping('group')}
                disabled={!multipleSelected}
              >
                <Group className="h-4 w-4 mr-1" />
                Group
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleGrouping('ungroup')}
                disabled={!hasSelection}
              >
                <Ungroup className="h-4 w-4 mr-1" />
                Ungroup
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transform" className="space-y-4 overflow-y-auto">
          {hasSelection ? (
            <>
              {/* Position Controls */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">X</Label>
                      <Input
                        type="number"
                        value={position.x}
                        onChange={(e) => {
                          const newX = parseInt(e.target.value) || 0;
                          setPosition(prev => ({ ...prev, x: newX }));
                          handleTransform('x', newX);
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Y</Label>
                      <Input
                        type="number"
                        value={position.y}
                        onChange={(e) => {
                          const newY = parseInt(e.target.value) || 0;
                          setPosition(prev => ({ ...prev, y: newY }));
                          handleTransform('y', newY);
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Size Controls */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Size</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Width</Label>
                      <Input
                        type="number"
                        value={size.width}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value) || 0;
                          setSize(prev => ({ ...prev, width: newWidth }));
                          handleTransform('width', newWidth);
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height</Label>
                      <Input
                        type="number"
                        value={size.height}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value) || 0;
                          setSize(prev => ({ ...prev, height: newHeight }));
                          handleTransform('height', newHeight);
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rotation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Rotation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Angle: {rotation[0]}°</Label>
                    <Slider
                      value={rotation}
                      onValueChange={(value) => {
                        setRotation(value);
                        handleTransform('rotation', value[0]);
                      }}
                      max={360}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleTransform('rotation', rotation[0] + 90)}>
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleTransform('rotation', 0)}>
                      Reset
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleTransform('rotation', rotation[0] - 90)}>
                      <RotateCw className="h-4 w-4 scale-x-[-1]" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Layer Order */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Layer Order</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleLayering('front')}>
                    <Maximize2 className="h-4 w-4 mr-1" />
                    To Front
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleLayering('forward')}>
                    Forward
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleLayering('backward')}>
                    Backward
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleLayering('back')}>
                    <Minimize2 className="h-4 w-4 mr-1" />
                    To Back
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Move className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select elements to transform</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="layers" className="space-y-4 overflow-y-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Elements ({elements.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {elements
                .sort((a, b) => b.zIndex - a.zIndex)
                .map((element) => (
                <div
                  key={element.id}
                  className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                    selectedIds.includes(element.id)
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                  onClick={() => {
                    if (selectedIds.includes(element.id)) {
                      setSelectedIds(selectedIds.filter(id => id !== element.id));
                    } else {
                      setSelectedIds([...selectedIds, element.id]);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {element.type === 'text' && <FileText className="h-4 w-4 text-muted-foreground" />}
                    {element.type === 'image' && <Square className="h-4 w-4 text-muted-foreground" />}
                    {element.type === 'shape' && <Circle className="h-4 w-4 text-muted-foreground" />}
                    {element.type === 'container' && <Square className="h-4 w-4 text-muted-foreground" />}
                    
                    <span className="text-sm font-medium truncate">{element.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleElementVisibility(element.id);
                      }}
                    >
                      {element.visible ? '👁️' : '🙈'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleElementLock(element.id);
                      }}
                    >
                      {element.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              ))}
              
              {elements.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No elements yet</p>
                  <p className="text-xs">Add elements to see them here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const FunctionalLayoutTools = AdvancedLayoutToolsComponent;