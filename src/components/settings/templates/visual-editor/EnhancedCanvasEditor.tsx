import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, FabricText, FabricImage, Group, Line } from "fabric";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Image as ImageIcon,
  MousePointer,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Lock,
  Unlock,
  Grid3x3,
  Palette,
  Download,
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { toast } from "sonner";

interface CanvasEditorProps {
  onSave?: (canvasData: string) => void;
  initialData?: string;
  width?: number;
  height?: number;
}

export const EnhancedCanvasEditor = ({ 
  onSave, 
  initialData, 
  width = 800, 
  height = 600 
}: CanvasEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'rectangle' | 'circle' | 'text' | 'image' | 'draw'>('select');
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  
  // Style properties for selected object
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#1e293b');
  const [strokeWidth, setStrokeWidth] = useState([2]);
  const [opacity, setOpacity] = useState([100]);
  const [fontSize, setFontSize] = useState([20]);
  const [fontFamily, setFontFamily] = useState('Inter');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    });

    // Add grid background
    if (showGrid) {
      addGridToCanvas(canvas);
    }

    // Load initial data if provided
    if (initialData) {
      try {
        canvas.loadFromJSON(initialData, () => {
          canvas.renderAll();
        });
      } catch (error) {
        console.error('Failed to load canvas data:', error);
      }
    }

    // Selection events
    canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0];
      setSelectedObject(obj);
      updateStyleControls(obj);
    });

    canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0];
      setSelectedObject(obj);
      updateStyleControls(obj);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // History management
    canvas.on('object:added', saveState);
    canvas.on('object:removed', saveState);
    canvas.on('object:modified', saveState);

    setFabricCanvas(canvas);
    toast("Enhanced Canvas ready! Try the professional design tools.");

    return () => {
      canvas.dispose();
    };
  }, [width, height, initialData, showGrid]);

  const addGridToCanvas = (canvas: FabricCanvas) => {
    const gridSize = 20;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // Remove existing grid
    const gridObjects = canvas.getObjects().filter((obj: any) => obj.isGridLine);
    gridObjects.forEach(obj => canvas.remove(obj));

    // Add vertical lines  
    for (let i = 0; i <= canvasWidth; i += gridSize) {
      const line = new fabric.Line([i, 0, i, canvasHeight], {
        stroke: '#e5e7eb',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        isGridLine: true
      } as any);
      canvas.add(line);
      canvas.sendObjectToBack(line);
    }

    // Add horizontal lines
    for (let i = 0; i <= canvasHeight; i += gridSize) {
      const line = new fabric.Line([0, i, canvasWidth, i], {
        stroke: '#e5e7eb', 
        strokeWidth: 1,
        selectable: false,
        evented: false,
        isGridLine: true
      } as any);
      canvas.add(line);
      canvas.sendObjectToBack(line);
    }

    canvas.renderAll();
  };

  const updateStyleControls = (obj: any) => {
    if (!obj) return;
    
    if (obj.fill && typeof obj.fill === 'string') {
      setFillColor(obj.fill);
    }
    if (obj.stroke) {
      setStrokeColor(obj.stroke);
    }
    if (obj.strokeWidth) {
      setStrokeWidth([obj.strokeWidth]);
    }
    if (obj.opacity !== undefined) {
      setOpacity([obj.opacity * 100]);
    }
    if (obj.fontSize) {
      setFontSize([obj.fontSize]);
    }
    if (obj.fontFamily) {
      setFontFamily(obj.fontFamily);
    }
  };

  const saveState = () => {
    if (!fabricCanvas) return;
    
    const currentState = JSON.stringify(fabricCanvas.toJSON());
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = canvasHistory[historyIndex - 1];
      fabricCanvas?.loadFromJSON(prevState, () => {
        fabricCanvas.renderAll();
        setHistoryIndex(historyIndex - 1);
      });
    }
  };

  const redo = () => {
    if (historyIndex < canvasHistory.length - 1) {
      const nextState = canvasHistory[historyIndex + 1];
      fabricCanvas?.loadFromJSON(nextState, () => {
        fabricCanvas.renderAll();
        setHistoryIndex(historyIndex + 1);
      });
    }
  };

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    // Clear selection when switching tools
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();

    switch (tool) {
      case 'rectangle':
        const rect = new Rect({
          left: 100,
          top: 100,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth[0],
          width: 120,
          height: 80,
          rx: 8,
          ry: 8,
        });
        fabricCanvas.add(rect);
        fabricCanvas.setActiveObject(rect);
        break;

      case 'circle':
        const circle = new Circle({
          left: 100,
          top: 100,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth[0],
          radius: 50,
        });
        fabricCanvas.add(circle);
        fabricCanvas.setActiveObject(circle);
        break;

      case 'text':
        const text = new FabricText('Click to edit text', {
          left: 100,
          top: 100,
          fontFamily: fontFamily,
          fontSize: fontSize[0],
          fill: fillColor,
          editable: true,
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        break;

      case 'image':
        // Create placeholder for image upload
        const placeholder = new Rect({
          left: 100,
          top: 100,
          fill: '#f3f4f6',
          stroke: '#d1d5db',
          strokeWidth: 2,
          strokeDashArray: [8, 4],
          width: 200,
          height: 150,
        });
        
        const placeholderText = new FabricText('Drop image here\nor click to upload', {
          left: 200,
          top: 175,
          fontSize: 14,
          fill: '#6b7280',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
        });
        
        const imageGroup = new Group([placeholder, placeholderText], {
          left: 100,
          top: 100,
        });
        
        fabricCanvas.add(imageGroup);
        fabricCanvas.setActiveObject(imageGroup);
        break;

      case 'draw':
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush.color = fillColor;
        fabricCanvas.freeDrawingBrush.width = strokeWidth[0];
        break;

      default:
        fabricCanvas.isDrawingMode = false;
        break;
    }

    fabricCanvas.renderAll();
    if (tool !== 'draw') {
      setActiveTool('select');
    }
  };

  const applyStyleToSelected = (property: string, value: any) => {
    if (!fabricCanvas || !selectedObject) return;

    switch (property) {
      case 'fill':
        selectedObject.set({ fill: value });
        setFillColor(value);
        break;
      case 'stroke':
        selectedObject.set({ stroke: value });
        setStrokeColor(value);
        break;
      case 'strokeWidth':
        selectedObject.set({ strokeWidth: value });
        break;
      case 'opacity':
        selectedObject.set({ opacity: value / 100 });
        break;
      case 'fontSize':
        if (selectedObject.type === 'textbox' || selectedObject.type === 'i-text') {
          selectedObject.set({ fontSize: value });
        }
        break;
      case 'fontFamily':
        if (selectedObject.type === 'textbox' || selectedObject.type === 'i-text') {
          selectedObject.set({ fontFamily: value });
        }
        break;
    }

    fabricCanvas.renderAll();
  };

  const handleAlignment = (alignment: string) => {
    if (!fabricCanvas || !selectedObject) return;

    const canvasWidth = fabricCanvas.getWidth();
    const canvasHeight = fabricCanvas.getHeight();
    const objWidth = selectedObject.getScaledWidth();
    const objHeight = selectedObject.getScaledHeight();
    
    switch (alignment) {
      case 'left':
        selectedObject.set({ left: 0 });
        break;
      case 'center':
        selectedObject.set({ left: (canvasWidth - objWidth) / 2 });
        break;
      case 'right':
        selectedObject.set({ left: canvasWidth - objWidth });
        break;
      case 'top':
        selectedObject.set({ top: 0 });
        break;
      case 'middle':
        selectedObject.set({ top: (canvasHeight - objHeight) / 2 });
        break;
      case 'bottom':
        selectedObject.set({ top: canvasHeight - objHeight });
        break;
    }
    
    fabricCanvas.renderAll();
  };

  const handleLayering = (action: string) => {
    if (!fabricCanvas || !selectedObject) return;

    switch (action) {
      case 'front':
        fabricCanvas.bringObjectToFront(selectedObject);
        break;
      case 'forward':
        fabricCanvas.bringObjectForward(selectedObject);
        break;
      case 'backward':
        fabricCanvas.sendObjectBackwards(selectedObject);
        break;
      case 'back':
        fabricCanvas.sendObjectToBack(selectedObject);
        break;
    }
    
    fabricCanvas.renderAll();
  };

  const zoomCanvas = (factor: number) => {
    if (!fabricCanvas) return;
    
    const newZoom = Math.max(0.1, Math.min(3, zoom * factor));
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Tools */}
      <div className="w-80 border-r bg-background overflow-y-auto">
        <Tabs defaultValue="tools" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="styles">Styles</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="space-y-4 p-4">
            {/* Selection Tools */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Selection</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button
                  variant={activeTool === 'select' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTool('select')}
                  className="flex flex-col gap-1 h-12"
                >
                  <MousePointer className="h-4 w-4" />
                  <span className="text-xs">Select</span>
                </Button>
                <Button
                  variant={activeTool === 'draw' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleToolClick('draw')}
                  className="flex flex-col gap-1 h-12"
                >
                  <Type className="h-4 w-4" />
                  <span className="text-xs">Draw</span>
                </Button>
              </CardContent>
            </Card>

            {/* Shape Tools */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Shapes</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolClick('rectangle')}
                  className="flex flex-col gap-1 h-12"
                >
                  <Square className="h-4 w-4" />
                  <span className="text-xs">Rectangle</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolClick('circle')}
                  className="flex flex-col gap-1 h-12"
                >
                  <CircleIcon className="h-4 w-4" />
                  <span className="text-xs">Circle</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolClick('text')}
                  className="flex flex-col gap-1 h-12"
                >
                  <Type className="h-4 w-4" />
                  <span className="text-xs">Text</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolClick('image')}
                  className="flex flex-col gap-1 h-12"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span className="text-xs">Image</span>
                </Button>
              </CardContent>
            </Card>

            {/* Alignment Tools */}
            {selectedObject && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Alignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3 gap-1">
                    <Button variant="outline" size="sm" onClick={() => handleAlignment('left')}>
                      <AlignLeft className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAlignment('center')}>
                      <AlignCenter className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAlignment('right')}>
                      <AlignRight className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <Button variant="outline" size="sm" onClick={() => handleAlignment('top')}>
                      <AlignVerticalJustifyStart className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAlignment('middle')}>
                      <AlignVerticalJustifyCenter className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAlignment('bottom')}>
                      <AlignVerticalJustifyEnd className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="styles" className="space-y-4 p-4">
            {selectedObject && (
              <>
                {/* Colors */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Colors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Fill Color</Label>
                      <div className="flex gap-2 mt-1">
                        <div 
                          className="w-8 h-8 rounded border cursor-pointer"
                          style={{ backgroundColor: fillColor }}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'color';
                            input.value = fillColor;
                            input.onchange = (e) => applyStyleToSelected('fill', (e.target as HTMLInputElement).value);
                            input.click();
                          }}
                        />
                        <Input 
                          value={fillColor} 
                          onChange={(e) => applyStyleToSelected('fill', e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Stroke Color</Label>
                      <div className="flex gap-2 mt-1">
                        <div 
                          className="w-8 h-8 rounded border cursor-pointer"
                          style={{ backgroundColor: strokeColor }}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'color';
                            input.value = strokeColor;
                            input.onchange = (e) => applyStyleToSelected('stroke', (e.target as HTMLInputElement).value);
                            input.click();
                          }}
                        />
                        <Input 
                          value={strokeColor} 
                          onChange={(e) => applyStyleToSelected('stroke', e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Properties */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Stroke Width: {strokeWidth[0]}px</Label>
                      <Slider
                        value={strokeWidth}
                        onValueChange={(value) => {
                          setStrokeWidth(value);
                          applyStyleToSelected('strokeWidth', value[0]);
                        }}
                        max={20}
                        min={0}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Opacity: {opacity[0]}%</Label>
                      <Slider
                        value={opacity}
                        onValueChange={(value) => {
                          setOpacity(value);
                          applyStyleToSelected('opacity', value[0]);
                        }}
                        max={100}
                        min={0}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Typography */}
                {(selectedObject?.type === 'textbox' || selectedObject?.type === 'i-text') && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Typography</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs">Font Family</Label>
                        <Select value={fontFamily} onValueChange={(value) => {
                          setFontFamily(value);
                          applyStyleToSelected('fontFamily', value);
                        }}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Font Size: {fontSize[0]}px</Label>
                        <Slider
                          value={fontSize}
                          onValueChange={(value) => {
                            setFontSize(value);
                            applyStyleToSelected('fontSize', value[0]);
                          }}
                          max={72}
                          min={8}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="layers" className="space-y-4 p-4">
            {selectedObject && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Layer Order</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleLayering('front')}>
                    Bring to Front
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleLayering('forward')}>
                    Bring Forward
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleLayering('backward')}>
                    Send Backward
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleLayering('back')}>
                    Send to Back
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <Card className="m-4 mb-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= canvasHistory.length - 1}>
                  <Redo className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="outline" size="sm" onClick={() => zoomCanvas(1.2)}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <span className="text-sm">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="sm" onClick={() => zoomCanvas(0.8)}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant={showGrid ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedObject && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => {
                      selectedObject.clone((cloned: any) => {
                        cloned.set({
                          left: selectedObject.left + 20,
                          top: selectedObject.top + 20,
                        });
                        fabricCanvas?.add(cloned);
                        fabricCanvas?.setActiveObject(cloned);
                        fabricCanvas?.renderAll();
                      });
                    }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      fabricCanvas?.remove(selectedObject);
                      fabricCanvas?.renderAll();
                      setSelectedObject(null);
                    }} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button size="sm" onClick={() => {
                  if (!fabricCanvas) return;
                  const canvasData = JSON.stringify(fabricCanvas.toJSON());
                  onSave?.(canvasData);
                  toast("Canvas saved successfully!");
                }}>
                  Save Canvas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canvas Container */}
        <div className="flex-1 p-4 pt-2">
          <Card className="h-full">
            <CardContent className="p-4 h-full">
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg">
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};