
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useCreateQuote } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { Percent, FileText, Mail, Eye, EyeOff } from "lucide-react";
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
  const createQuote = useCreateQuote();

  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');
  const [showPreview, setShowPreview] = useState(true);

  // Mock template data - in real app this would come from settings/templates
  const [templateBlocks] = useState([
    {
      id: 'header-1',
      type: 'header',
      content: {
        companyName: '{{company_name}}',
        address: '{{company_address}}',
        phone: '{{company_phone}}',
        email: '{{company_email}}',
        logoPosition: 'left' as const,
        quoteTitle: 'QUOTE',
        quoteNumber: 'QT-{{quote_number}}',
        date: '{{date}}',
        validUntil: '{{valid_until}}'
      },
      styles: {
        backgroundColor: '#f8fafc',
        textColor: '#1e293b',
        fontSize: 'base'
      }
    },
    {
      id: 'client-1',
      type: 'client',
      content: {
        title: 'Bill To:',
        showCompany: true,
        showAddress: true,
        showContact: true
      },
      styles: {
        backgroundColor: '#ffffff',
        textColor: '#374151',
        fontSize: 'sm'
      }
    },
    {
      id: 'products-1',
      type: 'products',
      content: {
        title: 'Quote Items',
        tableStyle: 'simple' as const,
        columns: ['product', 'description', 'qty', 'unit_price', 'total'],
        showTax: true,
        taxLabel: 'Tax',
        showSubtotal: true
      },
      styles: {
        backgroundColor: '#ffffff',
        textColor: '#374151',
        fontSize: 'sm'
      }
    },
    {
      id: 'footer-1',
      type: 'footer',
      content: {
        text: 'Thank you for your business!',
        showTerms: true,
        companyInfo: 'Contact us at {{company_phone}} or {{company_email}}'
      },
      styles: {
        backgroundColor: '#f8fafc',
        textColor: '#6b7280',
        fontSize: 'xs'
      }
    }
  ]);

  const project = projects?.find(p => p.id === projectId);

  // Calculate quote totals from treatments
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

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Quote Preview</h2>
          <p className="text-muted-foreground">
            Live preview of your customized quote template
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Badge variant={viewMode === 'simple' ? 'default' : 'outline'}>
              {viewMode === 'simple' ? 'Simple View' : 'Detailed View'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'simple' ? 'detailed' : 'simple')}
              className="flex items-center space-x-2"
            >
              {viewMode === 'simple' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>{viewMode === 'simple' ? 'Show Details' : 'Show Simple'}</span>
            </Button>
          </div>
          <ThreeDotMenu items={actionMenuItems} />
        </div>
      </div>

      {/* Quote Stats */}
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

      {/* Live Quote Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Quote Document</CardTitle>
          </CardHeader>
          <CardContent>
            <LivePreview
              blocks={templateBlocks.map(block => ({
                ...block,
                content: {
                  ...block.content,
                  // Update products block to use the correct view mode
                  ...(block.type === 'products' ? { tableStyle: viewMode } : {})
                }
              }))}
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
