
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useDocumentTemplates } from "@/hooks/useDocumentTemplates";
import { useQuotes } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { Percent, FileText, Mail, Eye, EyeOff, Settings, Plus, Palette, Download, Edit } from "lucide-react";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";

interface QuotationTabProps {
  projectId: string;
}

export const QuotationTab = ({ projectId }: QuotationTabProps) => {
  const { toast } = useToast();
  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);
  const { data: allTemplates, isLoading: templatesLoading } = useDocumentTemplates();
  const { data: quotes = [], isLoading: quotesLoading } = useQuotes();

  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('Quote');

  const project = projects?.find(p => p.id === projectId);
  
  // Filter quotes for this specific project
  const projectQuotes = quotes.filter(quote => quote.project_id === projectId);

  // Filter templates by document type and status
  const filteredTemplates = allTemplates?.filter(template => 
    template.type === selectedDocumentType && template.status === "Active"
  ) || [];

  // Set default template when templates load
  useEffect(() => {
    if (filteredTemplates && filteredTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(filteredTemplates[0].id.toString());
    }
  }, [filteredTemplates, selectedTemplateId]);

  // Get selected template
  const selectedTemplate = filteredTemplates?.find(t => t.id.toString() === selectedTemplateId);

  // Calculate totals
  const treatmentTotal = treatments?.reduce((sum, treatment) => {
    return sum + (treatment.total_price || 0);
  }, 0) || 0;

  const markupPercentage = 25;
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

  const handleCreateDocument = () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a document template first",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: `Creating ${selectedDocumentType}`,
      description: `Creating new ${selectedDocumentType.toLowerCase()} using ${selectedTemplate.name} template`,
    });
  };

  const handleDownloadDocument = () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template first",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Downloading Document",
      description: `Downloading ${selectedDocumentType.toLowerCase()} as PDF`,
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
      label: "Email Document",
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
        <div className="text-muted-foreground">Loading templates and documents...</div>
      </div>
    );
  }

  // Get template blocks and update view mode for products block
  const templateBlocks = selectedTemplate && selectedTemplate.blocks ? selectedTemplate.blocks.map(block => ({
    ...block,
    content: {
      ...block.content,
      // Update products block to use the correct view mode
      ...(block.type === 'products' ? { tableStyle: viewMode } : {})
    }
  })) : [];

  return (
    <div className="space-y-6">
      {/* Document Type & Template Selection */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileText className="h-5 w-5" />
            Document Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Document Type Selector */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Document Type
                </label>
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quote">Quote</SelectItem>
                    <SelectItem value="Invoice">Invoice</SelectItem>
                    <SelectItem value="Work Order">Work Order</SelectItem>
                    <SelectItem value="Instructions">Instructions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
              </div>
            </div>
          </div>

          {/* Template Selection */}
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplateId === template.id.toString() 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedTemplateId(template.id.toString())}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.type}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={selectedTemplateId === template.id.toString() ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {selectedTemplateId === template.id.toString() ? 'Selected' : template.status}
                        </Badge>
                        {selectedTemplateId === template.id.toString() && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-3">
                      Modified: {template.lastModified}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" title="Preview Template">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Edit Template"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open('/settings?tab=documents', '_blank');
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {selectedDocumentType} Templates Found
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Create {selectedDocumentType.toLowerCase()} templates in Settings to get started
              </p>
              <Button
                onClick={() => window.open('/settings?tab=documents', '_blank')}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create {selectedDocumentType} Template</span>
              </Button>
            </div>
          )}

          {/* Action Controls */}
          {selectedTemplate && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-blue-700">
                  Using: {selectedTemplate.name}
                </div>
                
                {/* View Toggle for detailed templates */}
                {selectedDocumentType === 'Quote' && (
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
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Generate Document Button */}
                <Button
                  onClick={handleCreateDocument}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Generate {selectedDocumentType}</span>
                </Button>

                {/* Download PDF */}
                <Button
                  variant="outline"
                  onClick={handleDownloadDocument}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </Button>

                {/* Template Management */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/settings?tab=documents', '_blank')}
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Manage</span>
                </Button>

                {/* Actions Menu */}
                <ThreeDotMenu items={actionMenuItems} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Documents Display */}
      {projectQuotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Documents for this Project</span>
              <Badge variant="secondary">{projectQuotes.length} document{projectQuotes.length > 1 ? 's' : ''}</Badge>
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
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
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

      {/* Document Preview */}
      {selectedTemplate && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Live {selectedDocumentType} Preview</CardTitle>
              <div className="text-sm text-muted-foreground">
                Template: <strong>{selectedTemplate.name}</strong>
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
