
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, Square } from "lucide-react";
import { useState } from "react";

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
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const handleAddWindow = (roomId: string) => {
    console.log("Adding window to room:", roomId);
    setSelectedRoomId(roomId);
    onCreateSurface?.(roomId, 'window');
    // Small delay to show visual feedback
    setTimeout(() => setSelectedRoomId(null), 500);
  };

  const getRoomSurfaces = (roomId: string) => {
    return surfaces.filter(surface => surface.room_id === roomId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Add Windows to Rooms</h3>
        <p className="text-muted-foreground">Click the + button on any room to add windows</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const roomSurfaces = getRoomSurfaces(room.id);
          const isSelected = selectedRoomId === room.id;
          
          return (
            <Card 
              key={room.id} 
              className={`relative transition-all duration-200 ${
                isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    {room.name}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddWindow(room.id)}
                    className="h-8 w-8 p-0"
                    disabled={isSelected}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Room Type:</span>
                    <Badge variant="outline">
                      {room.room_type?.replace('_', ' ') || 'General'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Windows:</span>
                      <span className="font-medium">{roomSurfaces.length}</span>
                    </div>
                    
                    {roomSurfaces.length > 0 && (
                      <div className="space-y-1">
                        {roomSurfaces.map((surface) => (
                          <div key={surface.id} className="flex items-center gap-2 text-xs">
                            <Square className="h-3 w-3" />
                            <span>{surface.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {surface.surface_type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {roomSurfaces.length === 0 && (
                      <div className="text-xs text-muted-foreground italic">
                        No windows added yet
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rooms.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Rooms Available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You need to create rooms first before adding windows.
            </p>
            <Button onClick={onBack} variant="outline">
              Go Back to Create Rooms
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
