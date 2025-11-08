import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, IText, Rect, Circle, FabricImage } from 'fabric';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle as CircleIcon,
  Save,
  Download,
  Trash2,
  MousePointer,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateDocumentTemplate, useUpdateDocumentTemplate } from '@/hooks/useDocumentTemplates';

export const VisualQuoteDesigner = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'rectangle' | 'circle'>('select');
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [templateName, setTemplateName] = useState('My Quote Template');
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const createTemplate = useCreateDocumentTemplate();
  const updateTemplate = useUpdateDocumentTemplate();

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // A4 size in pixels at 96 DPI (210mm x 297mm)
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 794,  // A4 width in pixels
      height: 1123, // A4 height in pixels
      backgroundColor: '#ffffff',
    });

    setFabricCanvas(canvas);

    // Handle object selection
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0]);
    });
    
    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0]);
    });
    
    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    toast({
      title: 'Canvas Ready!',
      description: 'Click on tools to add elements to your quote template',
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  // Add text element
  const addText = () => {
    if (!fabricCanvas) return;

    const text = new IText('Click to edit text', {
      left: 100,
      top: 100,
      fontSize: 20,
      fontFamily: 'Arial',
      fill: '#000000',
    });

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    setActiveTool('select');
  };

  // Add image placeholder
  const addImagePlaceholder = () => {
    if (!fabricCanvas) return;

    const rect = new Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: '#f0f0f0',
      stroke: '#999999',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
    });

    const text = new IText('Image\nPlaceholder', {
      left: 140,
      top: 130,
      fontSize: 16,
      fill: '#666666',
      fontFamily: 'Arial',
      textAlign: 'center',
      selectable: false,
    });

    fabricCanvas.add(rect);
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(rect);
    fabricCanvas.renderAll();
    setActiveTool('select');
  };

  // Add rectangle
  const addRectangle = () => {
    if (!fabricCanvas) return;

    const rect = new Rect({
      left: 100,
      top: 100,
      width: 150,
      height: 100,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
    });

    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
    fabricCanvas.renderAll();
    setActiveTool('select');
  };

  // Add circle
  const addCircle = () => {
    if (!fabricCanvas) return;

    const circle = new Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2,
    });

    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
    fabricCanvas.renderAll();
    setActiveTool('select');
  };

  // Delete selected object
  const deleteSelected = () => {
    if (!fabricCanvas || !selectedObject) return;
    
    fabricCanvas.remove(selectedObject);
    setSelectedObject(null);
    fabricCanvas.renderAll();
  };

  // Save template
  const saveTemplate = async () => {
    if (!fabricCanvas) return;

    const canvasData = fabricCanvas.toJSON();

    try {
      if (currentTemplateId) {
        // Update existing template
        await updateTemplate.mutateAsync({
          id: currentTemplateId,
          updates: {
            name: templateName,
            document_type: 'quotation',
            blocks: [canvasData],
          },
        });
      } else {
        // Create new template
        const result = await createTemplate.mutateAsync({
          name: templateName,
          document_type: 'quotation',
          blocks: [canvasData],
          status: 'active',
        });
        
        if (result?.id) {
          setCurrentTemplateId(result.id);
        }
      }

      toast({
        title: 'Template Saved!',
        description: 'Your quote template has been saved successfully.',
      });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  // Export as PDF (placeholder)
  const exportPDF = () => {
    toast({
      title: 'Coming Soon',
      description: 'PDF export will be implemented next!',
    });
  };

  // Update selected object properties
  const updateObjectProperty = (property: string, value: any) => {
    if (!selectedObject || !fabricCanvas) return;

    selectedObject.set(property, value);
    fabricCanvas.renderAll();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-3">
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-64 font-semibold"
            placeholder="Template name..."
          />
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
            Beta
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveTemplate} disabled={createTemplate.isPending || updateTemplate.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button variant="outline" onClick={exportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Toolbar */}
        <div className="col-span-2">
          <div className="space-y-2 p-3 bg-card border border-border rounded-lg">
            <h3 className="text-sm font-semibold mb-3">Tools</h3>
            
            <Button
              variant={activeTool === 'select' ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveTool('select')}
            >
              <MousePointer className="h-4 w-4 mr-2" />
              Select
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={addText}
            >
              <Type className="h-4 w-4 mr-2" />
              Add Text
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={addImagePlaceholder}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Image
            </Button>

            <Separator className="my-2" />

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={addRectangle}
            >
              <Square className="h-4 w-4 mr-2" />
              Rectangle
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={addCircle}
            >
              <CircleIcon className="h-4 w-4 mr-2" />
              Circle
            </Button>

            <Separator className="my-2" />

            <Button
              variant="destructive"
              size="sm"
              className="w-full justify-start"
              onClick={deleteSelected}
              disabled={!selectedObject}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="col-span-7">
          <ScrollArea className="h-[calc(100vh-280px)] border border-border rounded-lg bg-gray-50 p-8">
            <div className="inline-block shadow-2xl">
              <canvas ref={canvasRef} className="border border-gray-300" />
            </div>
          </ScrollArea>
        </div>

        {/* Right Properties Panel */}
        <div className="col-span-3">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h3 className="text-sm font-semibold mb-4">Properties</h3>
            
            {selectedObject ? (
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-4">
                  {/* Text properties */}
                  {selectedObject.type === 'i-text' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs">Font Size</Label>
                        <Input
                          type="number"
                          value={selectedObject.fontSize || 20}
                          onChange={(e) => updateObjectProperty('fontSize', parseInt(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs">Font Family</Label>
                        <select
                          value={selectedObject.fontFamily || 'Arial'}
                          onChange={(e) => updateObjectProperty('fontFamily', e.target.value)}
                          className="w-full h-8 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Text Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedObject.fill || '#000000'}
                            onChange={(e) => updateObjectProperty('fill', e.target.value)}
                            className="h-8 w-12 p-1"
                          />
                          <Input
                            value={selectedObject.fill || '#000000'}
                            onChange={(e) => updateObjectProperty('fill', e.target.value)}
                            className="h-8 flex-1"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Shape properties */}
                  {(selectedObject.type === 'rect' || selectedObject.type === 'circle') && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs">Fill Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedObject.fill || '#3b82f6'}
                            onChange={(e) => updateObjectProperty('fill', e.target.value)}
                            className="h-8 w-12 p-1"
                          />
                          <Input
                            value={selectedObject.fill || '#3b82f6'}
                            onChange={(e) => updateObjectProperty('fill', e.target.value)}
                            className="h-8 flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Border Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedObject.stroke || '#000000'}
                            onChange={(e) => updateObjectProperty('stroke', e.target.value)}
                            className="h-8 w-12 p-1"
                          />
                          <Input
                            value={selectedObject.stroke || '#000000'}
                            onChange={(e) => updateObjectProperty('stroke', e.target.value)}
                            className="h-8 flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Border Width</Label>
                        <Input
                          type="number"
                          value={selectedObject.strokeWidth || 2}
                          onChange={(e) => updateObjectProperty('strokeWidth', parseInt(e.target.value))}
                          className="h-8"
                        />
                      </div>
                    </>
                  )}

                  {/* Common properties */}
                  <div className="space-y-2">
                    <Label className="text-xs">Opacity</Label>
                    <Input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={selectedObject.opacity || 1}
                      onChange={(e) => updateObjectProperty('opacity', parseFloat(e.target.value))}
                      className="h-8"
                    />
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12">
                <MousePointer className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select an element to edit its properties
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
