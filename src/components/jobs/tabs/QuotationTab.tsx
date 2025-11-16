import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useQuotes, useCreateQuote } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { Download, Mail, MoreVertical, Percent, FileText, DollarSign, ImageIcon as ImageIconLucide, Printer, FileCheck, CreditCard, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";
import { useQuotationSync } from "@/hooks/useQuotationSync";
import { QuotationItemsModal } from "../quotation/QuotationItemsModal";
import { EmailQuoteModal } from "@/components/jobs/quotation/EmailQuoteModal";
import { QuotationSkeleton } from "@/components/jobs/quotation/QuotationSkeleton";
import { EmptyQuoteVersionState } from "@/components/jobs/EmptyQuoteVersionState";
import { useQuoteVersions } from "@/hooks/useQuoteVersions";
import { generateQuotePDF, generateQuotePDFBlob } from '@/utils/generateQuotePDF';
import { InlineDiscountPanel } from "@/components/jobs/quotation/InlineDiscountPanel";
import { useQuoteDiscount } from "@/hooks/useQuoteDiscount";

interface QuotationTabProps {
  projectId: string;
  quoteId?: string;
}

const removeDuplicateProductsBlocks = (blocks: any[] = []) => {
  let seen = false;
  return (blocks || []).filter(b => {
    if (b?.type !== 'products') return true;
    if (!seen) {
      seen = true;
      return true;
    }
    return false;
  });
};

export const QuotationTab = ({ projectId, quoteId }: QuotationTabProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [showQuotationItems, setShowQuotationItems] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);

  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId, quoteId);
  const { data: rooms } = useRooms(projectId, quoteId);
  const { data: surfaces } = useSurfaces(projectId);
  const { data: projectSummaries } = useProjectWindowSummaries(projectId);
  const { data: businessSettings } = useBusinessSettings();
  const { quoteVersions } = useQuoteVersions(projectId);
  const { data: quotes = [], isLoading: quotesLoading } = useQuotes(projectId);
  const createQuote = useCreateQuote();

  const project = projects?.find(p => p.id === projectId);
  
  const currentQuote = quoteVersions?.find(q => q.id === quoteId);
  const currentVersion = currentQuote?.version || 1;
  const isEmptyVersion = (rooms?.length || 0) === 0 && quoteId;


  // Fetch client data
  const { data: client } = useQuery({
    queryKey: ["project-client", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const project = projects?.find(p => p.id === projectId);
      if (!project?.client_id) return null;
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", project.client_id)
        .maybeSingle();
      if (error) {
        console.error('Error fetching client:', error);
        return null;
      }
      return data;
    },
    enabled: !!projectId && !!projects
  });

  // Fetch workshop items
  const { data: workshopItems } = useQuery({
    queryKey: ["workshop-items", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("workshop_items")
        .select("*")
        .eq("project_id", projectId);
      if (error) return [];
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000
  });

  // Fetch active quote templates - check if any valid templates exist
  const { data: activeTemplates, isLoading: templatesLoading, refetch: refetchTemplates } = useQuery({
    queryKey: ["quote-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_templates")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      
      // Filter out templates with invalid or missing blocks
      const validTemplates = (data || []).filter(template => {
        if (!template.blocks) return false;
        if (typeof template.blocks === 'string') return false;
        if (!Array.isArray(template.blocks)) return false;
        if (template.blocks.length === 0) return false;
        return true;
      });
      
      return validTemplates;
    },
    staleTime: 5 * 60 * 1000
  });

  // Set default template
  useEffect(() => {
    if (activeTemplates && activeTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(activeTemplates[0].id.toString());
    }
  }, [activeTemplates, selectedTemplateId]);

  const selectedTemplate = activeTemplates?.find(t => t.id.toString() === selectedTemplateId);

  const { buildQuotationItems } = useQuotationSync({
    projectId: projectId,
    clientId: project?.client_id || "",
    autoCreateQuote: false
  });

  // Calculate quotation data
  const quotationData = useMemo(() => {
    const data = buildQuotationItems();
    return data;
  }, [buildQuotationItems, projectSummaries?.windows, projectSummaries?.projectTotal, treatments?.length]);

  const hasQuotationItems = (quotationData.items || []).length > 0;
  const subtotal = quotationData.subtotal || 0;
  const taxAmount = quotationData.taxAmount || 0;
  const total = quotationData.total || 0;
  const taxRate = (businessSettings?.tax_rate || 0) / 100;
  const pricingSettings = businessSettings?.pricing_settings as any;
  const markupPercentage = pricingSettings?.default_markup_percentage || 50;

  // Use quotationData.items directly - they already have the correct children array with pricing!
  // DO NOT map/simplify the children array - it has the correct structure from useQuotationSync
  const sourceTreatments = (quotationData.items || []).filter(item => !item.isHeader);
  
  console.log('[QuotationTab] Items with children:', {
    itemsCount: sourceTreatments.length,
    sampleItem: sourceTreatments[0] ? {
      name: sourceTreatments[0].name,
      has_children: !!sourceTreatments[0].children,
      children_count: sourceTreatments[0].children?.length || 0,
      sample_child: sourceTreatments[0].children?.[0]
    } : null
  });

  // Get settings from template blocks safely - MUST be before early returns
  const templateSettings = useMemo(() => {
    const blocks = selectedTemplate?.blocks;
    if (!blocks || typeof blocks === 'string') return { showImages: true, showDetailedBreakdown: false, groupByRoom: false };
    const blocksArray = Array.isArray(blocks) ? blocks : [];
    const productsBlock = blocksArray.find((b: any) => b?.type === 'products') as any;
    return {
      showImages: productsBlock?.content?.showImages ?? true,
      showDetailedBreakdown: productsBlock?.content?.showDetailedBreakdown ?? true,
      groupByRoom: productsBlock?.content?.groupByRoom ?? false
    };
  }, [selectedTemplate]);

  // Function to update template settings
  const handleUpdateTemplateSettings = async (key: string, value: any) => {
    if (!selectedTemplate) return;
    
    try {
      const blocks = Array.isArray(selectedTemplate.blocks) ? selectedTemplate.blocks : [];
      const updatedBlocks = blocks.map((block: any) => {
        if (block?.type === 'products') {
          return {
            ...block,
            content: {
              ...block.content,
              [key]: value
            }
          };
        }
        return block;
      });

      const { error } = await supabase
        .from('quote_templates')
        .update({ blocks: updatedBlocks })
        .eq('id', selectedTemplate.id);

      if (error) throw error;
      
      // Refresh templates to show updated settings
      await refetchTemplates();
      
      toast({
        title: "Settings updated",
        description: "Quote display settings have been updated",
      });
    } catch (error) {
      console.error('Error updating template settings:', error);
      toast({
        title: "Error",
        description: "Failed to update template settings",
        variant: "destructive"
      });
    }
  };

  // Get template blocks safely - MUST be before early returns
  const templateBlocks = useMemo(() => {
    const blocks = selectedTemplate?.blocks;
    if (!blocks) return [];
    if (typeof blocks === 'string') return [];
    const blocksArray = Array.isArray(blocks) ? blocks : [];
    return removeDuplicateProductsBlocks(blocksArray);
  }, [selectedTemplate]);

  // Project data for LivePreview - MUST be before early returns
  const projectData = useMemo(() => {
    // Get currency from business settings
    let currency = 'GBP';
    try {
      const measurementUnits = businessSettings?.measurement_units 
        ? JSON.parse(businessSettings.measurement_units) 
        : null;
      currency = measurementUnits?.currency || 'GBP';
    } catch {
      currency = 'GBP';
    }
    
    // Calculate discount if applicable - check for discount_type, not just amount
    const hasDiscount = !!currentQuote?.discount_type;
    const discountAmount = currentQuote?.discount_amount || 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmountAfterDiscount = subtotalAfterDiscount * taxRate;
    const totalAfterDiscount = subtotalAfterDiscount + taxAmountAfterDiscount;
    
    console.log('📊 QuotationTab - projectData calculation:', {
      currentQuoteId: currentQuote?.id,
      hasDiscount,
      discountType: currentQuote?.discount_type,
      discountValue: currentQuote?.discount_value,
      discountScope: currentQuote?.discount_scope,
      discountAmount,
      originalSubtotal: subtotal,
      subtotalAfterDiscount,
      originalTaxAmount: taxAmount,
      taxAmountAfterDiscount,
      originalTotal: total,
      totalAfterDiscount,
      willPassToLivePreview: {
        subtotal: subtotal,
        taxAmount: hasDiscount ? taxAmountAfterDiscount : taxAmount,
        total: hasDiscount ? totalAfterDiscount : total,
        hasDiscountObject: hasDiscount
      }
    });
    
    
    return {
      quoteId: currentQuote?.id,
      project: { ...project, client },
      client,
      businessSettings,
      items: sourceTreatments,
      treatments: sourceTreatments,
      workshopItems: workshopItems || [],
      rooms: rooms || [],
      surfaces: surfaces || [],
      subtotal: hasDiscount ? subtotalAfterDiscount : subtotal,
      taxRate,
      taxAmount: hasDiscount ? taxAmountAfterDiscount : taxAmount,
      total: hasDiscount ? totalAfterDiscount : total,
      currency,
      markupPercentage,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      discount: hasDiscount ? {
        type: currentQuote.discount_type,
        value: currentQuote.discount_value,
        amount: discountAmount,
        scope: currentQuote.discount_scope
      } : undefined,
      payment: currentQuote ? {
        type: currentQuote.payment_type || 'full',
        percentage: currentQuote.payment_percentage,
        amount: currentQuote.payment_amount || total,
        status: currentQuote.payment_status
      } : undefined
    };
  }, [project, client, businessSettings, sourceTreatments, workshopItems, rooms, surfaces, subtotal, taxRate, taxAmount, total, markupPercentage, currentQuote]);

  // Download PDF
  const handleDownloadPDF = async () => {
    const element = document.getElementById('quote-live-preview');
    if (!element) {
      toast({
        title: "Error",
        description: "Quote preview not ready. Please wait a moment.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const filename = `quote-${project?.job_number || 'QT'}.pdf`;
      await generateQuotePDF(element, { filename });
      toast({
        title: "Success",
        description: "PDF downloaded successfully"
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Print (open PDF in new tab)
  const handlePrint = async () => {
    const element = document.getElementById('quote-live-preview');
    if (!element) {
      toast({
        title: "Error",
        description: "Quote preview not ready",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const blob = await generateQuotePDFBlob(element);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Error",
        description: "Failed to open print preview",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Email quote
  const handleSendEmail = async (emailData: { to: string; subject: string; message: string }) => {
    const element = document.getElementById('quote-live-preview');
    if (!element) {
      toast({
        title: "Error",
        description: "Quote preview not ready. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we prepare your quote"
      });

      const pdfBlob = await generateQuotePDFBlob(element);
      const timestamp = Date.now();
      const fileName = `quote-${project?.job_number || 'QT'}-${timestamp}.pdf`;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const filePath = `${user.id}/quotes/${fileName}`;

      toast({
        title: "Uploading PDF...",
        description: "Preparing attachment"
      });

      const { error: uploadError } = await supabase.storage
        .from('email-attachments')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true,
          metadata: {
            user_id: user.id,
            client_id: project?.client_id || '',
            project_id: projectId
          }
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload PDF: ${uploadError.message}`);
      }

      toast({
        title: "Sending Email...",
        description: "Delivering quote to recipient"
      });

      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailData.to,
          subject: emailData.subject,
          content: emailData.message,
          user_id: user.id,
          client_id: project?.client_id,
          attachmentPaths: [filePath]
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        throw new Error(`Failed to send email: ${emailError.message}`);
      }

      toast({
        title: "Email Sent Successfully",
        description: `Quote sent to ${emailData.to}`
      });
      setIsEmailModalOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getOrCreateQuoteId = async (): Promise<string | null> => {
    // If we already have a quoteId, use it
    if (quoteId) return quoteId;
    
    // If there's an existing quote for this project, use the first one
    if (quoteVersions && quoteVersions.length > 0) {
      return quoteVersions[0].id;
    }
    
    // Otherwise, create a new quote
    try {
      const newQuote = await createQuote.mutateAsync({
        project_id: projectId,
        client_id: project?.client_id,
        status: 'draft',
        version: 1,
      });
      return newQuote.id;
    } catch (error) {
      console.error('Failed to create quote:', error);
      toast({
        title: "Error",
        description: "Failed to create quote. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleAddDiscount = async () => {
    const effectiveQuoteId = await getOrCreateQuoteId();
    if (!effectiveQuoteId) return;
    
    // Toggle the inline discount panel
    setIsDiscountDialogOpen(!isDiscountDialogOpen);
    
    // Force refetch of quote versions when opening discount panel
    await queryClient.invalidateQueries({ queryKey: ["quote-versions", projectId] });
  };

  const handleAddTerms = () => {
    toast({ title: "Add Terms & Conditions", description: "Terms & Conditions functionality would be implemented here" });
  };

  const handlePayment = () => {
    const paymentSection = document.getElementById('payment-section');
    if (paymentSection) {
      paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a subtle highlight animation
      paymentSection.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        paymentSection.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 2000);
    } else {
      toast({ 
        title: "Payment Section", 
        description: "Please save the quote first to configure payment options",
        variant: "destructive"
      });
    }
  };

  if (!project) {
    return <div className="flex items-center justify-center py-12">
      <div className="text-muted-foreground">Loading project...</div>
    </div>;
  }

  if (templatesLoading || quotesLoading) {
    return <QuotationSkeleton />;
  }

  if (!activeTemplates || activeTemplates.length === 0) {
    return <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="text-muted-foreground mb-4">No active quote templates found</div>
        <p className="text-sm text-muted-foreground">
          Please create and activate quote templates in Settings → Document Templates
        </p>
      </div>
    </div>;
  }

  return (
    <div className="space-y-2 sm:space-y-3 pb-4 overflow-x-hidden">
      {/* Header with Actions - Improved Organization */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-base sm:text-lg font-semibold">Quotation</h2>
              
              {/* Template Selector */}
              {activeTemplates && activeTemplates.length > 1 && (
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger className="w-[200px] h-8">
                    <FileCheck className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Generate and send professional quotes or invoices</p>
          </div>

          {/* Action Buttons - Better organized */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Primary Action */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF || !selectedTemplate}
              className="h-9 px-4"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </Button>

            {/* Secondary Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEmailModalOpen(true)}
              disabled={isGeneratingPDF || !selectedTemplate}
              className="h-9 px-4"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>

            {/* Discount Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddDiscount}
              disabled={createQuote.isPending}
              className="h-9 px-4"
            >
              <Percent className="h-4 w-4 mr-2" />
              Discount
            </Button>

            {/* Payment Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePayment}
              disabled={createQuote.isPending}
              className="h-9 px-4"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleAddTerms}>
                  <FileText className="h-4 w-4 mr-2" />
                  Add Terms & Conditions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Preview
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quote Display Options - Toggle Controls */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Display Options:</span>
          
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Switch
              checked={templateSettings.groupByRoom}
              onCheckedChange={(checked) => {
                handleUpdateTemplateSettings('groupByRoom', checked);
              }}
            />
            <span className="text-sm">Group by room</span>
          </label>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleUpdateTemplateSettings('showDetailedBreakdown', !templateSettings.showDetailedBreakdown);
            }}
            className="h-8"
          >
            {templateSettings.showDetailedBreakdown ? 'Simple View' : 'Detailed View'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleUpdateTemplateSettings('showImages', !templateSettings.showImages);
            }}
            className="h-8"
          >
            <ImageIconLucide className="h-4 w-4 mr-2" />
            {templateSettings.showImages ? 'Hide Images' : 'Show Images'}
          </Button>
        </div>
      </Card>

      {/* Inline Discount Panel */}
      <InlineDiscountPanel
        isOpen={isDiscountDialogOpen}
        onClose={() => setIsDiscountDialogOpen(false)}
        quoteId={quoteId || quoteVersions?.[0]?.id || ''}
        projectId={projectId}
        items={quotationData.items || []}
        subtotal={subtotal}
        taxRate={taxRate * 100}
        currency={projectData.currency}
        currentDiscount={currentQuote?.discount_type ? {
          type: currentQuote.discount_type as 'percentage' | 'fixed',
          value: currentQuote.discount_value || 0,
          scope: currentQuote.discount_scope as 'all' | 'fabrics_only' | 'selected_items',
          amount: currentQuote.discount_amount || 0,
          selectedItems: (currentQuote.selected_discount_items as string[]) || undefined,
        } : undefined}
      />

      {/* Quotation Items Modal */}
      <QuotationItemsModal
        key={`quote-modal-${projectSummaries?.projectTotal}-${quotationData.items?.length}`}
        isOpen={showQuotationItems}
        onClose={() => setShowQuotationItems(false)}
        quotationData={quotationData}
        currency="GBP"
        treatments={sourceTreatments}
        rooms={rooms || []}
        surfaces={surfaces || []}
        markupPercentage={markupPercentage}
      />

      {/* Quote Preview */}
      {isEmptyVersion ? (
        <EmptyQuoteVersionState
          currentVersion={currentVersion}
          onAddRoom={() => {
            const roomsTab = document.querySelector('[data-state="inactive"]') as HTMLElement;
            if (roomsTab) roomsTab.click();
          }}
        />
      ) : !selectedTemplate || !templateBlocks || templateBlocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Quote Template Found</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            You need to create a quote template before you can generate quotes. Go to Settings → Documents to create your first template.
          </p>
          <Button
            onClick={() => {
              // Navigate to settings/documents tab
              window.location.href = '/?settings=documents';
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      ) : (
        <section className="mt-2 sm:mt-4" key={`preview-${selectedTemplate?.id}-${templateSettings.showDetailedBreakdown}-${templateSettings.showImages}-${templateSettings.groupByRoom}-${projectSummaries?.projectTotal}`}>
          {/* A4 Background Container - Gray background to simulate paper on desk */}
          <div className="w-full flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/50 dark:from-background dark:to-card/20 py-8 rounded-lg border border-border/40">
            <div className="transform scale-[0.52] sm:scale-[0.72] md:scale-[0.85] lg:scale-[0.95] xl:scale-[1.0] origin-center shadow-2xl dark:shadow-xl">
              <div
                id="quote-live-preview"
                className="quote-preview-container bg-document text-document-foreground"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: '10pt',
                  padding: '8mm',
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
                <LivePreview
                  key={`live-preview-${templateSettings.showDetailedBreakdown}-${templateSettings.showImages}-${templateSettings.groupByRoom}`}
                  blocks={templateBlocks}
                  projectData={projectData}
                  isEditable={false}
                  isPrintMode={true}
                  showDetailedBreakdown={templateSettings.showDetailedBreakdown}
                  showImages={templateSettings.showImages}
                  groupByRoom={templateSettings.groupByRoom}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Email Modal */}
      <EmailQuoteModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        project={project}
        client={client}
        onSend={handleSendEmail}
        isSending={isSendingEmail}
        quotePreview={
          <LivePreview
            blocks={templateBlocks}
            projectData={projectData}
            isEditable={false}
            isPrintMode={true}
            showDetailedBreakdown={templateSettings.showDetailedBreakdown}
            showImages={templateSettings.showImages}
          />
        }
      />


    </div>
  );
};
