
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, Trash2, Edit, Copy } from "lucide-react";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useWindows, useCreateWindow, useUpdateWindow, useDeleteWindow } from "@/hooks/useWindows";
import { useTreatments, useCreateTreatment } from "@/hooks/useTreatments";

interface ProjectJobsTabProps {
  project: any;
}

export const ProjectJobsTab = ({ project }: ProjectJobsTabProps) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  
  const { data: rooms } = useRooms(project.id);
  const { data: windows } = useWindows(selectedRoomId || undefined);
  const { data: treatments } = useTreatments(selectedWindowId || undefined);
  
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const createWindow = useCreateWindow();
  const updateWindow = useUpdateWindow();
  const deleteWindow = useDeleteWindow();
  const createTreatment = useCreateTreatment();

  const selectedRoom = rooms?.find(room => room.id === selectedRoomId);
  const selectedWindow = windows?.find(window => window.id === selectedWindowId);

  const handleCreateRoom = async () => {
    const roomNumber = (rooms?.length || 0) + 1;
    await createRoom.mutateAsync({
      project_id: project.id,
      name: `Room ${roomNumber}`,
      room_type: "living_room"
    });
  };

  const handleCreateWindow = async () => {
    if (!selectedRoomId) return;
    
    const windowNumber = (windows?.length || 0) + 1;
    await createWindow.mutateAsync({
      room_id: selectedRoomId,
      project_id: project.id,
      name: `Window ${windowNumber}`,
      width: 36,
      height: 84
    });
  };

  const handleCreateTreatment = async () => {
    if (!selectedWindowId || !selectedRoomId) return;
    
    await createTreatment.mutateAsync({
      window_id: selectedWindowId,
      room_id: selectedRoomId,
      project_id: project.id,
      treatment_type: "Curtains",
      status: "planned"
    });
  };

  return (
    <div className="space-y-6">
      {/* Add Room Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Project Structure</h3>
        <Button onClick={handleCreateRoom} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Room</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Rooms List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Rooms ({rooms?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!rooms || rooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Home className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No rooms added yet</p>
                <p className="text-sm">Click "Add Room" to get started</p>
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
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      setSelectedWindowId(null);
                    }}
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
                            if (confirm("Delete this room?")) {
                              deleteRoom.mutate(room.id);
                              if (selectedRoomId === room.id) {
                                setSelectedRoomId(null);
                                setSelectedWindowId(null);
                              }
                            }
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

        {/* Windows List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedRoom ? `${selectedRoom.name} - Windows` : 'Select a Room'}
              </span>
              {selectedRoom && (
                <Button size="sm" onClick={handleCreateWindow}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedRoom ? (
              <div className="text-center py-12 text-muted-foreground">
                <Home className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Select a room to manage windows</p>
              </div>
            ) : !windows || windows.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Plus className="mx-auto h-12 w-12 mb-4 opacity-50" />
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
                    onClick={() => setSelectedWindowId(window.id)}
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
                          if (confirm("Delete this window?")) {
                            deleteWindow.mutate(window.id);
                            if (selectedWindowId === window.id) {
                              setSelectedWindowId(null);
                            }
                          }
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

        {/* Window Details & Treatments */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedWindow ? `${selectedWindow.name} Details` : 'Select a Window'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedWindow ? (
              <div className="text-center py-12 text-muted-foreground">
                <Plus className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Select a window to view details</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label>Window Name</Label>
                    <Input
                      value={selectedWindow.name}
                      onBlur={(e) => updateWindow.mutate({ 
                        id: selectedWindow.id, 
                        name: e.target.value 
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Width (in)</Label>
                      <Input
                        type="number"
                        value={selectedWindow.width || ""}
                        onBlur={(e) => updateWindow.mutate({ 
                          id: selectedWindow.id, 
                          width: parseFloat(e.target.value) || null
                        })}
                      />
                    </div>
                    <div>
                      <Label>Height (in)</Label>
                      <Input
                        type="number"
                        value={selectedWindow.height || ""}
                        onBlur={(e) => updateWindow.mutate({ 
                          id: selectedWindow.id, 
                          height: parseFloat(e.target.value) || null
                        })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={selectedWindow.notes || ""}
                      onBlur={(e) => updateWindow.mutate({ 
                        id: selectedWindow.id, 
                        notes: e.target.value 
                      })}
                      placeholder="Window notes..."
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Treatments</h4>
                    <Button size="sm" onClick={handleCreateTreatment}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {treatments && treatments.length > 0 ? (
                    <div className="space-y-2">
                      {treatments.map((treatment) => (
                        <div key={treatment.id} className="p-2 border rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{treatment.treatment_type}</p>
                              <p className="text-sm text-muted-foreground">{treatment.fabric_type}</p>
                            </div>
                            <Badge variant="outline">{treatment.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No treatments added yet</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
