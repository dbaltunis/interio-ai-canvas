
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Home, Trash2, Ruler } from "lucide-react";
import { useSurfaces, useCreateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { useRooms } from "@/hooks/useRooms";
import { EnhancedMeasurementWorksheet } from "../measurements/EnhancedMeasurementWorksheet";

interface WindowManagerProps {
  projectId: string;
  activeRoomId: string | null;
  selectedWindowId: string | null;
  onWindowSelect: (windowId: string) => void;
}

export const WindowManager = ({ projectId, activeRoomId, selectedWindowId, onWindowSelect }: WindowManagerProps) => {
  const [showMeasurementDialog, setShowMeasurementDialog] = useState(false);
  const [selectedSurface, setSelectedSurface] = useState<any>(null);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);
  const createSurface = useCreateSurface();
  const deleteSurface = useDeleteSurface();

  const currentRoom = rooms?.find(room => room.id === activeRoomId);
  const roomSurfaces = surfaces?.filter(surface => surface.room_id === activeRoomId) || [];

  const handleCreateWindow = async () => {
    if (!activeRoomId || !projectId) return;
    
    const windowNumber = roomSurfaces.length + 1;
    const newSurface = await createSurface.mutateAsync({
      room_id: activeRoomId,
      project_id: projectId,
      name: `Window ${windowNumber}`,
      surface_type: 'window',
      width: 36,
      height: 84
    });

    // Open measurement dialog for the new window
    setSelectedSurface(newSurface);
    setShowMeasurementDialog(true);
  };

  const handleMeasureWindow = (surface: any) => {
    setSelectedSurface(surface);
    setShowMeasurementDialog(true);
  };

  const handleMeasurementSave = () => {
    setShowMeasurementDialog(false);
    setSelectedSurface(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {currentRoom ? `${currentRoom.name} - Windows` : 'Select a Room'}
            </span>
            {currentRoom && (
              <Button size="sm" onClick={handleCreateWindow}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentRoom ? (
            <div className="text-center py-12 text-muted-foreground">
              <Home className="mx-auto h-12 w-12 mb-4" />
              <p>Select a room to manage windows</p>
            </div>
          ) : !roomSurfaces || roomSurfaces.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Plus className="mx-auto h-12 w-12 mb-4" />
              <p>No windows in this room</p>
              <p className="text-sm">Click "+" to add a window</p>
            </div>
          ) : (
            <div className="space-y-2">
              {roomSurfaces.map((surface) => (
                <div
                  key={surface.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedWindowId === surface.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => onWindowSelect(surface.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{surface.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {surface.width || 0}" × {surface.height || 0}"
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMeasureWindow(surface);
                        }}
                      >
                        <Ruler className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSurface.mutate(surface.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Measurement Dialog */}
      <Dialog open={showMeasurementDialog} onOpenChange={setShowMeasurementDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Measure Window - {selectedSurface?.name} ({currentRoom?.name})
            </DialogTitle>
          </DialogHeader>
          {selectedSurface && (
            <EnhancedMeasurementWorksheet
              clientId="" // We'll use project context instead
              projectId={projectId}
              surfaceId={selectedSurface.id} // Pass unique surface ID to isolate state
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
