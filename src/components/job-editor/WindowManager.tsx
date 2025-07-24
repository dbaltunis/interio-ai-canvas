
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Square, Edit, Trash2, Ruler } from "lucide-react";
import { useSurfaces, useCreateSurface, useUpdateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { MeasurementWorksheet } from "../measurements/MeasurementWorksheet";
import { useState } from "react";

interface WindowManagerProps {
  projectId: string;
  activeRoomId: string | null;
  selectedWindowId: string | null;
  onWindowSelect: (windowId: string) => void;
}

export const WindowManager = ({ projectId, activeRoomId, selectedWindowId, onWindowSelect }: WindowManagerProps) => {
  const [showMeasurementDialog, setShowMeasurementDialog] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<any>(null);
  
  const { data: surfaces } = useSurfaces();
  const { data: measurements } = useClientMeasurements(projectId);
  const { data: projects } = useProjects();
  const { data: clients } = useClients();
  const createSurface = useCreateSurface();
  const updateSurface = useUpdateSurface();
  const deleteSurface = useDeleteSurface();

  const project = projects?.find(p => p.id === projectId);
  const client = clients?.find(c => c.id === project?.client_id);
  const roomSurfaces = surfaces?.filter(surface => surface.room_id === activeRoomId) || [];

  const handleCreateSurface = async () => {
    if (!activeRoomId) return;
    
    const surfaceNumber = roomSurfaces.length + 1;
    await createSurface.mutateAsync({
      project_id: projectId,
      room_id: activeRoomId,
      name: `Window ${surfaceNumber}`,
      surface_type: "window"
    });
  };

  const handleViewMeasurement = (measurement: any) => {
    setSelectedMeasurement(measurement);
    setShowMeasurementDialog(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Square className="mr-2 h-5 w-5" />
            {activeRoomId ? `Room Surfaces` : 'Select Room'}
          </span>
          {activeRoomId && (
            <Button size="sm" onClick={handleCreateSurface}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!activeRoomId ? (
          <div className="text-center py-8 text-muted-foreground">
            <Square className="mx-auto h-12 w-12 mb-4" />
            <p>Select a room to view surfaces</p>
          </div>
        ) : roomSurfaces.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Square className="mx-auto h-12 w-12 mb-4" />
            <p>No surfaces added yet</p>
            <p className="text-sm">Click the + button to add a surface</p>
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
                      {surface.surface_type}
                      {surface.width && surface.height && 
                        ` • ${surface.width}" × ${surface.height}"`
                      }
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMeasurement({
                          measurements: {},
                          measurement_type: "surface_measurement",
                          notes: "",
                          measured_by: "",
                          measured_at: new Date().toISOString()
                        });
                      }}
                    >
                      <Ruler className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt("Enter surface name:", surface.name);
                        if (newName) {
                          updateSurface.mutate({ id: surface.id, name: newName });
                        }
                      }}
                    >
                      <Edit className="h-3 w-3" />
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

      {/* Measurement Dialog */}
      {showMeasurementDialog && (
        <MeasurementWorksheet
          isOpen={showMeasurementDialog}
          onClose={() => setShowMeasurementDialog(false)}
          client={client ? {
            id: client.id,
            name: client.name
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
    </Card>
  );
};
