
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

interface QuotationTabProps {
  projectId: string;
}

export const QuotationTab = ({ projectId }: QuotationTabProps) => {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Group treatments by room and surface
  const roomTreatments = rooms?.map(room => {
    const roomSurfaces = surfaces?.filter(s => s.room_id === room.id) || [];
    const surfacesWithTreatments = roomSurfaces.map(surface => {
      const surfaceTreatments = treatments?.filter(t => t.window_id === surface.id) || [];
      return {
        ...surface,
        treatments: surfaceTreatments
      };
    }).filter(surface => surface.treatments.length > 0);
    
    const roomTotal = surfacesWithTreatments.reduce((sum, surface) => 
      sum + surface.treatments.reduce((tSum, t) => tSum + (t.total_price || 0), 0), 0
    );

    return {
      ...room,
      surfaces: surfacesWithTreatments,
      total: roomTotal
    };
  }).filter(room => room.surfaces.length > 0) || [];

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
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">Quotation</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2"
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showDetails ? 'Simple View' : 'Detailed View'}</span>
          </Button>
          <ThreeDotMenu items={actionMenuItems} />
        </div>
      </div>

      {/* Total Amount Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Total Project Cost</h2>
              <p className="text-muted-foreground">Including markup and tax</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{formatCurrency(total)}</div>
              {showDetails && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Subtotal: {formatCurrency(treatmentTotal)}</div>
                  <div>Markup (25%): {formatCurrency(subtotal - treatmentTotal)}</div>
                  <div>Tax (8%): {formatCurrency(taxAmount)}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote Content */}
      <div className="space-y-6">
        {roomTreatments.map((room) => (
          <Card key={room.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{room.name}</CardTitle>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {formatCurrency(room.total)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {room.surfaces.map((surface, surfaceIndex) => (
                <div key={surface.id} className={surfaceIndex > 0 ? "border-t" : ""}>
                  {/* Window Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{surface.name}</h3>
                      <div className="flex items-center space-x-4">
                        {showDetails && (
                          <span className="text-sm text-muted-foreground">
                            {surface.width}cm × {surface.height}cm
                          </span>
                        )}
                        <Badge variant="outline">
                          {formatCurrency(surface.treatments.reduce((sum, t) => sum + (t.total_price || 0), 0))}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Treatments */}
                  <div className="divide-y">
                    {surface.treatments.map((treatment) => (
                      <div key={treatment.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-lg mb-2">{treatment.treatment_type}</h4>
                            
                            {showDetails ? (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Dimensions:</span>
                                    <span>{surface.width}cm × {surface.height}cm</span>
                                  </div>
                                  {treatment.fabric_type && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Fabric:</span>
                                      <span>{treatment.fabric_type}</span>
                                    </div>
                                  )}
                                  {treatment.color && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Color:</span>
                                      <span>{treatment.color}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  {treatment.material_cost && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Material:</span>
                                      <span>{formatCurrency(treatment.material_cost)}</span>
                                    </div>
                                  )}
                                  {treatment.labor_cost && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Labor:</span>
                                      <span>{formatCurrency(treatment.labor_cost)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between font-medium">
                                    <span>Total:</span>
                                    <span>{formatCurrency(treatment.total_price || 0)}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                  {surface.width}cm × {surface.height}cm
                                  {treatment.fabric_type && ` • ${treatment.fabric_type}`}
                                  {treatment.color && ` • ${treatment.color}`}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-6 text-right">
                            <div className="text-xl font-semibold">
                              {formatCurrency(treatment.total_price || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        
        {/* Empty state */}
        {roomTreatments.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 text-center mb-4">
                No treatments found for this project
              </p>
              <p className="text-sm text-muted-foreground">
                Add rooms and treatments to generate a quote
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
