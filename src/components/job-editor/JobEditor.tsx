
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, Trash2, Edit, Save } from "lucide-react";

interface Room {
  id: string;
  name: string;
  windows: Window[];
}

interface Window {
  id: string;
  name: string;
  width: number;
  height: number;
  treatment: string;
  fabric: string;
  notes: string;
}

export const JobEditor = () => {
  const [project, setProject] = useState({
    name: "",
    clientName: "",
    address: "",
    description: ""
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  const addRoom = () => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name: `Room ${rooms.length + 1}`,
      windows: []
    };
    setRooms([...rooms, newRoom]);
    setActiveRoom(newRoom.id);
  };

  const deleteRoom = (roomId: string) => {
    setRooms(rooms.filter(room => room.id !== roomId));
    if (activeRoom === roomId) {
      setActiveRoom(rooms.length > 1 ? rooms[0].id : null);
    }
  };

  const updateRoom = (roomId: string, name: string) => {
    setRooms(rooms.map(room => 
      room.id === roomId ? { ...room, name } : room
    ));
  };

  const addWindow = (roomId: string) => {
    const newWindow: Window = {
      id: Date.now().toString(),
      name: "Window 1",
      width: 36,
      height: 84,
      treatment: "",
      fabric: "",
      notes: ""
    };

    setRooms(rooms.map(room => 
      room.id === roomId 
        ? { ...room, windows: [...room.windows, newWindow] }
        : room
    ));
  };

  const updateWindow = (roomId: string, windowId: string, updates: Partial<Window>) => {
    setRooms(rooms.map(room => 
      room.id === roomId 
        ? {
            ...room, 
            windows: room.windows.map(window => 
              window.id === windowId ? { ...window, ...updates } : window
            )
          }
        : room
    ));
  };

  const deleteWindow = (roomId: string, windowId: string) => {
    setRooms(rooms.map(room => 
      room.id === roomId 
        ? { ...room, windows: room.windows.filter(window => window.id !== windowId) }
        : room
    ));
  };

  const currentRoom = rooms.find(room => room.id === activeRoom);

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
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Project
        </Button>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Basic project details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={project.name}
                onChange={(e) => setProject({...project, name: e.target.value})}
                placeholder="Living Room Renovation"
              />
            </div>
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={project.clientName}
                onChange={(e) => setProject({...project, clientName: e.target.value})}
                placeholder="John & Jane Smith"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Project Address</Label>
            <Input
              id="address"
              value={project.address}
              onChange={(e) => setProject({...project, address: e.target.value})}
              placeholder="123 Main Street, City, State 12345"
            />
          </div>
          <div>
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              value={project.description}
              onChange={(e) => setProject({...project, description: e.target.value})}
              placeholder="Complete window treatment installation for main floor..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Rooms Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Room List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Rooms
              </span>
              <Button size="sm" onClick={addRoom}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? (
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
                      activeRoom === room.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveRoom(room.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{room.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {room.windows.length} window{room.windows.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newName = prompt("Enter room name:", room.name);
                            if (newName) updateRoom(room.id, newName);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRoom(room.id);
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

        {/* Window Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {currentRoom ? `${currentRoom.name} - Windows` : 'Select a Room'}
              </span>
              {currentRoom && (
                <Button size="sm" onClick={() => addWindow(currentRoom.id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Window
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
            ) : currentRoom.windows.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Plus className="mx-auto h-12 w-12 mb-4" />
                <p>No windows in this room</p>
                <p className="text-sm">Click "Add Window" to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {currentRoom.windows.map((window) => (
                  <div key={window.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">{window.name}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteWindow(currentRoom.id, window.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Window Name</Label>
                        <Input
                          value={window.name}
                          onChange={(e) => updateWindow(currentRoom.id, window.id, { name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Width (in)</Label>
                          <Input
                            type="number"
                            value={window.width}
                            onChange={(e) => updateWindow(currentRoom.id, window.id, { width: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Height (in)</Label>
                          <Input
                            type="number"
                            value={window.height}
                            onChange={(e) => updateWindow(currentRoom.id, window.id, { height: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Treatment Type</Label>
                        <Select
                          value={window.treatment}
                          onValueChange={(value) => updateWindow(currentRoom.id, window.id, { treatment: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select treatment" />
                          </SelectTrigger>
                          <SelectContent>
                            {treatmentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Fabric Type</Label>
                        <Select
                          value={window.fabric}
                          onValueChange={(value) => updateWindow(currentRoom.id, window.id, { fabric: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fabric" />
                          </SelectTrigger>
                          <SelectContent>
                            {fabricTypes.map((fabric) => (
                              <SelectItem key={fabric} value={fabric}>
                                {fabric}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={window.notes}
                          onChange={(e) => updateWindow(currentRoom.id, window.id, { notes: e.target.value })}
                          placeholder="Special requirements, hardware notes, etc."
                        />
                      </div>
                    </div>
                    
                    {window.treatment && window.fabric && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex space-x-2">
                          <Badge variant="outline">{window.treatment}</Badge>
                          <Badge variant="outline">{window.fabric}</Badge>
                          <Badge variant="outline">{window.width}" × {window.height}"</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
