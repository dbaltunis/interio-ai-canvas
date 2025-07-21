
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useCreateQuote } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { FileText, Calculator, Send, Download, Eye, EyeOff } from "lucide-react";
import { QuotePreview } from "../quotation/QuotePreview";
import { QuotationSummary } from "../quotation/QuotationSummary";
import { TreatmentLineItems } from "../quotation/TreatmentLineItems";
import { TemplateQuotePreview } from "../quotation/TemplateQuotePreview";

interface QuotationTabProps {
  projectId: string;
}

export const QuotationTab = ({ projectId }: QuotationTabProps) => {
  const { toast } = useToast();
  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);
  const createQuote = useCreateQuote();

  const [markupPercentage, setMarkupPercentage] = useState(25);
  const [taxRate, setTaxRate] = useState(0.08);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("default");
  const [useTemplate, setUseTemplate] = useState(false);

  // Mock templates - in real app this would come from a templates hook
  const templates = [
    { id: "default", name: "Default Template" },
    { id: "standard", name: "Standard Quote" },
    { id: "premium", name: "Premium Quote" },
    { id: "detailed", name: "Detailed Breakdown" }
  ];

  const project = projects?.find(p => p.id === projectId);

  // Calculate quote totals from treatments
  const treatmentTotal = treatments?.reduce((sum, treatment) => {
    return sum + (treatment.total_price || 0);
  }, 0) || 0;

  const subtotal = treatmentTotal * (1 + markupPercentage / 100);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleGenerateQuote = async () => {
    if (!project || !treatments || treatments.length === 0) {
      toast({
        title: "Cannot Generate Quote",
        description: "No treatments found in this project. Please add treatments first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createQuote.mutateAsync({
        project_id: projectId,
        client_id: project.client_id,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: total,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: `Quote generated from project: ${project.name} using ${useTemplate ? selectedTemplate : 'default'} template`
      });

      toast({
        title: "Quote Generated",
        description: "Quote has been created successfully and saved to your quotes.",
      });
    } catch (error) {
      console.error("Failed to generate quote:", error);
      toast({
        title: "Error",
        description: "Failed to generate quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Auto-Generated Quotation</h2>
          <p className="text-muted-foreground">
            Generate professional quotes from your configured treatments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Template:</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => setUseTemplate(!useTemplate)}
            className={`flex items-center space-x-2 ${useTemplate ? 'bg-blue-50 border-blue-200' : ''}`}
          >
            <FileText className="h-4 w-4" />
            <span>{useTemplate ? 'Using Template' : 'Use Template'}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </Button>
          <Button
            onClick={handleGenerateQuote}
            disabled={createQuote.isPending || !treatments || treatments.length === 0}
            className="flex items-center space-x-2 bg-brand-primary hover:bg-brand-accent text-white"
          >
            <Send className="h-4 w-4" />
            <span>Generate Quote</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-brand-primary">{rooms?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-brand-accent">{treatments?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Treatments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">${treatmentTotal.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Base Cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">${total.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Quote Total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Treatment Line Items */}
        <div className="lg:col-span-2">
          <TreatmentLineItems
            treatments={treatments || []}
            rooms={rooms || []}
            surfaces={surfaces || []}
            markupPercentage={markupPercentage}
            onMarkupChange={setMarkupPercentage}
          />
        </div>

        {/* Quote Summary */}
        <div className="space-y-4">
          <QuotationSummary
            subtotal={subtotal}
            taxRate={taxRate}
            taxAmount={taxAmount}
            total={total}
            onTaxRateChange={setTaxRate}
            markupPercentage={markupPercentage}
            treatmentTotal={treatmentTotal}
          />
        </div>
      </div>

      {/* Quote Preview */}
      {showPreview && (
        <>
          {useTemplate ? (
            <TemplateQuotePreview
              project={project}
              treatments={treatments || []}
              rooms={rooms || []}
              surfaces={surfaces || []}
              subtotal={subtotal}
              taxRate={taxRate}
              taxAmount={taxAmount}
              total={total}
              markupPercentage={markupPercentage}
              templateId={selectedTemplate}
            />
          ) : (
            <QuotePreview
              project={project}
              treatments={treatments || []}
              rooms={rooms || []}
              surfaces={surfaces || []}
              subtotal={subtotal}
              taxRate={taxRate}
              taxAmount={taxAmount}
              total={total}
              markupPercentage={markupPercentage}
            />
          )}
        </>
      )}
    </div>
  );
};
