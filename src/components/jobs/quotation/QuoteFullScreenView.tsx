import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { TemplateQuotePreview } from "./TemplateQuotePreview";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
  templateId
}) => {
  const handleDownloadPDF = async () => {
    const element = document.querySelector('.pdf-document-content') as HTMLElement;
    if (!element) return;

    try {
      // Create a clean clone for PDF generation
      const clone = element.cloneNode(true) as HTMLElement;
      clone.className = 'pdf-document-content bg-white text-black p-8 max-w-none mx-0';
      
      // Temporarily add to body for capture
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '794px'; // A4 width in pixels at 96dpi
      clone.style.background = 'white';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        logging: false,
        width: 794,
        height: clone.scrollHeight,
        ignoreElements: (element) => {
          return element.classList.contains('no-print') || 
                 element.closest('.no-print') !== null;
        }
      });

      // Remove the clone
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const quoteNumber = `QT-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      pdf.save(`quote-${quoteNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0 bg-background text-foreground">
        <DialogHeader className="px-6 py-4 border-b bg-background flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Quote Full View</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden bg-white">
          <div className="h-full overflow-y-auto">
            <TemplateQuotePreview
          project={project}
          treatments={treatments}
          subtotal={subtotal}
          taxRate={taxRate}
          taxAmount={taxAmount}
          total={total}
          markupPercentage={markupPercentage}
          templateId={templateId}
          isFullScreen={true}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};