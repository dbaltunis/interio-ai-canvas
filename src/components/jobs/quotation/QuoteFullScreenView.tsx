import React, { useRef, useState, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Mail, MoreVertical, Eye, Image as ImageIcon, CreditCard, FileSpreadsheet, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";
import { PrintableQuote } from "./PrintableQuote";
import { EmailQuoteModal } from "./EmailQuoteModal";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { useToast } from "@/hooks/use-toast";
import { prepareQuoteData } from "@/utils/quotes/prepareQuoteData";
import { exportInvoiceToCSV, exportInvoiceForXero, exportInvoiceForQuickBooks, prepareInvoiceExportData } from "@/utils/invoiceExport";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useHasPermission } from "@/hooks/usePermissions";

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
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [isImageEditMode, setIsImageEditMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canExportJobs = useHasPermission('export_jobs');

  // Handle item image change (upload or library pick)
  const handleItemImageChange = useCallback(async (itemId: string, imageUrl: string | null) => {
    try {
      // Find the quote item by matching itemId against quote_items
      const quoteId = project?.quotes?.[0]?.id;
      if (!quoteId) return;

      // Fetch current item to get product_details
      const { data: items } = await supabase
        .from("quote_items")
        .select("id, product_details")
        .eq("quote_id", quoteId) as any;

      if (!items) return;

      // Find item by id or by matching surface_name in product_details
      const targetItem = items.find((item: any) => {
        if (item.id === itemId) return true;
        const pd = item.product_details as any;
        return pd?.surface_id === itemId || pd?.item_key === itemId;
      });

      if (!targetItem) {
        console.warn("Could not find quote item for image change:", itemId);
        return;
      }

      const currentPd = (targetItem.product_details as any) || {};
      const updatedPd = {
        ...currentPd,
        image_url_override: imageUrl,
      };

      await supabase
        .from("quote_items")
        .update({ product_details: updatedPd } as any)
        .eq("id", targetItem.id);

      // Invalidate quote items cache to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      queryClient.invalidateQueries({ queryKey: ["quotation"] });
    } catch (err) {
      console.error("Failed to update item image:", err);
      toast({
        title: "Error",
        description: "Failed to update product image",
        variant: "destructive",
      });
    }
  }, [project, queryClient, toast]);

  // Get document type and quote info
  const documentType = selectedTemplate?.template_style || 'quote';
  const isInvoice = documentType === 'invoice';
  const quote = project?.quotes?.[0] || {};
  const amountPaid = quote?.amount_paid || 0;
  const paymentStatus = quote?.payment_status || 'unpaid';
  const dueDate = quote?.due_date || null;
  const currency = businessSettings?.currency || 'GBP';

  

  // Handle CSV export
  const handleExportCSV = (format: 'generic' | 'xero' | 'quickbooks') => {
    if (canExportJobs === false) {
      toast({ title: "Export not allowed", description: "You don't have permission to export job data.", variant: "destructive" });
      return;
    }
    const exportData = prepareInvoiceExportData(quote, client, quotationItems, businessSettings);
    
    switch (format) {
      case 'xero':
        exportInvoiceForXero(exportData);
        toast({ title: "Exported", description: "Xero-compatible CSV downloaded" });
        break;
      case 'quickbooks':
        exportInvoiceForQuickBooks(exportData);
        toast({ title: "Exported", description: "QuickBooks-compatible CSV downloaded" });
        break;
      default:
        exportInvoiceToCSV(exportData);
        toast({ title: "Exported", description: "CSV file downloaded" });
    }
  };

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
                    onCheckedChange={(checked) => {
                      setShowImages(checked);
                      if (!checked) setIsImageEditMode(false);
                    }}
                  />
                  <Label htmlFor="show-images" className="text-sm cursor-pointer">
                    <ImageIcon className="h-4 w-4 inline mr-1" />
                    Show Images
                  </Label>
                </div>
                {showImages && (
                  <Button
                    variant={isImageEditMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsImageEditMode(!isImageEditMode)}
                    className="flex items-center gap-1.5 h-8"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="text-xs">{isImageEditMode ? 'Done Editing' : 'Edit Images'}</span>
                  </Button>
                )}
                <Button
                  variant={isEditMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="flex items-center gap-1.5 h-8"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="text-xs">{isEditMode ? 'Done Editing' : 'Edit Fields'}</span>
                </Button>
              </div>
              
              {/* Record Payment - Only for invoices */}
              {isInvoice && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaymentDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Record Payment</span>
                </Button>
              )}
              
              {/* Export dropdown - Only for invoices */}
              {isInvoice && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Export</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExportCSV('generic')}>
                      Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExportCSV('xero')}>
                      Export for Xero
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportCSV('quickbooks')}>
                      Export for QuickBooks
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
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
              isEditable={isEditMode}
              isPrintMode={false}
              documentType={selectedTemplate?.template_style || 'quote'}
              showDetailedBreakdown={showDetailedBreakdown}
              showImages={showImages}
              onSettingsChange={(settings) => {
                if (settings.showDetailedBreakdown !== undefined) setShowDetailedBreakdown(settings.showDetailedBreakdown);
                if (settings.showImages !== undefined) setShowImages(settings.showImages);
              }}
              onItemImageChange={handleItemImageChange}
              isImageEditMode={isImageEditMode}
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
              documentType={selectedTemplate?.template_style || 'quote'}
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

      {/* Record Payment Dialog - Only for invoices */}
      {isInvoice && (
        <RecordPaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          quoteId={quote?.id || ''}
          total={total}
          amountPaid={amountPaid}
          currency={currency}
          paymentStatus={paymentStatus}
          dueDate={dueDate}
        />
      )}
    </Dialog>
  );
};