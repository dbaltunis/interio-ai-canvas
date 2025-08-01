import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Home, Square, Settings2, Calculator, Link, Save, X } from "lucide-react";
import { TreatmentCalculatorDialog } from "./TreatmentCalculatorDialog";
import { WindowsCanvasInterface } from "./WindowsCanvasInterface";
import { useCreateRoom } from "@/hooks/useRooms";
import { useToast } from "@/hooks/use-toast";

interface InteractiveProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'rooms' | 'surfaces' | 'treatments' | 'connect';
  project: any;
  rooms: any[];
  surfaces: any[];
  treatments: any[];
  onCreateRoom?: (roomData?: { name: string; room_type: string }) => Promise<void>;
  onCreateSurface?: (roomId: string, surfaceType: string) => void;
  onCreateTreatment?: (roomId: string, surfaceId: string, treatmentType: string) => void;
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
  const createRoom = useCreateRoom();
  const { toast } = useToast();
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedSurface, setSelectedSurface] = useState<string>("");
  const [surfaceType, setSurfaceType] = useState<'window' | 'wall'>('window');
  const [treatmentType, setTreatmentType] = useState('curtains');
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [showWindowsCanvas, setShowWindowsCanvas] = useState(false);
  
  // Room creation state - starting from 1
  const [numberOfRooms, setNumberOfRooms] = useState(4);
  const [roomNames, setRoomNames] = useState<string[]>(Array(4).fill("").map((_, index) => `Room ${index + 1}`));
  const [isCreatingRooms, setIsCreatingRooms] = useState(false);

  const getDialogTitle = () => {
    if (showWindowsCanvas) return 'Add Windows';
    switch (type) {
      case 'rooms': return 'Add Rooms';
      case 'surfaces': return 'Add Windows & Walls';
      case 'treatments': return 'Add Advanced Treatments';
      case 'connect': return 'Connect & Calculate';
      default: return 'Project Management';
    }
  };

  const handleNumberOfRoomsChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 1 && num <= 20) {
      setNumberOfRooms(num);
      // Adjust the roomNames array to match the new number, starting from Room 1
      const newRoomNames = Array(num).fill("").map((_, index) => 
        roomNames[index] || `Room ${index + 1}`
      );
      setRoomNames(newRoomNames);
    }
  };

  const handleRoomNameChange = (index: number, value: string) => {
    const newRoomNames = [...roomNames];
    newRoomNames[index] = value;
    setRoomNames(newRoomNames);
  };

  const handleCreateAllRooms = async () => {
    const validRoomNames = roomNames.filter(name => name.trim());
    if (validRoomNames.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one room name",
        variant: "destructive",
      });
      return;
    }

    if (!project?.id) {
      toast({
        title: "Error",
        description: "No project selected",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingRooms(true);
    try {
      console.log("Creating rooms directly:", validRoomNames);
      
      // Create rooms directly using the createRoom mutation
      for (let i = 0; i < validRoomNames.length; i++) {
        const roomData = {
          name: validRoomNames[i].trim(),
          room_type: "living_room",
          project_id: project.id
        };
        console.log(`Creating room ${i + 1}:`, roomData);
        await createRoom.mutateAsync(roomData);
        // Small delay between creations to avoid database conflicts
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log("All rooms created successfully");
      
      // Reset the form
      setNumberOfRooms(4);
      setRoomNames(Array(4).fill("").map((_, index) => `Room ${index + 1}`));
      
      toast({
        title: "Success",
        description: `Created ${validRoomNames.length} room${validRoomNames.length > 1 ? 's' : ''} successfully`,
      });
      
    } catch (error) {
      console.error("Failed to create rooms:", error);
      toast({
        title: "Error",
        description: "Failed to create rooms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRooms(false);
    }
  };

  const handleSaveAndClose = async () => {
    await handleCreateAllRooms();
    // Small delay to let the mutation complete
    await new Promise(resolve => setTimeout(resolve, 500));
    onClose();
  };

  const handleAddWindows = async () => {
    await handleCreateAllRooms();
    // Small delay before showing windows canvas
    await new Promise(resolve => setTimeout(resolve, 500));
    setShowWindowsCanvas(true);
  };

  const handleCreateSurface = () => {
    if (selectedRoom) {
      onCreateSurface?.(selectedRoom, 'window');
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

  const validRoomCount = roomNames.filter(name => name.trim()).length;
  const existingRoomCount = rooms?.length || 0;

  // If showing windows canvas, render that interface
  if (showWindowsCanvas) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Square className="h-5 w-5" />
                Add Windows
              </DialogTitle>
            </DialogHeader>

            <WindowsCanvasInterface
              rooms={rooms}
              surfaces={surfaces}
              onCreateSurface={onCreateSurface}
              onBack={() => setShowWindowsCanvas(false)}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWindowsCanvas(false)}>
                Back to Rooms
              </Button>
              <Button onClick={onClose}>
                <Save className="h-4 w-4 mr-2" />
                Save and Close
              </Button>
            </DialogFooter>
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
  }

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
                    <CardTitle className="text-lg">Create New Rooms</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="numberOfRooms" className="font-medium">
                        How many rooms?
                      </Label>
                      <Input
                        id="numberOfRooms"
                        type="number"
                        min="1"
                        max="20"
                        value={numberOfRooms}
                        onChange={(e) => handleNumberOfRoomsChange(e.target.value)}
                        className="w-20"
                      />
                    </div>

                    <div className="space-y-4">
                      {Array.from({ length: numberOfRooms }, (_, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <Label className="font-medium min-w-[80px]">
                            Room {index + 1}:
                          </Label>
                          <Input
                            value={roomNames[index] || ""}
                            onChange={(e) => handleRoomNameChange(index, e.target.value)}
                            placeholder={`Room ${index + 1}`}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-muted-foreground">
                          <div>Selected: {existingRoomCount} existing + {validRoomCount} new rooms</div>
                          <div>Total: {existingRoomCount + validRoomCount} rooms</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {existingRoomCount > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Existing Rooms ({existingRoomCount})</CardTitle>
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
                    <CardTitle className="text-lg">Add Windows</CardTitle>
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

                    <Button onClick={handleCreateSurface} disabled={!selectedRoom}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Window
                    </Button>
                  </CardContent>
                </Card>

                {surfaces.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Existing Windows ({surfaces.length})</CardTitle>
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
                              <Badge variant="default">
                                Window
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

          <DialogFooter>
            {type === 'rooms' && (
              <>
                <Button variant="outline" onClick={onClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveAndClose}
                  disabled={isCreatingRooms || validRoomCount === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isCreatingRooms ? 'Saving...' : 'Save and Close'}
                </Button>
                <Button 
                  onClick={handleAddWindows}
                  disabled={isCreatingRooms || validRoomCount === 0}
                  variant="default"
                >
                  <Square className="h-4 w-4 mr-2" />
                  {isCreatingRooms ? 'Creating Rooms...' : 'Add Windows'}
                </Button>
              </>
            )}
            {type !== 'rooms' && (
              <Button onClick={onClose}>
                Close
              </Button>
            )}
          </DialogFooter>
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
