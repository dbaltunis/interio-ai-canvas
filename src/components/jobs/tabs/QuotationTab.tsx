
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
import { Percent, FileText, Mail, Plus, Trash2, Copy, Edit } from "lucide-react";

interface QuotationTabProps {
  projectId: string;
}

export const QuotationTab = ({ projectId }: QuotationTabProps) => {
  const { toast } = useToast();
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

  // Group treatments by room
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
      {/* Header with Total and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">
            Total: {formatCurrency(total)} <span className="text-sm font-normal text-muted-foreground">(before tax)</span>
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add room</span>
          </Button>
          <ThreeDotMenu items={actionMenuItems} />
        </div>
      </div>

      {/* Room Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roomTreatments.map((room) => (
          <Card key={room.id} className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{room.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-lg font-semibold">
                    {formatCurrency(room.total)}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                Select product
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {room.surfaces.map((surface) => (
                <Card key={surface.id} className="border border-gray-100">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">{surface.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {formatCurrency(surface.treatments.reduce((sum, t) => sum + (t.total_price || 0), 0))}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Select product
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {surface.treatments.map((treatment) => (
                      <div key={treatment.id} className="flex items-start space-x-3 p-3 border rounded-lg bg-gray-50">
                        {/* Treatment Icon/Image Placeholder */}
                        <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                          <span className="text-xs text-gray-500">IMG</span>
                        </div>
                        
                        {/* Treatment Details */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{treatment.treatment_type}</h4>
                            <Button variant="ghost" size="sm" className="text-blue-600 text-xs p-0">
                              Full details ▼
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            {treatment.fabric_type && (
                              <>
                                <span>Mechanism width</span>
                                <span className="text-right">{treatment.width || 'N/A'} cm</span>
                              </>
                            )}
                            {treatment.height && (
                              <>
                                <span>Height</span>
                                <span className="text-right">{treatment.height} cm</span>
                              </>
                            )}
                            {treatment.fabric_type && (
                              <>
                                <span>Fabric article</span>
                                <span className="text-right">{treatment.fabric_type}</span>
                              </>
                            )}
                            {treatment.material_cost && (
                              <>
                                <span>Material price</span>
                                <span className="text-right">{formatCurrency(treatment.material_cost)}</span>
                              </>
                            )}
                            {treatment.labor_cost && (
                              <>
                                <span>Labor price</span>
                                <span className="text-right">{formatCurrency(treatment.labor_cost)}</span>
                              </>
                            )}
                            <span className="font-medium">Total price</span>
                            <span className="text-right font-medium">{formatCurrency(treatment.total_price || 0)}</span>
                          </div>
                        </div>
                        
                        {/* Action Icons */}
                        <div className="flex flex-col space-y-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
        
        {/* Empty state or Add Room card */}
        {roomTreatments.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plus className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center mb-4">
                No rooms with treatments yet
              </p>
              <Button variant="outline">
                Add your first room
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
