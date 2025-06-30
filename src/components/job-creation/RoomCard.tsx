
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Copy, Trash2, Plus, Home, Square } from "lucide-react";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces, useCreateSurface } from "@/hooks/useSurfaces";
import { SurfaceCard } from "./SurfaceCard";
import { TreatmentPricingForm } from "./TreatmentPricingForm";
import { TreatmentCalculatorDialog } from "./TreatmentCalculatorDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface RoomCardProps {
  room: any;
  projectId: string;
  onUpdateRoom: any;
  onDeleteRoom: any;
  onCreateTreatment: (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => void;
  onCreateSurface: (roomId: string, surfaceType: string) => void;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
  onDeleteSurface: (surfaceId: string) => void;
  onCopyRoom: (room: any) => void;
  editingRoomId: string | null;
  setEditingRoomId: (id: string | null) => void;
  editingRoomName: string;
  setEditingRoomName: (name: string) => void;
  onRenameRoom: (roomId: string, newName: string) => void;
}

export const RoomCard = ({ 
  room, 
  projectId, 
  onUpdateRoom, 
  onDeleteRoom, 
  onCreateTreatment,
  onCreateSurface,
  onUpdateSurface,
  onDeleteSurface,
  onCopyRoom,
  editingRoomId,
  setEditingRoomId,
  editingRoomName,
  setEditingRoomName,
  onRenameRoom
}: RoomCardProps) => {
  const { data: allTreatments } = useTreatments(projectId);
  const { data: allSurfaces } = useSurfaces(projectId);
  const createSurface = useCreateSurface();
  const { toast } = useToast();
  
  const roomSurfaces = allSurfaces?.filter(s => s.room_id === room.id) || [];
  const roomTreatments = allTreatments?.filter(t => t.room_id === room.id) || [];
  const roomTotal = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
  
  const [pricingFormOpen, setPricingFormOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [selectedTreatmentType, setSelectedTreatmentType] = useState("");
  const [selectedSurfaceId, setSelectedSurfaceId] = useState("");
  const [selectedSurfaceType, setSelectedSurfaceType] = useState("");

  const startEditing = () => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRenameRoom(room.id, editingRoomName);
    } else if (e.key === 'Escape') {
      setEditingRoomId(null);
      setEditingRoomName("");
    }
  };

  const handleCreateSurface = async (surfaceType: 'window' | 'wall') => {
    if (!room.id || !projectId) {
      toast({
        title: "Error",
        description: "Missing room or project information",
        variant: "destructive",
      });
      return;
    }

    try {
      const surfaceCount = roomSurfaces.filter(s => s.surface_type === surfaceType).length;
      const surfaceName = surfaceType === 'window' 
        ? `Window ${surfaceCount + 1}`
        : `Wall ${surfaceCount + 1}`;

      await createSurface.mutateAsync({
        room_id: room.id,
        project_id: projectId,
        name: surfaceName,
        surface_type: surfaceType,
        width: surfaceType === 'window' ? 36 : 120,
        height: surfaceType === 'window' ? 60 : 96
      });

      toast({
        title: "Success",
        description: `${surfaceType === 'window' ? 'Window' : 'Wall'} added successfully`,
      });
    } catch (error) {
      console.error("Error creating surface:", error);
      toast({
        title: "Error",
        description: `Failed to add ${surfaceType}`,
        variant: "destructive",
      });
    }
  };

  const handleAddTreatment = (surfaceId: string, treatmentType: string) => {
    const surface = roomSurfaces.find(s => s.id === surfaceId);
    setSelectedSurfaceId(surfaceId);
    setSelectedTreatmentType(treatmentType);
    setSelectedSurfaceType(surface?.surface_type || 'window');
    
    if (treatmentType === "Curtains") {
      setCalculatorOpen(true);
    } else {
      setPricingFormOpen(true);
    }
  };

  const handlePricingFormSave = (treatmentData: any) => {
    onCreateTreatment(room.id, selectedSurfaceId, selectedTreatmentType, treatmentData);
    setPricingFormOpen(false);
  };

  const handleCalculatorSave = (treatmentData: any) => {
    onCreateTreatment(room.id, selectedSurfaceId, selectedTreatmentType, treatmentData);
    setCalculatorOpen(false);
  };

  return (
    <>
      <Card className="bg-gray-100 min-h-[500px] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {editingRoomId === room.id ? (
                <Input
                  value={editingRoomName}
                  onChange={(e) => setEditingRoomName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={() => onRenameRoom(room.id, editingRoomName)}
                  className="text-xl font-semibold bg-white"
                  autoFocus
                />
              ) : (
                <CardTitle className="text-xl">{room.name}</CardTitle>
              )}
              <p className="text-2xl font-bold text-gray-900 mt-1">${roomTotal.toFixed(2)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={startEditing}
                title="Rename room"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCopyRoom(room)}
                title="Copy room"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm("Delete this room and all its contents?")) {
                    onDeleteRoom.mutate(room.id);
                  }
                }}
                title="Delete room"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            {/* Add Surface Buttons */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCreateSurface('window')}
                disabled={createSurface.isPending}
                className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
              >
                <Home className="h-4 w-4" />
                <span>{createSurface.isPending ? 'Adding...' : 'Add Window'}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCreateSurface('wall')}
                disabled={createSurface.isPending}
                className="flex items-center space-x-2 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
              >
                <Square className="h-4 w-4" />
                <span>{createSurface.isPending ? 'Adding...' : 'Add Wall'}</span>
              </Button>
            </div>

            {/* Surfaces */}
            {roomSurfaces.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="mb-2">No surfaces added yet</p>
                  <p className="text-sm">Add windows or walls to get started</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {roomSurfaces.map((surface) => {
                  const surfaceTreatments = roomTreatments.filter(t => t.window_id === surface.id);
                  return (
                    <SurfaceCard
                      key={surface.id}
                      surface={surface}
                      treatments={surfaceTreatments}
                      onAddTreatment={handleAddTreatment}
                      onDeleteSurface={onDeleteSurface}
                      onUpdateSurface={onUpdateSurface}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TreatmentPricingForm
        isOpen={pricingFormOpen}
        onClose={() => setPricingFormOpen(false)}
        onSave={handlePricingFormSave}
        treatmentType={selectedTreatmentType}
        surfaceType={selectedSurfaceType}
      />

      <TreatmentCalculatorDialog
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        onSave={handleCalculatorSave}
        treatmentType={selectedTreatmentType}
      />
    </>
  );
};
