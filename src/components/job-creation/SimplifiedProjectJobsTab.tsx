import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Home, Copy, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useCreateRoom, useRooms } from "@/hooks/useRooms";
import { useTreatments } from "@/hooks/useTreatments";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SimplifiedRoomCard } from "./SimplifiedRoomCard";
import { EnhancedTreatmentCalculator } from "./calculator/EnhancedTreatmentCalculator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface SimplifiedProjectJobsTabProps {
  project: any;
  onProjectUpdate?: (updatedProject: any) => void;
}

export const SimplifiedProjectJobsTab = ({ project, onProjectUpdate }: SimplifiedProjectJobsTabProps) => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [currentTreatmentData, setCurrentTreatmentData] = useState<{
    roomId: string;
    treatmentType: string;
    windowName?: string;
  } | null>(null);

  const createRoom = useCreateRoom();
  const projectId = project?.project_id || project?.id;
  const { data: rooms, isLoading: roomsLoading } = useRooms(projectId);
  const { data: treatments, isLoading: treatmentsLoading } = useTreatments(projectId);
  const { toast } = useToast();

  // Don't render if no valid project
  if (!project || !projectId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  // Check if project has a temporary ID
  const isTemporaryProject = !projectId || projectId.toString().startsWith('temp-') || projectId.toString().length < 10;
  if (isTemporaryProject) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Saving project...</p>
          <p className="text-sm text-muted-foreground">Please wait while your project is being created.</p>
        </div>
      </div>
    );
  }

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    try {
      // Verify project exists
      const { data: projectExists } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .single();

      if (!projectExists) {
        throw new Error(`Project ${projectId} does not exist in database`);
      }

      const roomCount = (rooms?.length || 0) + 1;
      const roomData = {
        name: `Room ${roomCount}`,
        project_id: projectId,
        room_type: 'living_room'
      };
      
      await createRoom.mutateAsync(roomData);
      
      toast({
        title: "Room Added",
        description: `Room ${roomCount} created successfully.`,
      });
    } catch (error) {
      console.error("Room creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleCopyRoom = async (room: any) => {
    try {
      const roomCount = (rooms?.length || 0) + 1;
      const newRoomData = {
        name: `${room.name} (Copy)`,
        project_id: projectId,
        room_type: room.room_type || 'living_room',
        description: room.description,
        notes: room.notes
      };
      
      const newRoom = await createRoom.mutateAsync(newRoomData);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Copy treatments from original room
      const roomTreatments = treatments?.filter(t => t.room_id === room.id) || [];
      
      for (const treatment of roomTreatments) {
        // Create a new surface for each treatment (auto-generated window)
        const surfaceData = {
          name: treatment.window_id ? `Window #${Date.now()}` : "Window #1",
          project_id: projectId,
          room_id: newRoom.id,
          surface_type: 'window',
          user_id: user.id,
          width: 60,
          height: 48
        };

        const { data: newSurface } = await supabase
          .from('surfaces')
          .insert(surfaceData)
          .select()
          .single();

        if (newSurface) {
          // Copy treatment
          const treatmentData = {
            project_id: projectId,
            room_id: newRoom.id,
            window_id: newSurface.id,
            treatment_type: treatment.treatment_type,
            user_id: user.id,
            product_name: treatment.product_name,
            fabric_type: treatment.fabric_type,
            color: treatment.color,
            pattern: treatment.pattern,
            hardware: treatment.hardware,
            mounting_type: treatment.mounting_type,
            measurements: treatment.measurements,
            material_cost: treatment.material_cost,
            labor_cost: treatment.labor_cost,
            total_price: treatment.total_price,
            unit_price: treatment.unit_price,
            quantity: treatment.quantity,
            notes: treatment.notes,
            treatment_details: treatment.treatment_details,
            calculation_details: treatment.calculation_details,
            fabric_details: treatment.fabric_details
          };

          await supabase.from('treatments').insert(treatmentData);
        }
      }
      
      toast({
        title: "Room Copied",
        description: `${room.name} has been copied with all treatments.`,
      });
    } catch (error) {
      console.error("Failed to copy room:", error);
      toast({
        title: "Error",
        description: "Failed to copy room",
        variant: "destructive",
      });
    }
  };

  const handleAddTreatment = (roomId: string, treatmentType: string) => {
    setCurrentTreatmentData({ roomId, treatmentType });
    setCalculatorOpen(true);
  };

  const handleTreatmentSave = async (treatmentData: any) => {
    if (!currentTreatmentData) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create auto-generated window/surface
      const windowCount = treatments?.filter(t => t.room_id === currentTreatmentData.roomId).length + 1;
      const surfaceData = {
        name: `Window #${windowCount}`,
        project_id: projectId,
        room_id: currentTreatmentData.roomId,
        surface_type: 'window',
        user_id: user.id,
        width: treatmentData.measurements?.width || 60,
        height: treatmentData.measurements?.height || 48
      };

      const { data: newSurface } = await supabase
        .from('surfaces')
        .insert(surfaceData)
        .select()
        .single();

      if (newSurface) {
        // Create treatment
        const finalTreatmentData = {
          project_id: projectId,
          room_id: currentTreatmentData.roomId,
          window_id: newSurface.id,
          treatment_type: currentTreatmentData.treatmentType,
          user_id: user.id,
          product_name: treatmentData.treatment_name,
          quantity: treatmentData.quantity,
          unit_price: treatmentData.pricing?.unit_price || 0,
          total_price: treatmentData.pricing?.total || 0,
          labor_cost: treatmentData.pricing?.labor_cost || 0,
          material_cost: treatmentData.pricing?.fabric_cost || 0,
          measurements: treatmentData.measurements,
          fabric_details: treatmentData.fabric_details,
          calculation_details: treatmentData.calculation_details,
          treatment_details: {
            template_id: treatmentData.template_id,
            options: treatmentData.options,
            hem_configuration: treatmentData.hem_configuration,
            calculation_breakdown: treatmentData.calculation_breakdown
          },
          // Map fabric details to individual columns for backward compatibility
          fabric_type: treatmentData.fabric_details?.name,
          color: treatmentData.fabric_details?.color,
          pattern: treatmentData.fabric_details?.pattern,
          hardware: treatmentData.options?.hardware,
          notes: `${treatmentData.treatment_name} - Enhanced Calculator`,
          status: 'planned'
        };

        console.log('Saving treatment with fabric details:', finalTreatmentData);
        await supabase.from('treatments').insert(finalTreatmentData);
        
        toast({
          title: "Treatment Added",
          description: `${currentTreatmentData.treatmentType} added to ${newSurface.name}`,
        });
      }
    } catch (error) {
      console.error("Failed to save treatment:", error);
      toast({
        title: "Error",
        description: "Failed to save treatment",
        variant: "destructive",
      });
    }

    setCalculatorOpen(false);
    setCurrentTreatmentData(null);
  };

  const projectTotal = treatments?.reduce((sum, t) => sum + (t.total_price || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Job Configuration</h2>
          <p className="text-muted-foreground">Add rooms and configure window treatments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Project Total</p>
            <p className="text-xl font-semibold text-primary">${projectTotal.toFixed(2)}</p>
          </div>
          <Button onClick={handleCreateRoom} disabled={isCreatingRoom}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreatingRoom ? "Adding..." : "Add Room"}
          </Button>
        </div>
      </div>

      {/* Rooms Grid */}
      {roomsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !rooms || rooms.length === 0 ? (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Home className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No rooms yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Get started by adding your first room to the project
            </p>
            <Button onClick={handleCreateRoom} disabled={isCreatingRoom}>
              <Plus className="h-4 w-4 mr-2" />
              {isCreatingRoom ? "Adding..." : "Add First Room"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <SimplifiedRoomCard
              key={room.id}
              room={room}
              treatments={treatments?.filter(t => t.room_id === room.id) || []}
              onAddTreatment={handleAddTreatment}
              onCopyRoom={handleCopyRoom}
              projectId={projectId}
            />
          ))}
        </div>
      )}

      {/* Advanced Treatment Calculator */}
      <EnhancedTreatmentCalculator
        isOpen={calculatorOpen}
        onClose={() => {
          setCalculatorOpen(false);
          setCurrentTreatmentData(null);
        }}
        onSave={handleTreatmentSave}
        treatmentType={currentTreatmentData?.treatmentType || ''}
      />
    </div>
  );
};