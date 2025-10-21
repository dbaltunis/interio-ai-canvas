import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Mail, MoreVertical, Eye, Image as ImageIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";
import { PrintableQuote } from "./PrintableQuote";
import { EmailQuoteModal } from "./EmailQuoteModal";
import { generateQuotePDFBlob } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface QuoteFullScreenViewProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  client: any;
  businessSettings: any;
  quotationItems: any[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  markupPercentage: number;
  templateBlocks: any[];
  selectedTemplate: any;
}

export const QuoteFullScreenView: React.FC<QuoteFullScreenViewProps> = ({
  isOpen,
  onClose,
  project,
  client,
  businessSettings,
  quotationItems,
  subtotal,
  taxRate,
  taxAmount,
  total,
  markupPercentage,
  templateBlocks,
  selectedTemplate
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(true);
  const [showImages, setShowImages] = useState(false);
  const { toast } = useToast();

  const projectData = {
    project: {
      ...project,
      client: client
    },
    client,
    businessSettings,
    subtotal,
    taxRate,
    taxAmount,
    total,
    markupPercentage,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    items: quotationItems
  };

  const handleDownloadPDF = async () => {
    if (!templateBlocks || templateBlocks.length === 0) {
      toast({
        title: "Error",
        description: "No template blocks found for PDF generation",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await generateQuotePDFBlob(templateBlocks, projectData, {
        showDetailedBreakdown,
        showImages
      });
      
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
            <div className="flex items-center gap-4">
              {/* Display Options */}
              <div className="flex items-center gap-3 mr-2 border-r pr-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="detailed-breakdown"
                    checked={showDetailedBreakdown}
                    onCheckedChange={setShowDetailedBreakdown}
                  />
                  <Label htmlFor="detailed-breakdown" className="text-sm cursor-pointer">
                    <Eye className="h-4 w-4 inline mr-1" />
                    Detailed View
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-images"
                    checked={showImages}
                    onCheckedChange={setShowImages}
                  />
                  <Label htmlFor="show-images" className="text-sm cursor-pointer">
                    <ImageIcon className="h-4 w-4 inline mr-1" />
                    Show Images
                  </Label>
                </div>
              </div>
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
        <div className="flex-1 overflow-y-auto bg-white p-8">
          <LivePreview 
            blocks={templateBlocks} 
            projectData={projectData}
            isEditable={false}
          />
        </div>

        {/* Hidden printable component */}
        <div className="hidden">
          {templateBlocks && templateBlocks.length > 0 && (
            <PrintableQuote 
              ref={printRef}
              blocks={templateBlocks}
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
            // Generate PDF with current settings
            const pdfBlob = await generateQuotePDFBlob(templateBlocks, projectData, {
              showDetailedBreakdown,
              showImages
            });
            
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
          templateBlocks && templateBlocks.length > 0 && (
            <PrintableQuote 
              blocks={templateBlocks}
              projectData={projectData}
              isPrintMode={false}
            />
          )
        }
      />
    </Dialog>
  );
};