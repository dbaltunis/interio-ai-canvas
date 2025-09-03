
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Mail, Printer, DollarSign, MapPin } from "lucide-react";
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
  const { buildQuotationItems } = useQuotationSync({
    projectId: project?.id || "",
    clientId: project?.client_id || "",
    autoCreateQuote: false,
    markupPercentage: 25,
    taxRate: 0.08,
  });

  // Build quotation items from sync data
  const quotationData = buildQuotationItems();
  const { toast } = useToast();

  const client = clients?.find(c => c.id === project.client_id);
  
  // Use built quotation items
  const displayQuoteItems = quotationData.items || [];
  
  const markupPercentage = 25; // Default 25% markup to match QuotationTab
  const taxRate = 0.08; // 8% tax rate to match QuotationTab
  
  // Use the same calculation approach as QuotationTab
  const baseSubtotal = quotationData.baseSubtotal || 0;
  const subtotal = quotationData.subtotal || 0;
  const tax = quotationData.taxAmount || 0;
  const total = quotationData.total || 0;


  const handleEmailQuote = () => {
    toast({ title: "Email sent", description: "Quote has been emailed to client" });
  };

  return (
    <div className="space-y-6">
      {/* Company & Project Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Project Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project ? (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">{project.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Status: <span className="capitalize">{project.status}</span>
                </div>
                {project.created_at && (
                  <div className="text-sm text-gray-600">
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 italic">No project data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            {businessSettings ? (
              <div className="space-y-2">
                {businessSettings.company_name && (
                  <div>
                    <span className="font-medium">{businessSettings.company_name}</span>
                  </div>
                )}
                {businessSettings.business_email && (
                  <div className="text-sm text-gray-600">{businessSettings.business_email}</div>
                )}
                {businessSettings.business_phone && (
                  <div className="text-sm text-gray-600">{businessSettings.business_phone}</div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                No company information configured
                <p className="text-xs mt-1">Configure in Settings → Business</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleEmailQuote} disabled={!client}>
              <Mail className="h-4 w-4 mr-2" />
              Email Quote
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </Card>

      {/* Quote Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Subtotal (excl. GST)</p>
              <p className="text-lg font-semibold">{formatCurrency(subtotal)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">GST (10%)</p>
              <p className="text-lg font-semibold">{formatCurrency(tax)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total (incl. GST)</p>
              <p className="text-xl font-bold">{formatCurrency(total)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Quotation Table */}
      <DetailedQuotationTable 
        quotationData={quotationData}
        groupByRoom={true}
        showDetailedView={true}
        currency="GBP"
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
    </div>
  );
};
