import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Home, Edit, Trash2, Window } from "lucide-react";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useSurfaces, useCreateSurface, useUpdateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { MeasurementWorksheet } from "../measurements/MeasurementWorksheet";
import { useProjects } from "@/hooks/useProjects";

interface WindowsCanvasInterfaceProps {
  projectId: string;
}

export const WindowsCanvasInterface = ({ projectId }: WindowsCanvasInterfaceProps) => {
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces();
  const { data: projects } = useProjects();
  const project = projects?.find(p => p.id === projectId);

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const createSurface = useCreateSurface();
  const updateSurface = useUpdateSurface();
  const deleteSurface = useDeleteSurface();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showMeasurementDialog, setShowMeasurementDialog] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<any>(null);

  const selectedRoom = rooms?.find(room => room.id === selectedRoomId);
  const roomSurfaces = surfaces?.filter(surface => surface.room_id === selectedRoomId);

  const handleCreateRoom = async () => {
    if (!projectId) return;
    
    const roomNumber = (rooms?.length || 0) + 1;
    await createRoom.mutateAsync({
      project_id: projectId,
      name: `Room ${roomNumber}`,
      room_type: "living_room"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Room Canvas</h2>
          <p className="text-muted-foreground">
            Visualize and manage rooms and surfaces
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Rooms
            </span>
            <Button size="sm" onClick={handleCreateRoom}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!rooms || rooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="mx-auto h-12 w-12 mb-4" />
              <p>No rooms added yet</p>
              <p className="text-sm">Click the + button to add a room</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRoomId === room.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{room.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {room.room_type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedRoom && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Canvas */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedRoom.name} Canvas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roomSurfaces && roomSurfaces.length > 0 ? (
                <div className="space-y-2">
                  {roomSurfaces.map((surface) => (
                    <div key={surface.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Window className="h-4 w-4" />
                        <span className="font-medium">{surface.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Window className="mx-auto h-12 w-12 mb-4" />
                  <p>No surfaces added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Measurements Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Measurements</span>
                <Button
                  size="sm"
                  onClick={() => setShowMeasurementDialog(true)}
                  disabled={!selectedRoom}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Measurement
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Measurements List (Placeholder) */}
              <p className="text-sm text-muted-foreground">
                No measurements added yet.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Measurement Dialog */}
      {showMeasurementDialog && selectedRoom && (
        <MeasurementWorksheet
          isOpen={showMeasurementDialog}
          onClose={() => setShowMeasurementDialog(false)}
          client={project?.client_id ? {
            id: project.client_id,
            name: project.clients?.name || "Client"
          } : undefined}
          project={{
            id: projectId,
            name: project?.name || "Project"
          }}
          existingMeasurement={selectedMeasurement ? {
            measurements: selectedMeasurement.measurements,
            measurement_type: selectedMeasurement.measurement_type,
            notes: selectedMeasurement.notes,
            measured_by: selectedMeasurement.measured_by,
            measured_at: selectedMeasurement.measured_at
          } : undefined}
          onSave={() => setShowMeasurementDialog(false)}
        />
      )}
    </div>
  );
};
