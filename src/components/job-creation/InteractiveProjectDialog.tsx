import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Home, Square, Settings2, Calculator, Link, Minus } from "lucide-react";
import { TreatmentCalculatorDialog } from "./TreatmentCalculatorDialog";

interface InteractiveProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'rooms' | 'surfaces' | 'treatments' | 'connect';
  project: any;
  rooms: any[];
  surfaces: any[];
  treatments: any[];
  onCreateRoom?: () => void;
  onCreateSurface?: (roomId: string, surfaceType: string) => void;
  onCreateTreatment?: (roomId: string, surfaceId: string, treatmentType: string) => void;
}

interface RoomToCreate {
  name: string;
  type: string;
}

export const InteractiveProjectDialog = ({
  isOpen,
  onClose,
  type,
  project,
  rooms,
  surfaces,
  treatments,
  onCreateRoom,
  onCreateSurface,
  onCreateTreatment
}: InteractiveProjectDialogProps) => {
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedSurface, setSelectedSurface] = useState<string>("");
  const [surfaceType, setSurfaceType] = useState<'window' | 'wall'>('window');
  const [treatmentType, setTreatmentType] = useState('curtains');
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  
  // New state for bulk room creation
  const [roomsToCreate, setRoomsToCreate] = useState<RoomToCreate[]>([
    { name: "", type: "living_room" }
  ]);
  const [isCreatingRooms, setIsCreatingRooms] = useState(false);

  const getDialogTitle = () => {
    switch (type) {
      case 'rooms': return 'Add Rooms';
      case 'surfaces': return 'Add Windows & Walls';
      case 'treatments': return 'Add Advanced Treatments';
      case 'connect': return 'Connect & Calculate';
      default: return 'Project Management';
    }
  };

  const addRoomSlot = () => {
    setRoomsToCreate([...roomsToCreate, { name: "", type: "living_room" }]);
  };

  const removeRoomSlot = (index: number) => {
    if (roomsToCreate.length > 1) {
      setRoomsToCreate(roomsToCreate.filter((_, i) => i !== index));
    }
  };

  const updateRoomSlot = (index: number, field: 'name' | 'type', value: string) => {
    const updated = [...roomsToCreate];
    updated[index][field] = value;
    setRoomsToCreate(updated);
  };

  const handleCreateAllRooms = async () => {
    const validRooms = roomsToCreate.filter(room => room.name.trim());
    if (validRooms.length === 0) return;

    setIsCreatingRooms(true);
    try {
      // Create rooms sequentially to avoid race conditions
      for (const room of validRooms) {
        await onCreateRoom?.();
      }
      
      // Reset the form and close dialog
      setRoomsToCreate([{ name: "", type: "living_room" }]);
      onClose();
    } catch (error) {
      console.error("Failed to create rooms:", error);
    } finally {
      setIsCreatingRooms(false);
    }
  };

  const handleCreateSurface = () => {
    if (selectedRoom) {
      onCreateSurface?.(selectedRoom, surfaceType);
      setSelectedRoom("");
    }
  };

  const handleCreateTreatment = () => {
    if (selectedRoom && selectedSurface) {
      setCalculatorOpen(true);
    }
  };

  const handleCalculatorSave = (treatmentData: any) => {
    if (selectedRoom && selectedSurface) {
      onCreateTreatment?.(selectedRoom, selectedSurface, treatmentType);
    }
    setCalculatorOpen(false);
  };

  const roomTypeOptions = [
    { value: "living_room", label: "Living Room" },
    { value: "bedroom", label: "Bedroom" },
    { value: "kitchen", label: "Kitchen" },
    { value: "dining_room", label: "Dining Room" },
    { value: "bathroom", label: "Bathroom" },
    { value: "office", label: "Office" },
    { value: "other", label: "Other" }
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {type === 'rooms' && <Home className="h-5 w-5" />}
              {type === 'surfaces' && <Square className="h-5 w-5" />}
              {type === 'treatments' && <Settings2 className="h-5 w-5" />}
              {type === 'connect' && <Link className="h-5 w-5" />}
              {getDialogTitle()}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {type === 'rooms' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Create Multiple Rooms</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {roomsToCreate.map((room, index) => (
                      <div key={index} className="flex items-end gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <Label htmlFor={`room-name-${index}`}>Room Name</Label>
                          <Input
                            id={`room-name-${index}`}
                            value={room.name}
                            onChange={(e) => updateRoomSlot(index, 'name', e.target.value)}
                            placeholder="e.g., Master Bedroom, Living Room"
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Room Type</Label>
                          <Select 
                            value={room.type} 
                            onValueChange={(value) => updateRoomSlot(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roomTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeRoomSlot(index)}
                          disabled={roomsToCreate.length === 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={addRoomSlot}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Another Room
                      </Button>
                      
                      <Button
                        onClick={handleCreateAllRooms}
                        disabled={isCreatingRooms || !roomsToCreate.some(room => room.name.trim())}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {isCreatingRooms ? 'Creating Rooms...' : `Create ${roomsToCreate.filter(room => room.name.trim()).length} Room${roomsToCreate.filter(room => room.name.trim()).length !== 1 ? 's' : ''}`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {rooms.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Existing Rooms ({rooms.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {rooms.map((room) => (
                          <div key={room.id} className="p-2 border rounded text-sm">
                            {room.name}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {type === 'surfaces' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add Windows & Walls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Select Room</Label>
                      <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Surface Type</Label>
                      <Select value={surfaceType} onValueChange={(value) => setSurfaceType(value as 'window' | 'wall')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="window">Window</SelectItem>
                          <SelectItem value="wall">Wall</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleCreateSurface} disabled={!selectedRoom}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add {surfaceType === 'window' ? 'Window' : 'Wall'}
                    </Button>
                  </CardContent>
                </Card>

                {surfaces.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Existing Surfaces ({surfaces.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {surfaces.map((surface) => {
                          const room = rooms.find(r => r.id === surface.room_id);
                          return (
                            <div key={surface.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <span className="font-medium">{surface.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {room?.name || 'Unknown Room'}
                                </Badge>
                              </div>
                              <Badge variant={surface.surface_type === 'window' ? 'default' : 'secondary'}>
                                {surface.surface_type}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {type === 'treatments' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Advanced Treatment Calculator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Select Room</Label>
                      <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedRoom && (
                      <div>
                        <Label>Select Surface</Label>
                        <Select value={selectedSurface} onValueChange={setSelectedSurface}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a surface" />
                          </SelectTrigger>
                          <SelectContent>
                            {surfaces
                              .filter(s => s.room_id === selectedRoom)
                              .map((surface) => (
                                <SelectItem key={surface.id} value={surface.id}>
                                  {surface.name} ({surface.surface_type})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label>Treatment Type</Label>
                      <Select value={treatmentType} onValueChange={setTreatmentType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="curtains">Curtains</SelectItem>
                          <SelectItem value="blinds">Blinds</SelectItem>
                          <SelectItem value="shutters">Shutters</SelectItem>
                          <SelectItem value="drapes">Drapes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleCreateTreatment} 
                      disabled={!selectedRoom || !selectedSurface}
                      className="w-full"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Open Advanced Calculator
                    </Button>
                  </CardContent>
                </Card>

                {treatments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Existing Treatments ({treatments.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {treatments.map((treatment) => {
                          const room = rooms.find(r => r.id === treatment.room_id);
                          const surface = surfaces.find(s => s.id === treatment.window_id);
                          return (
                            <div key={treatment.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <span className="font-medium">{treatment.treatment_type}</span>
                                <div className="text-sm text-muted-foreground">
                                  {room?.name} • {surface?.name}
                                </div>
                              </div>
                              <Badge variant="outline">
                                ${treatment.total_price?.toFixed(2) || '0.00'}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {type === 'connect' && (
              <div className="space-y-4">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="calculations">Calculations</TabsTrigger>
                    <TabsTrigger value="connections">Connections</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{rooms.length}</div>
                          <div className="text-sm text-muted-foreground">Rooms</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">{surfaces.length}</div>
                          <div className="text-sm text-muted-foreground">Surfaces</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{treatments.length}</div>
                          <div className="text-sm text-muted-foreground">Treatments</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="calculations" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Advanced Calculations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Material Costs:</span>
                            <span>${treatments.reduce((sum, t) => sum + (t.material_cost || 0), 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Labor Costs:</span>
                            <span>${treatments.reduce((sum, t) => sum + (t.labor_cost || 0), 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t pt-2">
                            <span>Total Project:</span>
                            <span>${treatments.reduce((sum, t) => sum + (t.total_price || 0), 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="connections" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Room Connections</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {rooms.map((room) => {
                            const roomSurfaces = surfaces.filter(s => s.room_id === room.id);
                            const roomTreatments = treatments.filter(t => t.room_id === room.id);
                            return (
                              <div key={room.id} className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">{room.name}</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Surfaces: </span>
                                    <span>{roomSurfaces.length}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Treatments: </span>
                                    <span>{roomTreatments.length}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TreatmentCalculatorDialog
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        onSave={handleCalculatorSave}
        treatmentType={treatmentType}
      />
    </>
  );
};
