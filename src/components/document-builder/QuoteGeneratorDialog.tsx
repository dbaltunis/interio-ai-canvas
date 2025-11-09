import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText, Download, Eye } from "lucide-react";
import { useDocumentTemplates } from "@/hooks/useDocumentTemplates";
import { QuotePDFExporter } from "./QuotePDFExporter";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { bindDataToCanvas } from "@/utils/quoteDataBinding";
import { toast } from "sonner";

interface QuoteGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quoteData: any; // Will be populated from actual quote/project data
}

export const QuoteGeneratorDialog = ({ isOpen, onClose, quoteData }: QuoteGeneratorDialogProps) => {
  const { data: templates } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shouldExport, setShouldExport] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const handlePreview = (template: any) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleGenerateQuote = async (template: any) => {
    try {
      setIsGenerating(true);
      setSelectedTemplate(template);

      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Trigger PDF export
      setShouldExport(true);
    } catch (error) {
      console.error('Error generating quote:', error);
      toast.error('Failed to generate quote');
      setIsGenerating(false);
    }
  };

  const handleExportComplete = () => {
    setShouldExport(false);
    setIsGenerating(false);
    toast.success('Quote generated successfully!');
    onClose();
  };

  const activeTemplates = templates?.filter(t => t.status === 'active') || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generate Quote from Template
            </DialogTitle>
            <DialogDescription>
              Select a template to generate a professional quote with your data
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            {activeTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates available</h3>
                <p className="text-sm text-muted-foreground">
                  Create a quote template first in the Document Builder
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {activeTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="group relative border-2 border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all"
                  >
                    <div className="aspect-[1/1.4] bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
                      <FileText className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                    
                    <div className="p-4 bg-background">
                      <h3 className="font-semibold text-sm mb-1 truncate">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {template.document_type === 'quote' ? 'Quote Template' : 'Document'}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8"
                          onClick={() => handlePreview(template)}
                          disabled={isGenerating}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-8 bg-gradient-to-r from-primary to-accent"
                          onClick={() => handleGenerateQuote(template)}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="h-3 w-3 mr-1" />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          template={previewTemplate}
          quoteData={quoteData}
          onGeneratePDF={() => handleGenerateQuote(previewTemplate)}
        />
      )}

      {/* Hidden PDF exporter */}
      {shouldExport && selectedTemplate && (
        <QuotePDFExporter
          canvasJSON={bindDataToCanvas(
            Array.isArray(selectedTemplate.blocks) ? selectedTemplate.blocks[0] : selectedTemplate.blocks,
            quoteData
          )}
          quoteData={{
            client: quoteData.client,
            business: quoteData.business,
            quote: quoteData.quote,
            items: quoteData.items || [],
            subtotal: quoteData.quote?.subtotal || 0,
            taxAmount: quoteData.quote?.tax || 0,
            total: quoteData.quote?.total || 0,
          }}
          filename={`quote-${quoteData.quote?.number || 'draft'}.pdf`}
          onExportComplete={handleExportComplete}
        />
      )}
    </>
  );
};
