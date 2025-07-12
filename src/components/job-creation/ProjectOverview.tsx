import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Square, Settings2, DollarSign, Plus } from "lucide-react";
import { useState } from "react";
import { InteractiveProjectDialog } from "./InteractiveProjectDialog";

interface ProjectOverviewProps {
  project: any;
  rooms: any[];
  surfaces: any[];
  treatments: any[];
  onCreateRoom?: () => void;
  onCreateSurface?: (roomId: string, surfaceType: string) => void;
  onCreateTreatment?: (roomId: string, surfaceId: string, treatmentType: string) => void;
}

export const ProjectOverview = ({ 
  project, 
  rooms, 
  surfaces, 
  treatments,
  onCreateRoom,
  onCreateSurface,
  onCreateTreatment
}: ProjectOverviewProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'rooms' | 'surfaces' | 'treatments' | 'connect'>('rooms');

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

  const handleCardClick = (type: 'rooms' | 'surfaces' | 'treatments' | 'connect') => {
    setDialogType(type);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary"
          onClick={() => handleCardClick('rooms')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Plus className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Click to add rooms
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary"
          onClick={() => handleCardClick('surfaces')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Surfaces</CardTitle>
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4 text-muted-foreground" />
              <Plus className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surfaces?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Click to add windows & walls
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary"
          onClick={() => handleCardClick('treatments')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treatments</CardTitle>
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <Plus className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treatments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Click for advanced treatments
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-green-500"
          onClick={() => handleCardClick('connect')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connect & Calculate</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${projectTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Advanced calculations
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
            <p className="text-sm text-muted-foreground mb-4">
              Click on the cards above to start adding rooms, surfaces, and treatments.
            </p>
            <Button onClick={() => handleCardClick('rooms')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}

      <InteractiveProjectDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        type={dialogType}
        project={project}
        rooms={rooms}
        surfaces={surfaces}
        treatments={treatments}
        onCreateRoom={onCreateRoom}
        onCreateSurface={onCreateSurface}
        onCreateTreatment={onCreateTreatment}
      />
    </div>
  );
};
