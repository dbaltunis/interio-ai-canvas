import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Canvas as FabricCanvas } from "fabric";
import { Download, Loader2, Eye } from "lucide-react";
import { bindDataToCanvas } from "@/utils/quoteDataBinding";
import { generateProductTableHTML } from "@/utils/quoteDataBinding";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
  quoteData: any;
  onGeneratePDF: () => void;
}

export const TemplatePreviewModal = ({
  isOpen,
  onClose,
  template,
  quoteData,
  onGeneratePDF,
}: TemplatePreviewModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productTableHTML, setProductTableHTML] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !canvasRef.current || !template) return;

    const loadPreview = async () => {
      setIsLoading(true);
      
      try {
        // Initialize canvas
        const canvas = new FabricCanvas(canvasRef.current!, {
          width: 794,
          height: 1123,
          backgroundColor: '#ffffff',
        });

        // Get template data
        const templateData = Array.isArray(template.blocks) 
          ? template.blocks[0] 
          : template.blocks;

        // Bind data to canvas
        const boundData = bindDataToCanvas(templateData, quoteData);

        // Load canvas with bound data
        await new Promise<void>((resolve) => {
          canvas.loadFromJSON(boundData, () => {
            canvas.renderAll();
            resolve();
          });
        });

        setFabricCanvas(canvas);

        // Generate product table HTML
        if (quoteData.items && quoteData.items.length > 0) {
          const tableHTML = generateProductTableHTML(
            quoteData.items,
            quoteData.quote?.subtotal,
            quoteData.quote?.tax,
            quoteData.quote?.total
          );
          setProductTableHTML(tableHTML);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading preview:", error);
        setIsLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    };
  }, [isOpen, template, quoteData]);

  const handleGenerate = () => {
    onGeneratePDF();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <DialogTitle>Template Preview</DialogTitle>
          </div>
          <DialogDescription>
            Preview how your quote will look with real data before generating the PDF
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)] px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Loading preview...</p>
            </div>
          ) : (
            <div className="space-y-8 pb-6">
              {/* Canvas Preview */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-primary to-accent rounded-full" />
                  Document Layout
                </h3>
                <div className="bg-gradient-to-br from-muted/30 to-muted/10 p-8 rounded-lg border border-border/50">
                  <div className="inline-block shadow-2xl shadow-primary/10 rounded-lg overflow-hidden">
                    <canvas ref={canvasRef} className="bg-white" />
                  </div>
                </div>
              </div>

              {/* Product Table Preview */}
              {productTableHTML && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <div className="h-1 w-8 bg-gradient-to-r from-accent to-primary rounded-full" />
                    Line Items
                  </h3>
                  <div 
                    className="rounded-lg overflow-hidden border border-border/50"
                    dangerouslySetInnerHTML={{ __html: productTableHTML }}
                  />
                </div>
              )}

              {/* Summary Info */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Template:</span>
                    <span className="ml-2 font-medium">{template.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quote Number:</span>
                    <span className="ml-2 font-medium">{quoteData.quote?.number || 'DRAFT'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Client:</span>
                    <span className="ml-2 font-medium">{quoteData.client?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Items:</span>
                    <span className="ml-2 font-medium">{quoteData.items?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between gap-3 p-6 pt-4 border-t border-border/50 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            This is a preview only. Click "Generate PDF" to create the final document.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
