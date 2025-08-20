
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useQuotes, useCreateQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { Percent, FileText, Mail, Eye, EyeOff, Settings, Plus, StickyNote, List } from "lucide-react";
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
  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);
  const { data: projectSummaries } = useProjectWindowSummaries(projectId);
  // Fetch quote templates from database
  const { data: activeTemplates, isLoading: templatesLoading, refetch: refetchTemplates } = useQuery({
    queryKey: ["quote-templates"],
    queryFn: async () => {
      console.log('Fetching quote templates...');
      const { data, error } = await supabase
        .from("quote_templates")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false });
      
      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }
      
      console.log('Fetched templates:', data);
      console.log('Templates count:', data?.length || 0);
      data?.forEach(template => {
        console.log(`Template: ${template.name} (${template.template_style}) - Active: ${template.active}`);
      });
      return data || [];
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
  });
  const { data: quotes = [], isLoading: quotesLoading } = useQuotes(projectId);
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();

  const [showItemsEditor, setShowItemsEditor] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const project = projects?.find(p => p.id === projectId);
  const [notesOpen, setNotesOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [showFullQuoteView, setShowFullQuoteView] = useState(false);
  const [showQuotationItems, setShowQuotationItems] = useState(false);

  const { buildQuotationItems } = useQuotationSync({
    projectId: projectId,
    clientId: project?.client_id || "",
    autoCreateQuote: false,
    markupPercentage: 25,
    taxRate: 0.08,
  });

  // Build quotation items from sync data
  const quotationData = buildQuotationItems();

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
  
  // Use the same base data for all calculations
  const baseSubtotal = quotationData.baseSubtotal || 0;
  const subtotal = quotationData.subtotal || 0;
  const taxAmount = quotationData.taxAmount || 0;
  const total = quotationData.total || 0;
  const taxRate = 0.08;
  const markupPercentage = 25;
  const [, setMarkupPercentage] = useState<number>(25);

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

  const handleEmailQuote = () => {
    toast({
      title: "Email Quote",
      description: "Quote email functionality would be implemented here",
    });
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

  const actionMenuItems = [
    {
      label: "Add Discount",
      icon: <Percent className="h-4 w-4" />,
      onClick: handleAddDiscount,
      variant: 'default' as const
    },
    {
      label: "Add T&C / Payment Terms",
      icon: <FileText className="h-4 w-4" />,
      onClick: handleAddTerms,
      variant: 'default' as const
    },
    {
      label: "Email Quote",
      icon: <Mail className="h-4 w-4" />,
      onClick: handleEmailQuote,
      variant: 'info' as const
    }
  ];

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (templatesLoading || quotesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading templates and quotes...</div>
      </div>
    );
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
const templateBlocks = (selectedTemplate?.blocks && Array.isArray(selectedTemplate.blocks)) 
  ? removeDuplicateProductsBlocks(selectedTemplate.blocks)
  : [];

  return (
    <div className="space-y-6">
      {/* Modern Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Project Quotation</h2>
          <p className="text-muted-foreground text-sm">
            Manage quotes and generate professional documents
          </p>
        </div>
        
        {/* Compact Action Bar */}
        <div className="flex items-center space-x-2">

          {/* Create New Quote Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateNewQuote}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Quote</span>
          </Button>

          {/* View Items Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuotationItems(true)}
            className="flex items-center space-x-2"
          >
            <List className="h-4 w-4" />
            <span>View Items</span>
          </Button>

          {/* View Quote Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullQuoteView(true)}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>View Quote</span>
          </Button>
          {/* Actions Menu */}
          <ThreeDotMenu items={actionMenuItems} />
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


      {/* Quotation Items Modal */}
      <QuotationItemsModal
        isOpen={showQuotationItems}
        onClose={() => setShowQuotationItems(false)}
        quotationData={quotationData}
        currency="GBP"
        treatments={sourceTreatments}
        rooms={rooms || []}
        surfaces={surfaces || []}
        markupPercentage={markupPercentage}
      />

      {/* Quote Document Preview */}
      {selectedTemplate && (
        <section className="mt-6">
          <LivePreview
            blocks={templateBlocks}
            projectData={{
              project,
              treatments: sourceTreatments,
              rooms: rooms || [],
              surfaces: surfaces || [],
              subtotal: quotationData.subtotal || 0,
              taxRate: 0.08,
              taxAmount: quotationData.taxAmount || 0,
              total: quotationData.total || 0,
              markupPercentage: 25,
              windowSummaries: projectSummaries?.windows || []
            }}
            isEditable={true}
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
        treatments={sourceTreatments}
        rooms={rooms || []}
        surfaces={surfaces || []}
        subtotal={subtotal}
        taxRate={taxRate}
        taxAmount={taxAmount}
        total={total}
        markupPercentage={markupPercentage}
        templateId={selectedTemplateId || 'standard'}
      />
    </div>
  );
};
