
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, Square, Settings2 } from "lucide-react";
import { TreatmentCalculatorDialog } from "./TreatmentCalculatorDialog";
import { WindowSelectionDialog } from "./WindowSelectionDialog";
import { useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useCreateSurface, useUpdateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { useCreateTreatment } from "@/hooks/useTreatments";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currency";
import { useCurrency } from "@/hooks/useCurrency";

interface StreamlinedJobsInterfaceProps {
  project: any;
  rooms: any[];
  surfaces: any[];
  treatments: any[];
  onCreateTreatment?: (roomId: string, surfaceId: string, treatmentType: string) => void;
}

export const StreamlinedJobsInterface = ({
  project,
  rooms,
  surfaces,
  treatments,
  onCreateTreatment
}: StreamlinedJobsInterfaceProps) => {
  const { toast } = useToast();
  const createRoom = useCreateRoom();
  const currency = useCurrency();
  const createSurface = useCreateSurface();
  const createTreatment = useCreateTreatment();
  
  const [selectedSurface, setSelectedSurface] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false);
  const [windowSelectionOpen, setWindowSelectionOpen] = useState(false);
  const [treatmentType, setTreatmentType] = useState('curtains');

  // Get surfaces for a specific room
  const getRoomSurfaces = (roomId: string) => {
    return surfaces.filter(surface => surface.room_id === roomId);
  };

  // Get treatments for a specific surface
  const getSurfaceTreatments = (surfaceId: string) => {
    return treatments.filter(treatment => treatment.window_id === surfaceId);
  };

  // Add a new room instantly
  const handleAddRoom = async () => {
    if (!project?.id) return;
    
    try {
      const roomNumber = rooms.length + 1;
      await createRoom.mutateAsync({
        name: `Room ${roomNumber}`,
        room_type: "living_room",
        project_id: project.id
      });
      
      toast({
        title: "Success",
        description: "Room added successfully",
      });
    } catch (error) {
      console.error("Failed to create room:", error);
      toast({
        title: "Error",
        description: "Failed to add room. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add a window to a room instantly
  const handleAddWindow = async (roomId: string) => {
    if (!project?.id) return;
    
    try {
      const roomSurfaces = getRoomSurfaces(roomId);
      const windowNumber = roomSurfaces.length + 1;
      
      await createSurface.mutateAsync({
        name: `Window ${windowNumber}`,
        surface_type: 'window',
        room_id: roomId,
        project_id: project.id,
        width: 60,
        height: 48
      });
      
      toast({
        title: "Success",
        description: "Window added successfully",
      });
    } catch (error) {
      console.error("Failed to create window:", error);
      toast({
        title: "Error",
        description: "Failed to add window. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Open treatment selection with window choice
  const handleAddTreatment = (roomId: string) => {
    setSelectedRoom(roomId);
    setWindowSelectionOpen(true);
  };

  // Handle window selection for treatment
  const handleWindowSelection = (windowId: string, windowName: string) => {
    console.log("Window selected:", windowId, windowName);
    setSelectedSurface(windowId);
    setWindowSelectionOpen(false);
    setTreatmentDialogOpen(true);
  };

  // Handle creating new window for treatment
  const handleCreateNewWindow = async (windowName: string, windowData: any) => {
    if (!project?.id || !selectedRoom) return;
    
    try {
      console.log("Creating new window:", windowName, windowData);
      const newSurface = await createSurface.mutateAsync({
        name: windowName,
        surface_type: 'window',
        room_id: selectedRoom,
        project_id: project.id,
        width: windowData.width,
        height: windowData.height
      });
      
      console.log("New window created:", newSurface);
      setSelectedSurface(newSurface.id);
      setWindowSelectionOpen(false);
      setTreatmentDialogOpen(true);
    } catch (error) {
      console.error("Failed to create window:", error);
      toast({
        title: "Error",
        description: "Failed to create window. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle treatment save from calculator
  const handleTreatmentSave = async (treatmentData: any) => {
    if (!selectedSurface || !selectedRoom || !project?.id) {
      console.error("Missing required data for treatment creation");
      return;
    }

    try {
      console.log("Creating treatment with data:", treatmentData);
      
      await createTreatment.mutateAsync({
        project_id: project.id,
        room_id: selectedRoom,
        window_id: selectedSurface,
        treatment_type: treatmentData.treatmentType || 'curtains',
        product_name: treatmentData.productName || '',
        material_cost: treatmentData.materialCost || 0,
        labor_cost: treatmentData.laborCost || 0,
        total_price: treatmentData.totalPrice || 0,
        quantity: treatmentData.quantity || 1,
        measurements: treatmentData.measurements || {},
        fabric_details: treatmentData.fabricDetails || {},
        treatment_details: treatmentData.treatmentDetails || {},
        calculation_details: treatmentData.calculationDetails || {}
      });

      toast({
        title: "Success",
        description: "Treatment created successfully",
      });

      setTreatmentDialogOpen(false);
      setSelectedSurface(null);
      setSelectedRoom(null);
    } catch (error) {
      console.error("Failed to create treatment:", error);
      toast({
        title: "Error",
        description: "Failed to create treatment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Project Management</h3>
        <p className="text-muted-foreground">Click + buttons to add rooms, windows, and treatments instantly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Render existing rooms */}
        {rooms.map((room) => {
          const roomSurfaces = getRoomSurfaces(room.id);
          
          return (
            <Card key={room.id} className="relative">
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
                    disabled={createSurface.isPending}
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
                    
                    {/* Render windows/surfaces */}
                    {roomSurfaces.map((surface) => {
                      const surfaceTreatments = getSurfaceTreatments(surface.id);
                      return (
                        <div key={surface.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <Square className="h-3 w-3" />
                              <span>{surface.name}</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddTreatment(room.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* Show treatments for this surface */}
                          {surfaceTreatments.length > 0 && (
                            <div className="space-y-1 ml-5">
                              {surfaceTreatments.map((treatment) => (
                                <div key={treatment.id} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <Settings2 className="h-3 w-3" />
                                    <span>{treatment.treatment_type}</span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {formatCurrency(treatment.total_price || 0, currency)}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {surfaceTreatments.length === 0 && (
                            <div className="text-xs text-muted-foreground italic ml-5">
                              No treatments added yet
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {roomSurfaces.length === 0 && (
                      <div className="text-xs text-muted-foreground italic">
                        No windows added yet
                      </div>
                    )}
                  </div>

                  {/* Add Treatment Button for Room */}
                  <Button
                    onClick={() => handleAddTreatment(room.id)}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Treatment
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add new room card */}
        <Card className="relative border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center h-48 p-6">
            <Button
              onClick={handleAddRoom}
              disabled={createRoom.isPending}
              className="h-12 w-12 rounded-full mb-3"
            >
              <Plus className="h-6 w-6" />
            </Button>
            <h3 className="font-medium text-center">Add New Room</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">
              {createRoom.isPending ? 'Adding room...' : 'Click to add a new room'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Window Selection Dialog */}
      <WindowSelectionDialog
        isOpen={windowSelectionOpen}
        onClose={() => {
          setWindowSelectionOpen(false);
          setSelectedRoom(null);
        }}
        onSelectWindow={handleWindowSelection}
        onCreateNewWindow={handleCreateNewWindow}
        existingWindows={selectedRoom ? getRoomSurfaces(selectedRoom) : []}
        roomName={selectedRoom ? rooms.find(r => r.id === selectedRoom)?.name || '' : ''}
      />

      {/* Treatment Calculator Dialog */}
      <TreatmentCalculatorDialog
        isOpen={treatmentDialogOpen}
        onClose={() => {
          setTreatmentDialogOpen(false);
          setSelectedSurface(null);
          setSelectedRoom(null);
        }}
        onSave={handleTreatmentSave}
        treatmentType={treatmentType}
      />
    </div>
  );
};
