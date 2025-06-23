
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, Trash2, Edit, Save } from "lucide-react";
import { useProjects, useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useWindows, useCreateWindow, useUpdateWindow, useDeleteWindow } from "@/hooks/useWindows";
import { useTreatments, useCreateTreatment, useUpdateTreatment, useDeleteTreatment } from "@/hooks/useTreatments";

export const JobEditor = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  const { data: projects } = useProjects();
  const { data: clients } = useClients();
  const { data: rooms } = useRooms(selectedProjectId);
  const { data: windows } = useWindows(activeRoomId || undefined);
  const { data: treatments } = useTreatments(selectedWindowId || undefined);

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const createWindow = useCreateWindow();
  const updateWindow = useUpdateWindow();
  const deleteWindow = useDeleteWindow();

  const selectedProject = projects?.find(p => p.id === selectedProjectId);
  const currentRoom = rooms?.find(room => room.id === activeRoomId);
  const selectedWindow = windows?.find(window => window.id === selectedWindowId);

  const handleCreateRoom = async () => {
    if (!selectedProjectId) return;
    
    const roomNumber = (rooms?.length || 0) + 1;
    await createRoom.mutateAsync({
      project_id: selectedProjectId,
      name: `Room ${roomNumber}`,
      room_type: "living_room"
    });
  };

  const handleCreateWindow = async () => {
    if (!activeRoomId || !selectedProjectId) return;
    
    const windowNumber = (windows?.length || 0) + 1;
    await createWindow.mutateAsync({
      room_id: activeRoomId,
      project_id: selectedProjectId,
      name: `Window ${windowNumber}`,
      width: 36,
      height: 84
    });
  };

  const treatmentTypes = [
    "Curtains", "Drapes", "Valances", "Roman Shades", "Blinds", "Shutters"
  ];

  const fabricTypes = [
    "Cotton", "Linen", "Silk", "Velvet", "Polyester", "Blackout"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Editor</h2>
          <p className="text-muted-foreground">
            Design and plan window treatment projects room by room
          </p>
        </div>
        <Button disabled={!selectedProjectId}>
          <Save className="mr-2 h-4 w-4" />
          Save Project
        </Button>
      </div>

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>Choose an existing project to edit</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a project..." />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedProject && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium">{selectedProject.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{selectedProject.status}</Badge>
                <Badge variant="outline">{selectedProject.priority}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProjectId && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Room List */}
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
                      onClick={() => {
                        setActiveRoomId(room.id);
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

          {/* Window List */}
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
                  <Plus className="mx-auto h-12 w-12 mb-4" />
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
                      <Button size="sm" onClick={() => {
                        // This would open a treatment creation dialog
                        console.log("Create treatment for window:", selectedWindow.id);
                      }}>
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
      )}
    </div>
  );
};
