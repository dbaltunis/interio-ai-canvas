
import { EnhancedRoomView } from "@/components/room-management/EnhancedRoomView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { Plus, Home, RectangleHorizontal, Square } from "lucide-react";

interface RoomsTabProps {
  projectId: string;
}

export const RoomsTab = ({ projectId }: RoomsTabProps) => {
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

  // Calculate room totals
  const getRoomTotal = (roomId: string) => {
    const roomTreatments = treatments?.filter(t => t.room_id === roomId) || [];
    return roomTreatments.reduce((sum, treatment) => sum + (treatment.total_price || 0), 0);
  };

  // Calculate surface totals
  const getSurfaceTotal = (surfaceId: string) => {
    const surfaceTreatments = treatments?.filter(t => t.window_id === surfaceId) || [];
    return surfaceTreatments.reduce((sum, treatment) => sum + (treatment.total_price || 0), 0);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  console.log('RoomsTab: Project ID:', projectId);
  console.log('RoomsTab: Rooms data:', rooms);
  console.log('RoomsTab: Surfaces data:', surfaces);
  console.log('RoomsTab: Treatments data:', treatments);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rooms & Treatments</h2>
          <p className="text-muted-foreground">
            Manage rooms and configure window treatments for this project
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">
            ${total.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">Total Project Cost</p>
        </div>
      </div>

      {/* Enhanced Room Management for creating and managing rooms */}
      <div>
        <EnhancedRoomView project={project} />
      </div>

      {/* Rooms Grid - Only show if there are rooms */}
      {rooms && rooms.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rooms.map((room) => {
            const roomSurfaces = surfaces?.filter(s => s.room_id === room.id) || [];
            const roomTotal = getRoomTotal(room.id);
            
            return (
              <Card key={room.id} className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      <span>{room.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-lg font-semibold">
                      ${roomTotal.toFixed(2)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Room Type */}
                  <Badge variant="outline" className="capitalize">
                    {room.room_type?.replace('_', ' ') || 'Living Room'}
                  </Badge>

                  {/* Surfaces */}
                  <div className="space-y-3">
                    {roomSurfaces.map((surface) => {
                      const surfaceTotal = getSurfaceTotal(surface.id);
                      const surfaceTreatments = treatments?.filter(t => t.window_id === surface.id) || [];
                      
                      return (
                        <div key={surface.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {surface.surface_type === 'window' ? (
                                <RectangleHorizontal className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4 text-primary" />
                              )}
                              <div>
                                <h4 className="font-medium">{surface.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {surface.width}" × {surface.height}"
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              ${surfaceTotal.toFixed(2)}
                            </Badge>
                          </div>

                          {/* Treatments */}
                          {surfaceTreatments.length > 0 && (
                            <div className="space-y-2">
                              {surfaceTreatments.map((treatment) => (
                                <div key={treatment.id} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                                  <div>
                                    <span className="font-medium capitalize">
                                      {treatment.treatment_type}
                                    </span>
                                    {treatment.product_name && (
                                      <span className="text-sm text-muted-foreground ml-2">
                                        - {treatment.product_name}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      ${(treatment.total_price || 0).toFixed(2)}
                                    </span>
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="outline">
                                        Edit
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Treatment Buttons */}
                          <div className="flex gap-2 mt-3 pt-3 border-t">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Plus className="h-3 w-3 mr-1" />
                              Curtains
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Plus className="h-3 w-3 mr-1" />
                              Blinds
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Plus className="h-3 w-3 mr-1" />
                              Shutters
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Surface Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <RectangleHorizontal className="h-4 w-4 mr-2" />
                        Add Window
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Square className="h-4 w-4 mr-2" />
                        Add Wall
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
