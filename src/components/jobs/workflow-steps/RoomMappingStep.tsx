import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Home, 
  X,
  Calculator,
  Edit2,
  Trash2
} from "lucide-react";
import { TreatmentCalculatorPopup } from "../TreatmentCalculatorPopup";
import { useRooms, useCreateRoom } from "@/hooks/useRooms";
import { useSurfaces, useCreateSurface } from "@/hooks/useSurfaces";
import { useToast } from "@/hooks/use-toast";

interface RoomMappingStepProps {
  project?: any;
  rooms?: any[];
  treatments?: any[];
  onRoomsUpdate: (rooms: any[]) => void;
  onTreatmentsUpdate: (treatments: any[]) => void;
}

export const RoomMappingStep = ({ 
  project, 
  rooms = [], 
  treatments = [],
  onRoomsUpdate, 
  onTreatmentsUpdate 
}: RoomMappingStepProps) => {
  const [showTreatmentPopup, setShowTreatmentPopup] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<any>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newWindowName, setNewWindowName] = useState("");
  const [showNewRoomForm, setShowNewRoomForm] = useState(false);
  const [showNewWindowForm, setShowNewWindowForm] = useState<string | null>(null);

  const { data: dbRooms = [] } = useRooms(project?.id);
  const { data: dbSurfaces = [] } = useSurfaces(project?.id);
  const createRoomMutation = useCreateRoom();
  const createSurfaceMutation = useCreateSurface();
  const { toast } = useToast();

  // Combine workflow rooms with database rooms
  const allRooms = [...rooms, ...dbRooms];
  
  // Get windows for each room
  const getWindowsForRoom = (roomId: string) => {
    return dbSurfaces.filter(surface => surface.room_id === roomId);
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim() || !project) return;

    try {
      const newRoom = await createRoomMutation.mutateAsync({
        name: newRoomName,
        project_id: project.id,
        room_type: "general"
      });

      onRoomsUpdate([...rooms, newRoom]);
      setNewRoomName("");
      setShowNewRoomForm(false);
      
      toast({
        title: "Success",
        description: "Room added successfully"
      });
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const handleAddWindow = async (roomId: string) => {
    if (!newWindowName.trim() || !project) return;

    try {
      const newWindow = await createSurfaceMutation.mutateAsync({
        name: newWindowName,
        room_id: roomId,
        project_id: project.id,
        surface_type: "window"
      });

      setNewWindowName("");
      setShowNewWindowForm(null);
      
      toast({
        title: "Success",
        description: "Window added successfully"
      });
    } catch (error) {
      console.error("Failed to create window:", error);
    }
  };

  const handleOpenTreatmentCalculator = (window: any) => {
    setSelectedWindow(window);
    setShowTreatmentPopup(true);
  };

  const handleTreatmentSave = (treatmentData: any) => {
    const newTreatment = {
      id: Date.now().toString(),
      windowId: selectedWindow.id,
      roomId: selectedWindow.room_id,
      ...treatmentData
    };
    
    onTreatmentsUpdate([...treatments, newTreatment]);
    setShowTreatmentPopup(false);
    setSelectedWindow(null);
    
    toast({
      title: "Success",
      description: "Treatment configuration saved"
    });
  };

  const getRoomTreatments = (roomId: string) => {
    return treatments.filter(t => t.roomId === roomId);
  };

  const getTreatmentTotal = (roomId: string) => {
    const roomTreatments = getRoomTreatments(roomId);
    return roomTreatments.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
  };

  if (!project) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Please complete project setup first</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">{project.name}</h3>
                <p className="text-sm text-blue-600">
                  Job #{project.job_number} • {allRooms.length} rooms • {treatments.length} treatments
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">Total Value</p>
              <p className="font-semibold text-blue-800">
                ${treatments.reduce((sum, t) => sum + (t.totalPrice || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Room Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rooms & Windows</h2>
        <Button
          onClick={() => setShowNewRoomForm(true)}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-accent"
        >
          <Plus className="h-4 w-4" />
          Add Room
        </Button>
      </div>

      {/* New Room Form */}
      {showNewRoomForm && (
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name (e.g., Living Room, Bedroom)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                onKeyPress={(e) => e.key === 'Enter' && handleAddRoom()}
                autoFocus
              />
              <Button
                onClick={handleAddRoom}
                disabled={!newRoomName.trim() || createRoomMutation.isPending}
                size="sm"
              >
                {createRoomMutation.isPending ? "Adding..." : "Add"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewRoomForm(false);
                  setNewRoomName("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rooms Grid */}
      {allRooms.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No rooms added yet</p>
            <Button
              onClick={() => setShowNewRoomForm(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allRooms.map((room) => {
            const roomWindows = getWindowsForRoom(room.id);
            const roomTotal = getTreatmentTotal(room.id);
            
            return (
              <Card key={room.id} className="border-2 hover:border-brand-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <Badge variant="secondary">
                      {roomWindows.length} windows
                    </Badge>
                  </div>
                  {roomTotal > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      ${roomTotal.toLocaleString()}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Windows List */}
                  {roomWindows.map((window) => {
                    const windowTreatments = treatments.filter(t => t.windowId === window.id);
                    
                    return (
                      <div
                        key={window.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{window.name}</p>
                          {windowTreatments.length > 0 && (
                            <p className="text-xs text-green-600">
                              {windowTreatments.length} treatment(s) configured
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenTreatmentCalculator(window)}
                          className="h-8 w-8 p-0"
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}

                  {/* New Window Form */}
                  {showNewWindowForm === room.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newWindowName}
                        onChange={(e) => setNewWindowName(e.target.value)}
                        placeholder="Window name"
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddWindow(room.id)}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddWindow(room.id)}
                        disabled={!newWindowName.trim()}
                        className="h-6 px-2 text-xs"
                      >
                        Add
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowNewWindowForm(null);
                          setNewWindowName("");
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewWindowForm(room.id)}
                      className="w-full flex items-center gap-2 h-8 text-xs"
                    >
                      <Plus className="h-3 w-3" />
                      Add Window
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Treatment Calculator Popup */}
      <TreatmentCalculatorPopup
        isOpen={showTreatmentPopup}
        onClose={() => {
          setShowTreatmentPopup(false);
          setSelectedWindow(null);
        }}
        window={selectedWindow}
        onSave={handleTreatmentSave}
      />

      {/* Summary */}
      {treatments.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Project Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-600 font-medium">Total Rooms</p>
                <p className="text-xl font-semibold text-green-800">{allRooms.length}</p>
              </div>
              <div>
                <p className="text-green-600 font-medium">Total Treatments</p>
                <p className="text-xl font-semibold text-green-800">{treatments.length}</p>
              </div>
              <div>
                <p className="text-green-600 font-medium">Estimated Total</p>
                <p className="text-xl font-semibold text-green-800">
                  ${treatments.reduce((sum, t) => sum + (t.totalPrice || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};