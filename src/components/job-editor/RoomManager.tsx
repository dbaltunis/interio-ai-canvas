
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Home, Edit, Trash2 } from "lucide-react";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";

interface RoomManagerProps {
  projectId: string;
  activeRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
}

export const RoomManager = ({ projectId, activeRoomId, onRoomSelect }: RoomManagerProps) => {
  const { data: rooms } = useRooms(projectId);
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

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
                  activeRoomId === room.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => onRoomSelect(room.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{room.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {room.room_type}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt("Enter room name:", room.name);
                        if (newName) {
                          updateRoom.mutate({ id: room.id, name: newName });
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
                        deleteRoom.mutate(room.id);
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
  );
};
