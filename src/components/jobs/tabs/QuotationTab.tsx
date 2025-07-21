
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Copy, Edit, ChevronDown, ChevronUp } from "lucide-react";

interface QuotationTabProps {
  projectId: string;
}

export const QuotationTab = ({ projectId }: QuotationTabProps) => {
  const { toast } = useToast();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);

  const project = projects?.find(p => p.id === projectId);

  // Calculate totals
  const treatmentTotal = treatments?.reduce((sum, treatment) => {
    return sum + (treatment.total_price || 0);
  }, 0) || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Total and Add Room Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Total: {formatCurrency(treatmentTotal)} (before tax)
          </h1>
        </div>
        <Button className="bg-slate-600 hover:bg-slate-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add room
        </Button>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roomTreatments.map((room) => (
          <Card key={room.id} className="bg-gray-50 border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {room.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(room.total)}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                Select product
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {room.surfaces.map((surface) => (
                <div key={surface.id} className="space-y-3">
                  {surface.treatments.map((treatment) => (
                    <div key={treatment.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      {/* Treatment Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {/* Treatment Icon/Image Placeholder */}
                          <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                            <div className="w-12 h-12 bg-gray-400 rounded"></div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {treatment.treatment_type || 'Treatment'}
                            </h4>
                            <p className="text-sm text-gray-600">{surface.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleExpanded(treatment.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {expandedItems[treatment.id] ? 'Hide details' : 'Full details'}
                            {expandedItems[treatment.id] ? 
                              <ChevronUp className="h-4 w-4 ml-1" /> : 
                              <ChevronDown className="h-4 w-4 ml-1" />
                            }
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Treatment Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mechanism width</span>
                          <span className="font-medium">{surface.width} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Curtain drop</span>
                          <span className="font-medium">{surface.height} cm</span>
                        </div>
                        
                        {expandedItems[treatment.id] && (
                          <>
                            {treatment.fabric_type && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Heading name</span>
                                <span className="font-medium">{treatment.fabric_type}</span>
                              </div>
                            )}
                            {treatment.color && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Fabric article</span>
                                <span className="font-medium">{treatment.color}</span>
                              </div>
                            )}
                            {treatment.material_cost && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Fabric price</span>
                                <span className="font-medium">{formatCurrency(treatment.material_cost)}</span>
                              </div>
                            )}
                            {treatment.labor_cost && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Manufacturing price</span>
                                <span className="font-medium">{formatCurrency(treatment.labor_cost)}</span>
                              </div>
                            )}
                          </>
                        )}
                        
                        <div className="flex justify-between font-semibold text-base pt-2 border-t">
                          <span className="text-gray-900">Total price</span>
                          <span className="text-gray-900">{formatCurrency(treatment.total_price || 0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        
        {/* Empty state */}
        {roomTreatments.length === 0 && (
          <div className="col-span-full">
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
          </div>
        )}
      </div>
    </div>
  );
};
