
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Home, Trash2 } from "lucide-react";
import { useWindows, useCreateWindow, useDeleteWindow } from "@/hooks/useWindows";
import { useRooms } from "@/hooks/useRooms";

interface WindowManagerProps {
  projectId: string;
  activeRoomId: string | null;
  selectedWindowId: string | null;
  onWindowSelect: (windowId: string) => void;
}

export const WindowManager = ({ projectId, activeRoomId, selectedWindowId, onWindowSelect }: WindowManagerProps) => {
  const { data: rooms } = useRooms(projectId);
  const { data: windows } = useWindows(activeRoomId || undefined);
  const createWindow = useCreateWindow();
  const deleteWindow = useDeleteWindow();

  const currentRoom = rooms?.find(room => room.id === activeRoomId);

  const handleCreateWindow = async () => {
    if (!activeRoomId || !projectId) return;
    
    const windowNumber = (windows?.length || 0) + 1;
    await createWindow.mutateAsync({
      room_id: activeRoomId,
      project_id: projectId,
      name: `Window ${windowNumber}`,
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
        ) : !windows || windows.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Plus className="mx-auto h-12 w-12 mb-4" />
            <p>No windows in this room</p>
            <p className="text-sm">Click "+" to add a window</p>
          </div>
        ) : (
          <div className="space-y-2">
            {windows.map((window) => (
              <div
                key={window.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedWindowId === window.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => onWindowSelect(window.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{window.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {window.width}" × {window.height}"
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWindow.mutate(window.id);
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
