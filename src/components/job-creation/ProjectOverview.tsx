
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Square, Settings2, DollarSign } from "lucide-react";

interface ProjectOverviewProps {
  project: any;
  rooms: any[];
  surfaces: any[];
  treatments: any[];
}

export const ProjectOverview = ({ project, rooms, surfaces, treatments }: ProjectOverviewProps) => {
  console.log("ProjectOverview render data:", { project, rooms, surfaces, treatments });

  // Safely calculate totals with error handling
  const calculateTreatmentTotal = (treatment: any) => {
    try {
      if (treatment.total_price && typeof treatment.total_price === 'number') {
        return treatment.total_price;
      }
      return 0;
    } catch (error) {
      console.error("Error calculating treatment total:", error, treatment);
      return 0;
    }
  };

  const projectTotal = treatments?.reduce((sum, treatment) => {
    return sum + calculateTreatmentTotal(treatment);
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total rooms in project
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Surfaces</CardTitle>
            <Square className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surfaces?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Windows and walls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treatments</CardTitle>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treatments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Configured treatments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${projectTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Project total
            </p>
          </CardContent>
        </Card>
      </div>

      {rooms && rooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Room Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rooms.map((room) => {
                const roomSurfaces = surfaces?.filter(s => s.room_id === room.id) || [];
                const roomTreatments = treatments?.filter(t => t.room_id === room.id) || [];
                const roomTotal = roomTreatments.reduce((sum, t) => sum + calculateTreatmentTotal(t), 0);

                return (
                  <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{room.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {room.room_type?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {roomSurfaces.length} surface{roomSurfaces.length !== 1 ? 's' : ''} • {roomTreatments.length} treatment{roomTreatments.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${roomTotal.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {(!rooms || rooms.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Rooms Yet</h3>
            <p className="text-sm text-muted-foreground">
              Start by adding rooms to your project using the Quick Create tab or Advanced tab.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
