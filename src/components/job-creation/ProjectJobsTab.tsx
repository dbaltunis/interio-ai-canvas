import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Clipboard } from "lucide-react";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useWindows, useCreateWindow } from "@/hooks/useWindows";
import { useTreatments, useCreateTreatment } from "@/hooks/useTreatments";
import { RoomCard } from "./RoomCard";
import { EmptyRoomsState } from "./EmptyRoomsState";

interface ProjectJobsTabProps {
  project: any;
  onBack?: () => void;
}

export const ProjectJobsTab = ({ project, onBack }: ProjectJobsTabProps) => {
  const { data: rooms, isLoading: roomsLoading } = useRooms(project.id);
  const { data: allWindows } = useWindows(project.id);
  const { data: allTreatments } = useTreatments(project.id);
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const createWindow = useCreateWindow();
  const createTreatment = useCreateTreatment();
  
  const [copiedRoom, setCopiedRoom] = useState<any>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");

  console.log("Project ID:", project.id);
  console.log("Rooms:", rooms);
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

  const handleCopyRoom = (room: any) => {
    const roomWindows = allWindows?.filter(w => w.room_id === room.id) || [];
    const roomTreatments = allTreatments?.filter(t => t.room_id === room.id) || [];
    
    setCopiedRoom({
      room,
      windows: roomWindows,
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

      // Create windows for the new room
      for (const window of copiedRoom.windows) {
        const newWindow = await createWindow.mutateAsync({
          room_id: newRoom.id,
          project_id: project.id,
          name: window.name,
          width: window.width,
          height: window.height
        });

        // Create treatments for each window
        const windowTreatments = copiedRoom.treatments.filter((t: any) => t.window_id === window.id);
        for (const treatment of windowTreatments) {
          await createTreatment.mutateAsync({
            window_id: newWindow.id,
            room_id: newRoom.id,
            project_id: project.id,
            treatment_type: treatment.treatment_type,
            status: treatment.status,
            total_price: treatment.total_price
          });
        }
      }
    } catch (error) {
      console.error("Failed to paste room:", error);
    }
  };

  const handleCreateTreatment = async (roomId: string, treatmentType: string, treatmentData?: any) => {
    try {
      // Find or create a default window for this room
      let roomWindows = allWindows?.filter(w => w.room_id === roomId) || [];
      
      if (roomWindows.length === 0) {
        // Create a default window if none exists
        const newWindow = await createWindow.mutateAsync({
          room_id: roomId,
          project_id: project.id,
          name: "Window 1",
          width: 200,
          height: 250
        });
        roomWindows = [newWindow];
      }

      // Determine price based on treatment data or defaults
      let price = treatmentType === "Curtains" ? 75.00 : 
                  treatmentType === "Blinds" ? 45.00 : 
                  treatmentType === "Shutters" ? 120.00 : 50.00;

      if (treatmentData?.price) {
        price = treatmentData.price;
      }

      // Create treatment with enhanced data
      const treatmentPayload = {
        window_id: roomWindows[0].id,
        room_id: roomId,
        project_id: project.id,
        treatment_type: treatmentType,
        status: "planned",
        total_price: price,
        // Add calculator-specific data if available
        ...(treatmentData && {
          measurements: {
            railWidth: treatmentData.railWidth,
            curtainDrop: treatmentData.curtainDrop,
            curtainPooling: treatmentData.curtainPooling,
            headingFullness: treatmentData.headingFullness
          },
          fabric_type: treatmentData.fabricName,
          hardware: treatmentData.lining,
          mounting_type: treatmentData.headingStyle,
          quantity: treatmentData.quantity || 1,
          notes: `${treatmentData.windowPosition || ''} ${treatmentData.windowType || ''} configuration`.trim()
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
      {/* Total Amount and Add Room Button */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Total: ${totalAmount.toFixed(2)}
        </h2>
        <Button 
          onClick={handleCreateRoom} 
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          disabled={createRoom.isPending}
        >
          <Plus className="h-4 w-4" />
          <span>{createRoom.isPending ? "Adding..." : "Add room"}</span>
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

      {/* Rooms Grid - Responsive: 2 columns on desktop, 1 on mobile/tablet */}
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
