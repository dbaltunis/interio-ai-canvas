
import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Mail, Printer, DollarSign, MapPin, Edit3, Download, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { formatCurrency } from "@/utils/currency";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { buildClientBreakdown } from "@/utils/quotes/buildClientBreakdown";
import QuoteItemBreakdown from "@/components/quotes/QuoteItemBreakdown";
import { useQuotationSync } from "@/hooks/useQuotationSync";
import { DetailedQuotationTable } from "@/components/jobs/quotation/DetailedQuotationTable";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useHasPermission } from "@/hooks/usePermissions";
import { EnhancedVisualEditor } from "@/components/settings/templates/visual-editor/EnhancedVisualEditor";
import { useReactToPrint } from "react-to-print";
import { PrintableQuote } from "@/components/jobs/quotation/PrintableQuote";
import { EmailQuoteModal } from "@/components/jobs/quotation/EmailQuoteModal";
import { useQuoteTemplates } from "@/hooks/useQuoteTemplates";
interface ProjectQuoteTabProps {
  project: any;
  shouldHighlightNewQuote?: boolean;
}

export const ProjectQuoteTab = ({ project, shouldHighlightNewQuote = false }: ProjectQuoteTabProps) => {
  const { data: clients } = useClients();
  const { data: treatments = [] } = useTreatments(project?.id);
  const { data: rooms = [] } = useRooms(project?.id);
  const { data: surfaces = [] } = useSurfaces(project?.id);
  const { data: projectSummaries } = useProjectWindowSummaries(project?.id);
  const { data: businessSettings } = useBusinessSettings();
  const { data: templates } = useQuoteTemplates();
  const isAdmin = useHasPermission('manage_settings');
  const { buildQuotationItems } = useQuotationSync({
    projectId: project?.id || "",
    clientId: project?.client_id || "",
    autoCreateQuote: false
  });

  // ALWAYS recalculate quotation data - never use stale data
  const quotationData = useMemo(() => {
    const data = buildQuotationItems();
    console.log('[PROJECT QUOTE TAB] ===== LIVE QUOTE RECALCULATED =====');
    console.log('[PROJECT QUOTE TAB] Window Summaries (SOURCE OF TRUTH):', {
      windowCount: projectSummaries?.windows?.length || 0,
      projectTotal: projectSummaries?.projectTotal,
      windows: projectSummaries?.windows?.map(w => ({
        id: w.window_id,
        name: w.surface_name,
        cost: w.summary?.total_cost
      }))
    });
    console.log('[PROJECT QUOTE TAB] Quote Calculation Result:', {
      baseSubtotal: data.baseSubtotal,
      subtotal: data.subtotal,
      total: data.total,
      itemCount: data.items.length,
      items: data.items.map((item: any) => ({
        name: item.name,
        total: item.total,
        isHeader: item.isHeader
      }))
    });
    console.log('[PROJECT QUOTE TAB] ✅ Prices match Rooms & Treatments (no additional markup)');
    return data;
  }, [buildQuotationItems, projectSummaries?.windows, projectSummaries?.projectTotal, treatments.length]);
  
  const { toast } = useToast();
  
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const canEditTemplates = businessSettings?.allow_in_app_template_editing && isAdmin;

  const client = clients?.find(c => c.id === project.client_id);
  
  // Use built quotation items (prices already include markup)
  const displayQuoteItems = quotationData.items || [];
  
  // Get values directly from quotation data (no additional markup)
  const baseSubtotal = quotationData.baseSubtotal || 0;
  const subtotal = quotationData.subtotal || 0;
  const tax = quotationData.taxAmount || 0;
  const total = quotationData.total || 0;
  
  // Get tax info from business settings
  const taxRate = (businessSettings?.tax_rate || 0) / 100;
  const taxType = businessSettings?.tax_type || 'none';

  const templateId = templates?.[0]?.id || '';
  const selectedTemplate = templates?.find(t => t.id === templateId);

  const projectData = {
    project,
    client,
    businessSettings,
    treatments,
    workshopItems: [],
    rooms,
    surfaces,
    subtotal,
    taxRate: businessSettings?.tax_rate || 0,
    taxAmount: tax,
    total,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `quote-${project?.quote_number || 'QT-' + Math.floor(Math.random() * 10000)}`,
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

  const handleSaveTemplate = async (templateData: any) => {
    toast({ 
      title: "Template Saved", 
      description: "Your quote template has been saved successfully"
    });
    setIsTemplateEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Quote Status */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Quote Ready</h3>
              <p className="text-sm text-blue-700">
                {client ? `Ready to send to ${client.name}` : "Assign a client to send quote"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEditTemplates && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => setIsTemplateEditorOpen(true)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            )}
            <Button 
              size="sm" 
              variant="default"
              onClick={handlePrint}
              disabled={!client}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsEmailModalOpen(true)}
              disabled={!client}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <MoreVertical className="h-4 w-4 mr-2" />
                  More
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
      </Card>

      {/* Quote Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">
                Subtotal (excl. {taxType === 'vat' ? 'VAT' : taxType === 'gst' ? 'GST' : 'Tax'})
              </p>
              <p className="text-lg font-semibold">{formatCurrency(subtotal)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">
                {taxType === 'vat' ? 'VAT' : taxType === 'gst' ? 'GST' : 'Tax'} 
                {taxRate > 0 ? ` (${(taxRate * 100).toFixed(1)}%)` : ''}
              </p>
              <p className="text-lg font-semibold">{formatCurrency(tax)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">
                Total (incl. {taxType === 'vat' ? 'VAT' : taxType === 'gst' ? 'GST' : 'Tax'})
              </p>
              <p className="text-xl font-bold">{formatCurrency(total)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Quotation Table - Force update with key */}
      <DetailedQuotationTable 
        key={`quote-${projectSummaries?.projectTotal}-${treatments.length}`}
        quotationData={quotationData}
        groupByRoom={true}
        showDetailedView={true}
        currency={businessSettings?.measurement_units ? JSON.parse(businessSettings.measurement_units).currency : 'GBP'}
        businessSettings={businessSettings}
      />

      {/* Client Information */}
      {client && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-3">Bill To:</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{client.name}</p>
              {client.email && <p>{client.email}</p>}
              {client.phone && <p>{client.phone}</p>}
              {client.address && <p>{client.address}</p>}
            </div>
          </div>
        </Card>
      )}

      {/* Template Editor Modal */}
      <EnhancedVisualEditor
        isOpen={isTemplateEditorOpen}
        onClose={() => setIsTemplateEditorOpen(false)}
        onSave={handleSaveTemplate}
        projectId={project?.id}
      />

      {/* Email Modal */}
      <EmailQuoteModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        project={project}
        client={client}
        onSend={(emailData) => {
          console.log("Email sent:", emailData);
          toast({
            title: "Email Sent",
            description: `Quote successfully sent to ${client?.name}`
          });
          setIsEmailModalOpen(false);
        }}
      />

      {/* Hidden printable component */}
      <div className="hidden">
        {selectedTemplate?.blocks && (
          <PrintableQuote 
            ref={printRef}
            blocks={selectedTemplate.blocks}
            projectData={projectData}
            isPrintMode={true}
          />
        )}
      </div>
    </div>
  );
};
