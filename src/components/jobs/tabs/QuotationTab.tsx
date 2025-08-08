
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useQuotes, useCreateQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { Percent, FileText, Mail, Eye, EyeOff, Settings, Plus } from "lucide-react";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";
import { QuoteViewer } from "../QuoteViewer";
import { TreatmentLineItems } from "@/components/jobs/quotation/TreatmentLineItems";

interface QuotationTabProps {
  projectId: string;
}

export const QuotationTab = ({ projectId }: QuotationTabProps) => {
  const { toast } = useToast();
  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);
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

  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const project = projects?.find(p => p.id === projectId);
  
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

  // Calculate totals
  const treatmentTotal = treatments?.reduce((sum, treatment) => {
    return sum + (treatment.total_price || 0);
  }, 0) || 0;

  const [markupPercentage, setMarkupPercentage] = useState<number>(25);
  const taxRate = 0.08;
  const subtotal = treatmentTotal * (1 + markupPercentage / 100);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

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

  // Get template blocks and update view mode for products block
  const templateBlocks = selectedTemplate && selectedTemplate.blocks && Array.isArray(selectedTemplate.blocks) 
    ? selectedTemplate.blocks.map((block: any) => ({
        ...block,
        content: {
          ...block.content,
          // Update products block to use the correct view mode and ensure columns exist for simple view
          ...(block.type === 'products'
            ? { tableStyle: viewMode, columns: block.content?.columns ?? ['product','description','qty','unit_price','total'] }
            : {})
        }
      })) 
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
          {/* Template Selector - Compact */}
          <Select
            value={selectedTemplateId}
            onValueChange={setSelectedTemplateId}
          >
            <SelectTrigger className="w-48">
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

          {/* Template Settings Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/settings?tab=documents', '_blank')}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Templates</span>
          </Button>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <Badge variant={viewMode === 'simple' ? 'default' : 'outline'} className="text-xs">
              {viewMode === 'simple' ? 'Simple' : 'Detailed'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'simple' ? 'detailed' : 'simple')}
              className="flex items-center space-x-1"
            >
              {viewMode === 'simple' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>

          {/* Actions Menu */}
          <ThreeDotMenu items={actionMenuItems} />
        </div>
      </div>

      {/* Active Quotes Display */}
      {projectQuotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Quotes for this Project</span>
              <Badge variant="secondary">{projectQuotes.length} quote{projectQuotes.length > 1 ? 's' : ''}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectQuotes.map((quote) => (
                <Card key={quote.id} className="border-2 hover:border-brand-primary/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{quote.quote_number}</h3>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${quote.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                          ${quote.status === 'sent' ? 'bg-blue-100 text-blue-800' : ''}
                          ${quote.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                          ${quote.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        `}
                      >
                        {quote.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Total: ${quote.total_amount?.toFixed(2) || '0.00'}</p>
                      <p>Created: {new Date(quote.created_at).toLocaleDateString()}</p>
                      {quote.valid_until && (
                        <p>Valid until: {new Date(quote.valid_until).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <QuoteViewer quote={quote} isEditable={true}>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </QuoteViewer>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Mail className="h-3 w-3 mr-1" />
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Treatments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Selected Treatments</CardTitle>
        </CardHeader>
        <CardContent>
          <TreatmentLineItems
            treatments={treatments || []}
            rooms={rooms || []}
            surfaces={surfaces || []}
            markupPercentage={markupPercentage}
            onMarkupChange={setMarkupPercentage}
          />
        </CardContent>
      </Card>

      {/* Quote Document Preview */}
      {selectedTemplate && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Quote Document Preview</CardTitle>
              <div className="text-sm text-muted-foreground">
                Using: <strong>{selectedTemplate.name}</strong>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <LivePreview
              blocks={templateBlocks}
              projectData={{
                project,
                treatments: treatments || [],
                rooms: rooms || [],
                surfaces: surfaces || [],
                subtotal,
                taxRate,
                taxAmount,
                total,
                markupPercentage
              }}
              isEditable={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
