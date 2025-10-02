import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TemplateQuotePreview } from "./TemplateQuotePreview";
import { PrintableQuote } from "./PrintableQuote";
import { useReactToPrint } from "react-to-print";
import { useQuoteTemplates } from "@/hooks/useQuoteTemplates";
import { useClients } from "@/hooks/useClients";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

interface QuoteFullScreenViewProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  treatments: any[];
  rooms: any[];
  surfaces: any[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  markupPercentage: number;
  templateId: string;
  workshopItems?: any[];
}

export const QuoteFullScreenView: React.FC<QuoteFullScreenViewProps> = ({
  isOpen,
  onClose,
  project,
  treatments,
  rooms,
  surfaces,
  subtotal,
  taxRate,
  taxAmount,
  total,
  markupPercentage,
  templateId,
  workshopItems = []
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { data: clients } = useClients();
  const { data: businessSettings } = useBusinessSettings();
  const { data: templates } = useQuoteTemplates();
  
  const selectedTemplate = templates?.find(t => t.id === templateId);
  const client = clients?.find(c => c.id === project?.client_id);

  const projectData = {
    project,
    client,
    businessSettings,
    treatments,
    workshopItems,
    rooms,
    surfaces,
    subtotal,
    taxRate,
    taxAmount,
    total,
    markupPercentage,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `quote-QT-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0 bg-background text-foreground">
        <DialogHeader className="px-6 py-4 border-b bg-background flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Quote Full View</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </Button>
          </div>
        </DialogHeader>
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto bg-white">
          <TemplateQuotePreview
            project={project}
            treatments={treatments}
            workshopItems={workshopItems}
            surfaces={surfaces}
            rooms={rooms}
            subtotal={subtotal}
            taxRate={taxRate}
            taxAmount={taxAmount}
            total={total}
            markupPercentage={markupPercentage}
            templateId={templateId}
            isFullScreen={true}
          />
        </div>

        {/* Hidden printable component */}
        <div className="hidden">
          {selectedTemplate?.blocks && (
            <PrintableQuote 
              ref={printRef}
              blocks={selectedTemplate.blocks}
              projectData={projectData}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};