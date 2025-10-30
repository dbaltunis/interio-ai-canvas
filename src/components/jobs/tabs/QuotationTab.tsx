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
import { Download, Mail, MoreVertical, Percent, FileText, DollarSign, ImageIcon as ImageIconLucide, Printer } from "lucide-react";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";
import { useQuotationSync } from "@/hooks/useQuotationSync";
import { QuotationItemsModal } from "../quotation/QuotationItemsModal";
import { EmailQuoteModal } from "@/components/jobs/quotation/EmailQuoteModal";
import { QuotationSkeleton } from "@/components/jobs/quotation/QuotationSkeleton";
import { EmptyQuoteVersionState } from "@/components/jobs/EmptyQuoteVersionState";
import { useQuoteVersions } from "@/hooks/useQuoteVersions";
import { generateQuotePDF, generateQuotePDFBlob } from '@/utils/generateQuotePDF';

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [showQuotationItems, setShowQuotationItems] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId, quoteId);
  const { data: rooms } = useRooms(projectId, quoteId);
  const { data: surfaces } = useSurfaces(projectId);
  const { data: projectSummaries } = useProjectWindowSummaries(projectId);
  const { data: businessSettings } = useBusinessSettings();
  const { quoteVersions } = useQuoteVersions(projectId);
  const { data: quotes = [], isLoading: quotesLoading } = useQuotes(projectId);
  const createQuote = useCreateQuote();

  const currentQuote = quoteVersions?.find(q => q.id === quoteId);
  const currentVersion = currentQuote?.version || 1;
  const isEmptyVersion = (rooms?.length || 0) === 0 && quoteId;

  const project = projects?.find(p => p.id === projectId);

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

  // Fetch active quote templates
  const { data: activeTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ["quote-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_templates")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
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

  // Get settings from template blocks safely
  const templateSettings = useMemo(() => {
    const blocks = selectedTemplate?.blocks;
    if (!blocks || typeof blocks === 'string') return { showImages: true, showDetailedBreakdown: false, groupByRoom: false };
    const blocksArray = Array.isArray(blocks) ? blocks : [];
    const productsBlock = blocksArray.find((b: any) => b?.type === 'products') as any;
    return {
      showImages: productsBlock?.content?.showImages ?? true,
      showDetailedBreakdown: productsBlock?.content?.showDetailedBreakdown ?? false,
      groupByRoom: productsBlock?.content?.groupByRoom ?? false
    };
  }, [selectedTemplate]);

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

  const sourceTreatments = (quotationData.items || []).filter(item => !item.isHeader).map(item => ({
    id: item.id,
    room_id: item.room_id || '',
    window_id: item.surface_id || '',
    treatment_type: item.treatment_type || item.name,
    product_name: item.name,
    total_price: item.total || 0,
    currency: item.currency || 'GBP',
    breakdown: item.breakdown || [],
    quantity: item.quantity || 1,
    unit_price: item.unit_price || 0,
    room_name: item.room_name,
    surface_name: item.surface_name,
    description: item.description
  }));

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

  const handleAddDiscount = () => {
    toast({ title: "Add Discount", description: "Discount functionality would be implemented here" });
  };

  const handleAddTerms = () => {
    toast({ title: "Add Terms & Conditions", description: "Terms & Conditions functionality would be implemented here" });
  };

  const handleAddDeposit = () => {
    toast({ title: "Add Deposit", description: "Deposit functionality would be implemented here" });
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

  const templateBlocks = useMemo(() => {
    const blocks = selectedTemplate?.blocks;
    if (!blocks) return [];
    if (typeof blocks === 'string') return [];
    const blocksArray = Array.isArray(blocks) ? blocks : [];
    return removeDuplicateProductsBlocks(blocksArray);
  }, [selectedTemplate]);

  const projectData = {
    project: { ...project, client },
    client,
    businessSettings,
    treatments: sourceTreatments,
    workshopItems: workshopItems || [],
    rooms: rooms || [],
    surfaces: surfaces || [],
    subtotal,
    taxRate,
    taxAmount,
    total,
    markupPercentage,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  return (
    <div className="space-y-2 sm:space-y-3 pb-4 overflow-x-hidden">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">Quotation</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF || !selectedTemplate}
            className="h-8 px-2 sm:px-3"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">
              {isGeneratingPDF ? 'Generating...' : 'PDF'}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            disabled={isGeneratingPDF || !selectedTemplate}
            className="hidden sm:flex h-8"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEmailModalOpen(true)} className="sm:hidden">
                <Mail className="mr-2 h-4 w-4" />
                Email Quote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddDiscount}>
                <Percent className="h-4 w-4 mr-2" />
                Add Discount
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddTerms}>
                <FileText className="h-4 w-4 mr-2" />
                Add T&C
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddDeposit}>
                <DollarSign className="h-4 w-4 mr-2" />
                Add Deposit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quote Display Options - using template settings */}
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-max">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              <ImageIconLucide className="h-3 w-3 inline mr-1" />
              Images: {templateSettings.showImages ? 'On' : 'Off'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              Detailed: {templateSettings.showDetailedBreakdown ? 'On' : 'Off'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            (Configure in Settings → Document Templates)
          </div>
        </div>
      </div>

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
      ) : (
        <section className="mt-2 sm:mt-4" key={`preview-${projectSummaries?.projectTotal}-${quotationData.total}`}>
          <div className="w-full flex justify-center">
            <div className="transform scale-[0.38] sm:scale-[0.55] md:scale-[0.65] lg:scale-75 xl:scale-90 origin-top">
              <div
                id="quote-live-preview"
                className="bg-white"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '15mm 10mm',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: '11pt',
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              >
                <LivePreview
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
          templateBlocks && templateBlocks.length > 0 ? (
            <LivePreview
              blocks={templateBlocks}
              projectData={projectData}
              isEditable={false}
            />
          ) : undefined
        }
      />
    </div>
  );
};
