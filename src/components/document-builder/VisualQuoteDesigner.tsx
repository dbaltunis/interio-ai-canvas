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
      fontSize: 24,
      fontFamily: 'Inter',
      fill: '#1f2937', // Modern dark gray
      fontWeight: '500',
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
      width: 250,
      height: 180,
      fill: '#f3f4f6', // Modern light gray
      stroke: '#9ca3af', // Modern gray
      strokeWidth: 2,
      strokeDashArray: [8, 4],
      rx: 8,
      ry: 8,
    });

    const text = new IText('Image\nPlaceholder', {
      left: 160,
      top: 145,
      fontSize: 16,
      fill: '#6b7280', // Modern muted gray
      fontFamily: 'Inter',
      textAlign: 'center',
      selectable: false,
      fontWeight: '500',
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
      width: 200,
      height: 120,
      fill: '#66b2c9', // Modern cyan-blue from design system
      stroke: '#37445c', // Deep navy-blue
      strokeWidth: 2,
      rx: 8, // Rounded corners
      ry: 8,
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
      radius: 60,
      fill: '#66b2c9', // Modern cyan-blue
      stroke: '#37445c', // Deep navy-blue
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
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Modern Header */}
      <div className="modern-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-80 text-lg font-semibold bg-background/50 border-border/50 focus:border-primary"
                placeholder="Template name..."
              />
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-full border border-primary/20">
              Visual Editor
            </span>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={saveTemplate} 
              disabled={createTemplate.isPending || updateTemplate.isPending}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
            <Button 
              variant="outline" 
              onClick={exportPDF}
              className="border-border/50 hover:border-primary/50 hover:bg-primary/5"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Modern Left Toolbar */}
        <div className="col-span-2">
          <div className="modern-card p-4 space-y-3 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
              <h3 className="text-sm font-bold text-foreground">Design Tools</h3>
            </div>
            
            <Button
              variant={activeTool === 'select' ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start hover:bg-accent/10 transition-all"
              onClick={() => setActiveTool('select')}
            >
              <MousePointer className="h-4 w-4 mr-2" />
              Select
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-all"
              onClick={addText}
            >
              <Type className="h-4 w-4 mr-2" />
              Add Text
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-all"
              onClick={addImagePlaceholder}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Image
            </Button>

            <Separator className="my-3" />

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground px-2 mb-2">Shapes</p>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start hover:bg-accent/10 hover:text-accent transition-all"
                onClick={addRectangle}
              >
                <Square className="h-4 w-4 mr-2" />
                Rectangle
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start hover:bg-accent/10 hover:text-accent transition-all"
                onClick={addCircle}
              >
                <CircleIcon className="h-4 w-4 mr-2" />
                Circle
              </Button>
            </div>

            <Separator className="my-3" />

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
              onClick={deleteSelected}
              disabled={!selectedObject}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Modern Canvas Area */}
        <div className="col-span-7">
          <div className="modern-card-elevated p-8 bg-gradient-to-br from-muted/30 to-muted/10">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="inline-block">
                <div className="relative group">
                  <canvas 
                    ref={canvasRef} 
                    className="shadow-2xl shadow-primary/10 border-2 border-border/50 rounded-lg transition-all group-hover:shadow-primary/20" 
                  />
                  <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold rounded-full shadow-lg">
                    A4 Format
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Modern Right Properties Panel */}
        <div className="col-span-3">
          <div className="modern-card p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-1 bg-gradient-to-b from-accent to-primary rounded-full" />
              <h3 className="text-sm font-bold text-foreground">Properties</h3>
            </div>
            
            {selectedObject ? (
              <ScrollArea className="h-[calc(100vh-240px)]">
                <div className="space-y-5 pr-4">
                  {/* Text properties */}
                  {selectedObject.type === 'i-text' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Font Size</Label>
                        <Input
                          type="number"
                          value={selectedObject.fontSize || 20}
                          onChange={(e) => updateObjectProperty('fontSize', parseInt(e.target.value))}
                          className="h-10 bg-background/50 border-border/50 focus:border-primary"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Font Family</Label>
                        <select
                          value={selectedObject.fontFamily || 'Arial'}
                          onChange={(e) => updateObjectProperty('fontFamily', e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-border/50 bg-background/50 text-sm hover:border-primary/50 focus:border-primary transition-colors"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Inter">Inter</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Text Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedObject.fill || '#000000'}
                            onChange={(e) => updateObjectProperty('fill', e.target.value)}
                            className="h-10 w-14 p-1 cursor-pointer border-border/50"
                          />
                          <Input
                            value={selectedObject.fill || '#000000'}
                            onChange={(e) => updateObjectProperty('fill', e.target.value)}
                            className="h-10 flex-1 bg-background/50 border-border/50 focus:border-primary font-mono text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Shape properties */}
                  {(selectedObject.type === 'rect' || selectedObject.type === 'circle') && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fill Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedObject.fill || '#3b82f6'}
                            onChange={(e) => updateObjectProperty('fill', e.target.value)}
                            className="h-10 w-14 p-1 cursor-pointer border-border/50"
                          />
                          <Input
                            value={selectedObject.fill || '#3b82f6'}
                            onChange={(e) => updateObjectProperty('fill', e.target.value)}
                            className="h-10 flex-1 bg-background/50 border-border/50 focus:border-primary font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Border Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedObject.stroke || '#000000'}
                            onChange={(e) => updateObjectProperty('stroke', e.target.value)}
                            className="h-10 w-14 p-1 cursor-pointer border-border/50"
                          />
                          <Input
                            value={selectedObject.stroke || '#000000'}
                            onChange={(e) => updateObjectProperty('stroke', e.target.value)}
                            className="h-10 flex-1 bg-background/50 border-border/50 focus:border-primary font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Border Width</Label>
                        <Input
                          type="number"
                          value={selectedObject.strokeWidth || 2}
                          onChange={(e) => updateObjectProperty('strokeWidth', parseInt(e.target.value))}
                          className="h-10 bg-background/50 border-border/50 focus:border-primary"
                        />
                      </div>
                    </>
                  )}

                  {/* Common properties */}
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Opacity</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedObject.opacity || 1}
                        onChange={(e) => updateObjectProperty('opacity', parseFloat(e.target.value))}
                        className="flex-1 h-2 accent-primary"
                      />
                      <span className="text-xs font-mono text-muted-foreground w-8">
                        {Math.round((selectedObject.opacity || 1) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl rounded-full" />
                  <MousePointer className="relative h-16 w-16 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground/70 max-w-[180px]">
                  Select an element to customize its properties
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
