
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Home, Trash2 } from "lucide-react";
import { useSurfaces, useCreateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { useRooms } from "@/hooks/useRooms";

interface WindowManagerProps {
  projectId: string;
  activeRoomId: string | null;
  selectedWindowId: string | null;
  onWindowSelect: (windowId: string) => void;
}

export const WindowManager = ({ projectId, activeRoomId, selectedWindowId, onWindowSelect }: WindowManagerProps) => {
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);
  const createSurface = useCreateSurface();
  const deleteSurface = useDeleteSurface();

  const currentRoom = rooms?.find(room => room.id === activeRoomId);
  const roomSurfaces = surfaces?.filter(surface => surface.room_id === activeRoomId) || [];

  const handleCreateWindow = async () => {
    if (!activeRoomId || !projectId) return;
    
    const windowNumber = roomSurfaces.length + 1;
    await createSurface.mutateAsync({
      room_id: activeRoomId,
      project_id: projectId,
      name: `Window ${windowNumber}`,
      surface_type: 'window',
      width: 36,
      height: 84
    });
  };

  return (
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
