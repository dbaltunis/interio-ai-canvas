
import { EnhancedRoomView } from "@/components/room-management/EnhancedRoomView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";

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

  // Calculate window totals
  const getWindowTotal = (windowId: string) => {
    const windowTreatments = treatments?.filter(t => t.window_id === windowId) || [];
    return windowTreatments.reduce((sum, treatment) => sum + (treatment.total_price || 0), 0);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Rooms & Treatments</h2>
          <p className="text-muted-foreground">
            Manage rooms and configure window treatments for this project
          </p>
        </div>
      </div>

      {/* Project Total Cost Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-primary mb-2">
              ${total.toFixed(2)}
            </div>
            <p className="text-lg text-muted-foreground">Total Project Cost</p>
            <div className="flex justify-center space-x-4 mt-4 text-sm">
              <span>Base: ${treatmentTotal.toFixed(2)}</span>
              <span>Markup ({markupPercentage}%): ${(subtotal - treatmentTotal).toFixed(2)}</span>
              <span>Tax ({(taxRate * 100).toFixed(1)}%): ${taxAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room and Window Pricing Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pricing Breakdown by Room</h3>
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

      {/* Enhanced Room Management */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Room Management</h3>
        <EnhancedRoomView project={project} />
      </div>
    </div>
  );
};
