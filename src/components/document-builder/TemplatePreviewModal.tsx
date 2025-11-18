import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";
import { Card } from "@/components/ui/card";

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
  
  const handleGenerate = () => {
    onGeneratePDF();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <DialogTitle>Template Preview</DialogTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          <Card className="bg-white shadow-lg max-w-4xl mx-auto">
            <div className="p-8">
              <LivePreview 
                blocks={template?.blocks || []}
                projectData={quoteData}
                isEditable={false}
                isPrintMode={false}
              />
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-2 p-6 pt-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>
            <Eye className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
