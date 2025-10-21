
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useQuotes, useCreateQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { Percent, FileText, Mail, Eye, EyeOff, Settings, Plus, StickyNote, List, Download, MoreVertical, DollarSign } from "lucide-react";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";
import { QuoteViewer } from "../QuoteViewer";
import { TreatmentLineItems } from "@/components/jobs/quotation/TreatmentLineItems";
import { formatCurrency } from "@/utils/currency";
import { ProjectNotesCard } from "../ProjectNotesCard";
import { JobNotesDialog } from "../JobNotesDialog";
import { QuoteFullScreenView } from "@/components/jobs/quotation/QuoteFullScreenView";
import { useQuotationSync } from "@/hooks/useQuotationSync";
import { QuotationItemsModal } from "../quotation/QuotationItemsModal";
import { DetailedQuotationTable } from "../quotation/DetailedQuotationTable";
import { useReactToPrint } from "react-to-print";
import { PrintableQuote } from "@/components/jobs/quotation/PrintableQuote";
import { EmailQuoteModal } from "@/components/jobs/quotation/EmailQuoteModal";
import { useQuoteTemplates } from "@/hooks/useQuoteTemplates";
import { useClients } from "@/hooks/useClients";
import { QuotationSkeleton } from "@/components/jobs/quotation/QuotationSkeleton";

interface QuotationTabProps {
  projectId: string;
}

// Helper: keep only the first 'products' block to avoid duplicates in preview
const removeDuplicateProductsBlocks = (blocks: any[] = []) => {
  let seen = false;
  return (blocks || []).filter((b) => {
    if (b?.type !== 'products') return true;
    if (!seen) {
      seen = true;
      return true;
    }
    return false;
  });
};


