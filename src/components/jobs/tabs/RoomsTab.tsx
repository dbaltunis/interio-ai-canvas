import { EnhancedRoomView } from "@/components/room-management/EnhancedRoomView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { Plus, Edit, Copy, Trash2 } from "lucide-react";

interface RoomsTabProps {
  projectId: string;
}

export const RoomsTab = ({ projectId }: RoomsTabProps) => {
  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);
  
  const project = projects?.find(p => p.id === projectId);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Add Room Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rooms & Treatments</h2>
          <p className="text-muted-foreground">
            Manage rooms and configure window treatments for this project
          </p>
        </div>
        <Button className="bg-slate-600 hover:bg-slate-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add room
        </Button>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rooms?.map((room) => {
          const roomSurfaces = surfaces?.filter(s => s.room_id === room.id) || [];
          const roomTotal = getRoomTotal(room.id);
          
          return (
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
                  {formatCurrency(roomTotal)}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Add window treatment
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                {roomSurfaces.map((surface) => {
                  const windowTotal = getWindowTotal(surface.id);
                  const windowTreatments = treatments?.filter(t => t.window_id === surface.id) || [];
                  
                  return (
                    <div key={surface.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{surface.name}</h4>
                        <Badge variant="outline">
                          {formatCurrency(windowTotal)}
                        </Badge>
                      </div>
                      
                      {windowTreatments.map((treatment) => (
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

                          {/* Treatment Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Width</span>
                              <span className="font-medium">{surface.width} cm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Height</span>
                              <span className="font-medium">{surface.height} cm</span>
                            </div>
                            
                            {treatment.fabric_type && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Fabric Type</span>
                                <span className="font-medium">{treatment.fabric_type}</span>
                              </div>
                            )}
                            {treatment.color && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Color</span>
                                <span className="font-medium">{treatment.color}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between font-semibold text-base pt-2 border-t">
                              <span className="text-gray-900">Total price</span>
                              <span className="text-gray-900">{formatCurrency(treatment.total_price || 0)}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {windowTreatments.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">No treatments added for this window</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Add treatment
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {roomSurfaces.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No windows added to this room</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add window
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Empty state */}
        {(!rooms || rooms.length === 0) && (
          <div className="col-span-full">
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 text-center mb-4">
                  No rooms found for this project
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add rooms to start creating window treatments
                </p>
                <Button className="bg-slate-600 hover:bg-slate-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first room
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Enhanced Room Management - Keep this for advanced functionality */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Advanced Room Management</h3>
        <EnhancedRoomView project={project} />
      </div>
    </div>
  );
};
