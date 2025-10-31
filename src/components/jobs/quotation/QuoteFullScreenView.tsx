import React, { useRef, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Mail, MoreVertical, Eye, Image as ImageIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";
import { PrintableQuote } from "./PrintableQuote";
import { EmailQuoteModal } from "./EmailQuoteModal";
import { useToast } from "@/hooks/use-toast";
import { prepareQuoteData } from "@/utils/quotes/prepareQuoteData";

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
  projectSummaries?: any;
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
  selectedTemplate,
  projectSummaries
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(true);
  const [showImages, setShowImages] = useState(false);
  const { toast } = useToast();

  // Prepare the project data structure for LivePreview
  // CRITICAL: Use quotationItems from props - they have the children array with pricing!
  const projectData = useMemo(() => ({
    project: {
      ...project,
      client: client
    },
    client,
    businessSettings,
    windowSummaries: projectSummaries || project?.window_summaries || project?.windowSummaries,
    items: quotationItems, // Use the items with children array directly
    subtotal,
    taxRate,
    taxAmount,
    total,
    markupPercentage,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }), [project, client, businessSettings, projectSummaries, quotationItems, subtotal, taxRate, taxAmount, total, markupPercentage]);

  const handleDownloadPDF = () => {
    // Open browser's native print dialog - most reliable approach
    // This is what Google Sheets, Excel Online, and professional ERPs use
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1400px] h-[90vh] flex flex-col p-0 bg-background text-foreground">
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
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Print / Save as PDF</span>
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
        
        {/* Scrollable content area - visible on screen */}
        <div className="flex-1 overflow-y-auto bg-white p-8 no-print">
          <div ref={previewRef}>
            <LivePreview 
              blocks={templateBlocks} 
              projectData={projectData}
              isEditable={false}
              isPrintMode={false}
              showDetailedBreakdown={showDetailedBreakdown}
              showImages={showImages}
              onSettingsChange={(settings) => {
                if (settings.showDetailedBreakdown !== undefined) setShowDetailedBreakdown(settings.showDetailedBreakdown);
                if (settings.showImages !== undefined) setShowImages(settings.showImages);
              }}
            />
          </div>
        </div>
        
        {/* Print-only version - hidden on screen, visible when printing */}
        <div 
          id="printable-quote-area"
          style={{ display: 'none' }}
          className="print:block"
        >
          <LivePreview 
            blocks={templateBlocks} 
            projectData={projectData}
            isEditable={false}
            isPrintMode={true}
            showDetailedBreakdown={showDetailedBreakdown}
            showImages={showImages}
          />
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
            toast({
              title: "Info",
              description: "Email functionality coming soon. Use Print/PDF button to download and send manually.",
            });
            setIsEmailModalOpen(false);
          } catch (error) {
            console.error('Email sending failed:', error);
            toast({
              title: "Error",
              description: "Failed to send email",
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