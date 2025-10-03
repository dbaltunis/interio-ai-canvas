import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Mail, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TemplateQuotePreview } from "./TemplateQuotePreview";
import { PrintableQuote } from "./PrintableQuote";
import { EmailQuoteModal } from "./EmailQuoteModal";
import { generateQuotePDFBlob } from "@/utils/pdfGenerator";
import { useQuoteTemplates } from "@/hooks/useQuoteTemplates";
import { useClients } from "@/hooks/useClients";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";

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
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { toast } = useToast();
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
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    items: treatments.map((treatment: any, index: number) => ({
      name: treatment.fabric_details?.name || treatment.treatment_name || 'Window Treatment',
      description: `${treatment.room_name || ''} - ${treatment.window_number || ''}`.trim(),
      quantity: treatment.quantity || 1,
      total: treatment.total_cost || treatment.total_price || 0,
      breakdown: treatment.itemized_breakdown || []
    }))
  };

  const handleDownloadPDF = async () => {
    if (!selectedTemplate?.blocks) {
      toast({
        title: "Error",
        description: "No template blocks found for PDF generation",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await generateQuotePDFBlob(selectedTemplate.blocks, projectData);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quote-${projectData.project.quote_number || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "PDF downloaded successfully"
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0 bg-background text-foreground">
        <DialogHeader className="px-6 py-4 border-b bg-background flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Quote Full View</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloading ? "Generating..." : "PDF"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEmailModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <MoreVertical className="h-4 w-4" />
                    <span>More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    Add Terms & Conditions
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Add Discount
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Adjust Markup
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Export Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

      <EmailQuoteModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        project={project}
        client={client}
        onSend={async (emailData) => {
          setIsSendingEmail(true);
          try {
            // Generate PDF
            const pdfBlob = await generateQuotePDFBlob(selectedTemplate?.blocks || [], projectData);
            
            // Here you would send the email with the PDF attachment
            // This requires a backend edge function
            console.log("Email data:", emailData);
            console.log("PDF blob size:", pdfBlob.size);
            
            toast({
              title: "Success",
              description: "Email functionality requires backend setup. PDF generated successfully.",
            });
            
            setIsEmailModalOpen(false);
          } catch (error) {
            console.error('Email sending failed:', error);
            toast({
              title: "Error",
              description: "Failed to generate PDF for email",
              variant: "destructive"
            });
          } finally {
            setIsSendingEmail(false);
          }
        }}
        isSending={isSendingEmail}
        quotePreview={
          selectedTemplate?.blocks && (
            <PrintableQuote 
              blocks={selectedTemplate.blocks}
              projectData={projectData}
              isPrintMode={false}
            />
          )
        }
      />
    </Dialog>
  );
};