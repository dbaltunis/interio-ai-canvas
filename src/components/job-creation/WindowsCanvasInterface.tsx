
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Ruler } from "lucide-react";
import { useSurfaces, useCreateSurface } from "@/hooks/useSurfaces";
import { MeasurementWorksheet } from "../measurements/MeasurementWorksheet";

interface WindowsCanvasInterfaceProps {
  rooms: any[];
  surfaces: any[];
  onCreateSurface?: (roomId: string, surfaceType: string) => void;
  onBack: () => void;
}

export const WindowsCanvasInterface = ({ 
  rooms, 
  surfaces, 
  onCreateSurface, 
  onBack 
}: WindowsCanvasInterfaceProps) => {
  const [showMeasurementDialog, setShowMeasurementDialog] = useState(false);
  const [selectedSurface, setSelectedSurface] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const createSurface = useCreateSurface();

  const handleCreateWindow = async (room: any) => {
    if (!room.id) return;
    
    const roomSurfaces = surfaces.filter(s => s.room_id === room.id);
    const windowNumber = roomSurfaces.length + 1;
    
    const newSurface = await createSurface.mutateAsync({
      room_id: room.id,
      project_id: room.project_id,
      name: `Window ${windowNumber}`,
      surface_type: 'window',
      width: 36,
      height: 84
    });

    // Open measurement dialog for the new window
    setSelectedSurface(newSurface);
    setSelectedRoom(room);
    setShowMeasurementDialog(true);
  };

  const handleMeasureWindow = (surface: any) => {
    const room = rooms.find(r => r.id === surface.room_id);
    setSelectedSurface(surface);
    setSelectedRoom(room);
    setShowMeasurementDialog(true);
  };

  const handleMeasurementSave = () => {
    setShowMeasurementDialog(false);
    setSelectedSurface(null);
    setSelectedRoom(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => {
            const roomSurfaces = surfaces.filter(s => s.room_id === room.id);
            return (
              <Card key={room.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{room.name}</span>
                    <Button 
                      size="sm" 
                      onClick={() => handleCreateWindow(room)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Window
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {roomSurfaces.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No windows yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {roomSurfaces.map((surface) => (
                        <div
                          key={surface.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <span className="font-medium">{surface.name}</span>
                            <p className="text-sm text-muted-foreground">
                              {surface.width || 0}" × {surface.height || 0}"
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMeasureWindow(surface)}
                          >
                            <Ruler className="h-3 w-3 mr-1" />
                            Measure
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Measurement Dialog */}
      <Dialog open={showMeasurementDialog} onOpenChange={setShowMeasurementDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Measure Window - {selectedSurface?.name} ({selectedRoom?.name})
            </DialogTitle>
          </DialogHeader>
          {selectedSurface && selectedRoom && (
            <MeasurementWorksheet
              clientId="" // We'll use project context instead
              projectId={selectedRoom.project_id}
              existingMeasurement={selectedSurface.measurements ? {
                measurements: selectedSurface.measurements,
                measurement_type: "standard",
                notes: "",
                measured_by: "",
                measured_at: new Date().toISOString()
              } : undefined}
              onSave={handleMeasurementSave}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