export const QuotationTab = ({ projectId }: QuotationTabProps) => {
  const { toast } = useToast();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);
  const { data: projectSummaries } = useProjectWindowSummaries(projectId);
  const { data: businessSettings } = useBusinessSettings();
  
  // Fetch client data for the project
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
    enabled: !!projectId && !!projects,
  });
  
  // Fetch workshop items - with caching and disabled by default
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  // Fetch quote templates from database - with caching
  const { data: activeTemplates, isLoading: templatesLoading, refetch: refetchTemplates } = useQuery({
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
    staleTime: 5 * 60 * 1000, // 5 minutes - reduce refetching
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
  const { data: quotes = [], isLoading: quotesLoading } = useQuotes(projectId);
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();

  const [showItemsEditor, setShowItemsEditor] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [editedTemplateBlocks, setEditedTemplateBlocks] = useState<any[] | null>(null);
  const project = projects?.find(p => p.id === projectId);
  const [notesOpen, setNotesOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [showFullQuoteView, setShowFullQuoteView] = useState(false);
  const [showQuotationItems, setShowQuotationItems] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { data: clients } = useClients();
  const { data: templates } = useQuoteTemplates();

  const { buildQuotationItems } = useQuotationSync({
    projectId: projectId,
    clientId: project?.client_id || "",
    autoCreateQuote: false
  });

  // ALWAYS recalculate quotation data when source data changes
  const quotationData = useMemo(() => {
    const data = buildQuotationItems();
    console.log('[QUOTATION TAB] ===== LIVE QUOTE RECALCULATED =====');
    console.log('[QUOTATION TAB] Window Summaries:', {
      windowCount: projectSummaries?.windows?.length || 0,
      projectTotal: projectSummaries?.projectTotal,
      windows: projectSummaries?.windows?.map(w => ({
        id: w.window_id,
        name: w.surface_name,
        cost: w.summary?.total_cost
      }))
    });
    console.log('[QUOTATION TAB] Quote Result:', {
      baseSubtotal: data.baseSubtotal,
      subtotal: data.subtotal,
      total: data.total,
      itemCount: data.items.length,
      items: data.items.map((item: any) => ({
        name: item.name,
        total: item.total
      }))
    });
    return data;
  }, [buildQuotationItems, projectSummaries?.windows, projectSummaries?.projectTotal, treatments?.length]);

  // Filter quotes for this specific project (already filtered by hook)
  const projectQuotes = quotes;

  // Set default template when templates load
  useEffect(() => {
    if (activeTemplates && activeTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(activeTemplates[0].id.toString());
    }
  }, [activeTemplates, selectedTemplateId]);

  // Get selected template
  const selectedTemplate = activeTemplates?.find(t => t.id.toString() === selectedTemplateId);

  // Use quotation data from sync
  const hasQuotationItems = (quotationData.items || []).length > 0;
  
  // Use calculated values from quotation sync (NO HARDCODED VALUES!)
  const baseSubtotal = quotationData.baseSubtotal || 0;
  const subtotal = quotationData.subtotal || 0;
  const taxAmount = quotationData.taxAmount || 0;
  const total = quotationData.total || 0;
  
  // Get tax rate from business settings (convert to decimal for display)
  const taxRate = (businessSettings?.tax_rate || 0) / 100;
  const pricingSettings = businessSettings?.pricing_settings as any;
  const markupPercentage = pricingSettings?.default_markup_percentage || 50;

  // Transform quotation items to match expected format for backward compatibility
  const sourceTreatments = (quotationData.items || [])
    .filter(item => !item.isHeader)
    .map(item => ({
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
      description: item.description,
    }));

  console.log('🔍 QuotationTab Debug:', {
    hasQuotationItems,
    itemsCount: quotationData.items?.length,
    baseSubtotal,
    subtotal,
    taxAmount,
    total,
    sourceTreatments: sourceTreatments.slice(0, 2) // Log first 2 for debugging
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `quote-${project?.job_number || 'QT-' + Math.floor(Math.random() * 10000)}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `
  });

  const handleSendEmail = async (emailData: { to: string; subject: string; message: string }) => {
    if (!printRef.current) {
      toast({
        title: "Error",
        description: "Quote template not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    
    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we prepare your quote",
      });

      // Import the new PDF generator
      const { generateQuotePDFFromElement } = await import('@/utils/pdfGenerator');
      
      // Generate PDF from the actual preview element
      const pdfBlob = await generateQuotePDFFromElement(
        printRef.current,
        `quote-${project?.job_number || 'QT'}.pdf`
      );
      
      console.log('PDF Blob generated:', pdfBlob.size, 'bytes');

      // Generate unique filename with timestamp to avoid conflicts
      const timestamp = Date.now();
      const fileName = `quote-${project?.job_number || 'QT'}-${timestamp}.pdf`;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const filePath = `${user.id}/quotes/${fileName}`;
      
      toast({
        title: "Uploading PDF...",
        description: "Preparing attachment",
      });

      const { error: uploadError } = await supabase.storage
        .from('email-attachments')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true, // Allow overwriting if needed
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

      console.log('PDF uploaded to:', filePath);

      toast({
        title: "Sending Email...",
        description: "Delivering quote to recipient",
      });

      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailData.to,
          subject: emailData.subject,
          content: emailData.message,
          user_id: user.id,
          client_id: project?.client_id,
          attachmentPaths: [filePath],
        },
      });

      if (emailError) {
        console.error('Email error:', emailError);
        throw new Error(`Failed to send email: ${emailError.message}`);
      }

      toast({
        title: "Email Sent Successfully",
        description: `Quote sent to ${emailData.to}`,
      });
      
      setIsEmailModalOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleAddDiscount = () => {
    toast({
      title: "Add Discount",
      description: "Discount functionality would be implemented here",
    });
  };

  const handleAddTerms = () => {
    toast({
      title: "Add Terms & Conditions",
      description: "Terms & Conditions functionality would be implemented here",
    });
  };

  const handleAddDeposit = () => {
    toast({
      title: "Add Deposit",
      description: "Deposit functionality would be implemented here",
    });
  };

  const handleCreateNewQuote = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template before creating a quote.",
        variant: "destructive",
      });
      return;
    }

    // Generate quote number
    const quoteNumber = `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Calculate valid until date (30 days from now)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    await createQuote.mutateAsync({
      project_id: projectId,
      client_id: project?.client_id,
      quote_number: quoteNumber,
      status: 'draft',
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: total,
      valid_until: validUntil.toISOString().split('T')[0],
      notes: `Generated from template: ${selectedTemplate.name}`,
    });
  };


  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (templatesLoading || quotesLoading) {
    return <QuotationSkeleton />;
  }

  if (!activeTemplates || activeTemplates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">No active quote templates found</div>
          <p className="text-sm text-muted-foreground">
            Please create and activate quote templates in Settings → Document Templates
          </p>
        </div>
      </div>
    );
  }

// Use template blocks as-is to mirror Settings preview precisely, but guard against duplicate products blocks
// Use edited blocks if available, otherwise use template blocks
const baseBlocks = editedTemplateBlocks || (selectedTemplate?.blocks && Array.isArray(selectedTemplate.blocks) ? selectedTemplate.blocks : []);
const templateBlocks = removeDuplicateProductsBlocks(baseBlocks);

const selectedQuoteTemplate = templates?.find(t => t.id === selectedTemplateId);
const clientData = clients?.find(c => c.id === project?.client_id);

const projectData = {
  project,
  client: clientData,
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
    <div className="space-y-4 sm:space-y-6">
      {/* Modern Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Quotation</h2>
        </div>
        
        {/* Compact Action Bar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View Quote Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullQuoteView(true)}
            className="flex-1 sm:flex-none relative z-10 pointer-events-auto"
          >
            <Eye className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">View Quote</span>
          </Button>

          {/* Save PDF Button */}
          <Button
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="flex-1 sm:flex-none relative z-10 pointer-events-auto"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Save PDF</span>
          </Button>

          {/* Email Button - Hidden on mobile, shown in dropdown */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            className="hidden sm:flex relative z-10 pointer-events-auto"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>

          {/* More Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative z-10 pointer-events-auto">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 bg-background border shadow-md">
              <DropdownMenuItem 
                onClick={() => setIsEmailModalOpen(true)}
                className="sm:hidden"
              >
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

      {/* Detailed Options Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Template Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">Template:</span>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {activeTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      </div>


      {/* Quotation Items Modal - Force refresh when data changes */}
      <QuotationItemsModal
        key={`quote-modal-${projectSummaries?.projectTotal}-${quotationData.items?.length}-${Date.now()}`}
        isOpen={showQuotationItems}
        onClose={() => setShowQuotationItems(false)}
        quotationData={quotationData}
        currency="GBP"
        treatments={sourceTreatments}
        rooms={rooms || []}
        surfaces={surfaces || []}
        markupPercentage={markupPercentage}
      />

      {/* Quote Document Preview - Force refresh with key */}
      {selectedTemplate && (
        <section className="mt-6" key={`preview-${projectSummaries?.projectTotal}-${quotationData.total}-${selectedTemplateId}`}>
          <LivePreview
            blocks={templateBlocks}
            projectData={{
              project: {
                ...project,
                client: client
              },
              client: client,
              businessSettings: businessSettings || {},
              treatments: sourceTreatments,
              rooms: rooms || [],
              surfaces: surfaces || [],
              subtotal: quotationData.subtotal || 0,
              taxRate: businessSettings?.tax_rate ? businessSettings.tax_rate / 100 : 0.08,
              taxAmount: quotationData.taxAmount || 0,
              total: quotationData.total || 0,
              markupPercentage: markupPercentage,
              currency: (businessSettings?.measurement_units ? 
                (typeof businessSettings.measurement_units === 'string' ? JSON.parse(businessSettings.measurement_units) : businessSettings.measurement_units).currency 
                : null) || 'GBP',
              windowSummaries: projectSummaries?.windows || [],
              workshopItems: workshopItems || [],
              items: quotationData.items || [] // Pass the actual quote items
            }}
            isEditable={false}
            onBlocksChange={(updatedBlocks) => {
              // Update edited template blocks when user makes changes (like date selection)
              setEditedTemplateBlocks(updatedBlocks);
            }}
          />
        </section>
      )}
      <JobNotesDialog
        open={notesOpen}
        onOpenChange={(open) => { setNotesOpen(open); if (!open) setSelectedQuote(null); }}
        quote={selectedQuote}
        project={project}
      />
      
      <QuoteFullScreenView
        isOpen={showFullQuoteView}
        onClose={() => setShowFullQuoteView(false)}
        project={project}
        client={clientData}
        businessSettings={businessSettings}
        quotationItems={quotationData.items || []}
        subtotal={subtotal}
        taxRate={taxRate}
        taxAmount={taxAmount}
        total={total}
        markupPercentage={markupPercentage}
        templateBlocks={templateBlocks}
        selectedTemplate={selectedTemplate}
      />

      {/* Email Modal */}
      <EmailQuoteModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        project={project}
        client={clientData}
        onSend={handleSendEmail}
        isSending={isSendingEmail}
        quotePreview={
          selectedQuoteTemplate?.blocks ? (
            <PrintableQuote 
              blocks={selectedQuoteTemplate.blocks}
              projectData={projectData}
              isPrintMode={false}
            />
          ) : undefined
        }
      />

      {/* Hidden printable component for PDF generation */}
      <div className="hidden">
        {selectedQuoteTemplate?.blocks && (
          <PrintableQuote 
            ref={printRef}
            blocks={selectedQuoteTemplate.blocks}
            projectData={projectData}
            isPrintMode={true}
          />
        )}
      </div>
    </div>
  );
};
