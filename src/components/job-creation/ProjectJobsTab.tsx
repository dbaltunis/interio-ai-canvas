
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Clipboard } from "lucide-react";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useSurfaces, useCreateSurface, useUpdateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { useTreatments, useCreateTreatment } from "@/hooks/useTreatments";
import { RoomCard } from "./RoomCard";
import { EmptyRoomsState } from "./EmptyRoomsState";

interface ProjectJobsTabProps {
  project: any;
  onBack?: () => void;
}

export const ProjectJobsTab = ({ project, onBack }: ProjectJobsTabProps) => {
  const { data: rooms, isLoading: roomsLoading } = useRooms(project.id);
  const { data: allSurfaces } = useSurfaces(project.id);
  const { data: allTreatments } = useTreatments(project.id);
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const createSurface = useCreateSurface();
  const updateSurface = useUpdateSurface();
  const deleteSurface = useDeleteSurface();
  const createTreatment = useCreateTreatment();
  
  const [copiedRoom, setCopiedRoom] = useState<any>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");

  console.log("Project:", project);
  console.log("Rooms:", rooms);
  console.log("All surfaces:", allSurfaces);
  console.log("All treatments:", allTreatments);

  // Calculate total amount from all treatments for this project
  const projectTreatments = allTreatments?.filter(t => t.project_id === project.id) || [];
  const totalAmount = projectTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);

  const handleCreateRoom = async () => {
    try {
      const roomNumber = (rooms?.length || 0) + 1;
      await createRoom.mutateAsync({
        project_id: project.id,
        name: `Room ${roomNumber}`,
        room_type: "living_room"
      });
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const handleRenameRoom = async (roomId: string, newName: string) => {
    if (newName.trim()) {
      await updateRoom.mutateAsync({ id: roomId, name: newName.trim() });
    }
    setEditingRoomId(null);
    setEditingRoomName("");
  };

  const handleCreateSurface = async (roomId: string, surfaceType: string) => {
    try {
      const roomSurfaces = allSurfaces?.filter(s => s.room_id === roomId) || [];
      const surfaceNumber = roomSurfaces.length + 1;
      const surfaceName = surfaceType === 'wall' ? `Wall ${surfaceNumber}` : `Window ${surfaceNumber}`;
      
      await createSurface.mutateAsync({
        room_id: roomId,
        project_id: project.id,
        name: surfaceName,
        surface_type: surfaceType,
        width: surfaceType === 'wall' ? 120 : 60,
        height: surfaceType === 'wall' ? 96 : 48,
        surface_width: surfaceType === 'wall' ? 120 : 60,
        surface_height: surfaceType === 'wall' ? 96 : 48
      });
    } catch (error) {
      console.error("Failed to create surface:", error);
    }
  };

  const handleUpdateSurface = async (surfaceId: string, updates: any) => {
    try {
      await updateSurface.mutateAsync({ id: surfaceId, ...updates });
    } catch (error) {
      console.error("Failed to update surface:", error);
    }
  };

  const handleDeleteSurface = async (surfaceId: string) => {
    if (confirm("Delete this surface and all its treatments?")) {
      try {
        await deleteSurface.mutateAsync(surfaceId);
      } catch (error) {
        console.error("Failed to delete surface:", error);
      }
    }
  };

  const handleCopyRoom = (room: any) => {
    const roomSurfaces = allSurfaces?.filter(s => s.room_id === room.id) || [];
    const roomTreatments = allTreatments?.filter(t => t.room_id === room.id) || [];
    
    setCopiedRoom({
      room,
      surfaces: roomSurfaces,
      treatments: roomTreatments
    });
  };

  const handlePasteRoom = async () => {
    if (!copiedRoom) return;

    try {
      // Create new room
      const roomNumber = (rooms?.length || 0) + 1;
      const newRoom = await createRoom.mutateAsync({
        project_id: project.id,
        name: `${copiedRoom.room.name} (Copy ${roomNumber})`,
        room_type: copiedRoom.room.room_type
      });

      // Create surfaces for the new room
      for (const surface of copiedRoom.surfaces) {
        const newSurface = await createSurface.mutateAsync({
          room_id: newRoom.id,
          project_id: project.id,
          name: surface.name,
          surface_type: surface.surface_type,
          width: surface.width,
          height: surface.height,
          surface_width: surface.surface_width,
          surface_height: surface.surface_height
        });

        // Create treatments for each surface
        const surfaceTreatments = copiedRoom.treatments.filter((t: any) => t.window_id === surface.id);
        for (const treatment of surfaceTreatments) {
          await createTreatment.mutateAsync({
            window_id: newSurface.id,
            room_id: newRoom.id,
            project_id: project.id,
            treatment_type: treatment.treatment_type,
            product_name: treatment.product_name,
            material_cost: treatment.material_cost,
            labor_cost: treatment.labor_cost,
            total_price: treatment.total_price,
            status: treatment.status
          });
        }
      }
    } catch (error) {
      console.error("Failed to paste room:", error);
    }
  };

  const handleCreateTreatment = async (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => {
    try {
      const treatmentPayload = {
        window_id: surfaceId,
        room_id: roomId,
        project_id: project.id,
        treatment_type: treatmentType,
        status: "planned",
        product_name: treatmentData?.product_name || treatmentType,
        material_cost: treatmentData?.material_cost || 0,
        labor_cost: treatmentData?.labor_cost || 0,
        total_price: treatmentData?.total_price || 0,
        unit_price: treatmentData?.unit_price || 0,
        quantity: treatmentData?.quantity || 1,
        fabric_type: treatmentData?.fabric_type,
        color: treatmentData?.color,
        pattern: treatmentData?.pattern,
        hardware: treatmentData?.hardware,
        mounting_type: treatmentData?.mounting_type,
        notes: treatmentData?.notes,
        // Calculator-specific data
        ...(treatmentData?.measurements && {
          measurements: treatmentData.measurements
        })
      };

      await createTreatment.mutateAsync(treatmentPayload);
    } catch (error) {
      console.error("Failed to create treatment:", error);
    }
  };

  if (roomsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Loading rooms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Job Number and Total */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {project.job_number || 'No Job Number'}
          </h2>
          <p className="text-3xl font-bold text-green-600">
            Total: ${totalAmount.toFixed(2)}
          </p>
        </div>
        <Button 
          onClick={handleCreateRoom} 
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          disabled={createRoom.isPending}
        >
          <Plus className="h-4 w-4" />
          <span>{createRoom.isPending ? "Adding..." : "Add Room"}</span>
        </Button>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {copiedRoom && (
            <Button 
              onClick={handlePasteRoom}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Clipboard className="h-4 w-4" />
              <span>Paste Room</span>
            </Button>
          )}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!rooms || rooms.length === 0 ? (
          <div className="lg:col-span-2">
            <EmptyRoomsState onCreateRoom={handleCreateRoom} />
          </div>
        ) : (
          rooms.map((room) => (
            <RoomCard 
              key={room.id} 
              room={room} 
              projectId={project.id}
              onUpdateRoom={updateRoom}
              onDeleteRoom={deleteRoom}
              onCreateTreatment={handleCreateTreatment}
              onCreateSurface={handleCreateSurface}
              onUpdateSurface={handleUpdateSurface}
              onDeleteSurface={handleDeleteSurface}
              onCopyRoom={handleCopyRoom}
              editingRoomId={editingRoomId}
              setEditingRoomId={setEditingRoomId}
              editingRoomName={editingRoomName}
              setEditingRoomName={setEditingRoomName}
              onRenameRoom={handleRenameRoom}
            />
          ))
        )}
      </div>
    </div>
  );
};
