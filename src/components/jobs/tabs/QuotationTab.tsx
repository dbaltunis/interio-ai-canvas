
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
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

  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');

  // Mock template data - this should come from user's saved quote template
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
        tableStyle: viewMode as 'simple' | 'detailed',
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

  // Calculate totals
  const treatmentTotal = treatments?.reduce((sum, treatment) => {
    return sum + (treatment.total_price || 0);
  }, 0) || 0;

  const markupPercentage = 25;
  const taxRate = 0.08;
  const subtotal = treatmentTotal * (1 + markupPercentage / 100);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Calculate room totals
  const getRoomTotal = (roomId: string) => {
    const roomTreatments = treatments?.filter(t => t.room_id === roomId) || [];
    return roomTreatments.reduce((sum, treatment) => sum + (treatment.total_price || 0), 0);
  };

  // Calculate window totals
  const getWindowTotal = (windowId: string) => {
    const windowTreatments = treatments?.filter(t => t.window_id === windowId) || [];
    return windowTreatments.reduce((sum, treatment) => sum + (treatment.total_price || 0), 0);
  };

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
          <h2 className="text-xl font-semibold">Project Quote</h2>
          <p className="text-muted-foreground">
            Review and customize your project quotation
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

      {/* Project Total */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-primary mb-2">
              ${total.toFixed(2)}
            </div>
            <p className="text-lg text-muted-foreground">Total Project Cost</p>
            <div className="flex justify-center space-x-4 mt-4 text-sm">
              <span>Base: ${treatmentTotal.toFixed(2)}</span>
              <span>Markup: ${(subtotal - treatmentTotal).toFixed(2)}</span>
              <span>Tax: ${taxAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms and Windows Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Rooms & Windows</h3>
        {rooms?.map((room) => {
          const roomSurfaces = surfaces?.filter(s => s.room_id === room.id) || [];
          const roomTotal = getRoomTotal(room.id);
          
          return (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{room.name}</span>
                  <Badge variant="secondary" className="text-lg font-semibold">
                    ${roomTotal.toFixed(2)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roomSurfaces.map((surface) => {
                    const windowTotal = getWindowTotal(surface.id);
                    const windowTreatments = treatments?.filter(t => t.window_id === surface.id) || [];
                    
                    return (
                      <div key={surface.id} className="border-l-4 border-brand-primary/20 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{surface.name}</h4>
                          <Badge variant="outline">
                            ${windowTotal.toFixed(2)}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {windowTreatments.map((treatment) => (
                            <div key={treatment.id} className="flex justify-between">
                              <span>
                                {treatment.treatment_type} 
                                {treatment.product_name && ` - ${treatment.product_name}`}
                              </span>
                              <span>${(treatment.total_price || 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live Quote Preview */}
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
    </div>
  );
};
