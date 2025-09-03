import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, FabricText, FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Image as ImageIcon,
  Move,
  MousePointer,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";
import { toast } from "sonner";

interface CanvasEditorProps {
  onSave?: (canvasData: string) => void;
  initialData?: string;
  width?: number;
  height?: number;
}

export const CanvasEditor = ({ 
  onSave, 
  initialData, 
  width = 800, 
  height = 600 
}: CanvasEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'rectangle' | 'circle' | 'text' | 'image'>('select');
  const [selectedObject, setSelectedObject] = useState<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#ffffff",
    });

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
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    setFabricCanvas(canvas);
    toast("Canvas ready!");

    return () => {
      canvas.dispose();
    };
  }, [width, height, initialData]);

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
          fill: '#3b82f6',
          width: 100,
          height: 80,
          rx: 5,
          ry: 5,
        });
        fabricCanvas.add(rect);
        fabricCanvas.setActiveObject(rect);
        break;

      case 'circle':
        const circle = new Circle({
          left: 100,
          top: 100,
          fill: '#10b981',
          radius: 50,
        });
        fabricCanvas.add(circle);
        fabricCanvas.setActiveObject(circle);
        break;

      case 'text':
        const text = new FabricText('Sample Text', {
          left: 100,
          top: 100,
          fontFamily: 'Arial',
          fontSize: 20,
          fill: '#1f2937',
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        break;

      case 'image':
        // This would typically open a file picker
        // For now, we'll add a placeholder
        const placeholder = new Rect({
          left: 100,
          top: 100,
          fill: '#f3f4f6',
          stroke: '#d1d5db',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          width: 150,
          height: 100,
        });
        fabricCanvas.add(placeholder);
        fabricCanvas.setActiveObject(placeholder);
        break;
    }

    fabricCanvas.renderAll();
    setActiveTool('select');
  };

  const handleDelete = () => {
    if (!fabricCanvas || !selectedObject) return;
    
    fabricCanvas.remove(selectedObject);
    fabricCanvas.renderAll();
    setSelectedObject(null);
  };

  const handleDuplicate = () => {
    if (!fabricCanvas || !selectedObject) return;
    
    selectedObject.clone((cloned: any) => {
      cloned.set({
        left: selectedObject.left + 20,
        top: selectedObject.top + 20,
      });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
    });
  };

  const handleAlignment = (alignment: 'left' | 'center' | 'right') => {
    if (!fabricCanvas || !selectedObject) return;

    const canvasWidth = fabricCanvas.getWidth();
    
    switch (alignment) {
      case 'left':
        selectedObject.set({ left: 0 });
        break;
      case 'center':
        selectedObject.set({ left: (canvasWidth - selectedObject.getScaledWidth()) / 2 });
        break;
      case 'right':
        selectedObject.set({ left: canvasWidth - selectedObject.getScaledWidth() });
        break;
    }
    
    fabricCanvas.renderAll();
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    
    const canvasData = JSON.stringify(fabricCanvas.toJSON());
    onSave?.(canvasData);
    toast("Canvas saved!");
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast("Canvas cleared!");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={activeTool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('select')}
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToolClick('rectangle')}
          >
            <Square className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToolClick('circle')}
          >
            <CircleIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToolClick('text')}
          >
            <Type className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToolClick('image')}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          {selectedObject && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAlignment('left')}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAlignment('center')}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAlignment('right')}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
          
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </Card>

      {/* Canvas */}
      <Card className="p-4">
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <canvas ref={canvasRef} />
        </div>
      </Card>
    </div>
  );
};