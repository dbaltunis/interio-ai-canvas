
import { useState } from "react";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";
import { useCreateRoom } from "@/hooks/useRooms";
import { useUpdateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { RoomsGrid } from "./RoomsGrid";
import { EmptyRoomsState } from "./EmptyRoomsState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";

interface ProjectJobsTabProps {
  project: any;
  onProjectUpdate?: (updatedProject: any) => void;
}

export const ProjectJobsTab = ({ project, onProjectUpdate }: ProjectJobsTabProps) => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(project?.name || "");
  
  const { data: rooms = [] } = useRooms(project?.id);
  const { data: surfaces = [] } = useSurfaces();
  const { data: treatments = [] } = useTreatments();
  const { units } = useMeasurementUnits();
  
  const createRoom = useCreateRoom();
  const updateProject = useUpdateProject();
  const { toast } = useToast();

  // Calculate total amount from treatments
  const totalAmount = treatments
    .filter(t => t.project_id === project?.id)
    .reduce((sum, treatment) => sum + (treatment.total_price || 0), 0);

  // Generate a proper sequential job number
  const jobNumber = project?.job_number || `${Date.now().toString().slice(-6)}`;

  const handleCreateRoom = async () => {
    if (!project?.id) return;
    
    setIsCreatingRoom(true);
    try {
      await createRoom.mutateAsync({
        name: `Room ${rooms.length + 1}`,
        project_id: project.id,
        description: "",
        room_type: "living_room"
      });
      
      toast({
        title: "Room Created",
        description: "New room has been added to your project"
      });
    } catch (error) {
      console.error("Failed to create room:", error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleSaveName = async () => {
    if (!project?.id || !editedName.trim()) return;
    
    try {
      const updatedProject = await updateProject.mutateAsync({
        id: project.id,
        name: editedName.trim()
      });
      
      // Update the project name locally and notify parent
      project.name = editedName.trim();
      onProjectUpdate?.(updatedProject);
      
      setIsEditingName(false);
      toast({
        title: "Project Updated",
        description: "Project name has been updated successfully"
      });
    } catch (error) {
      console.error("Failed to update project name:", error);
      toast({
        title: "Error",
        description: "Failed to update project name. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditedName(project?.name || "");
    setIsEditingName(false);
  };

  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return `${currencySymbols[units.currency] || units.currency}${amount.toFixed(2)}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white/20"
                    placeholder="Enter project name"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveName}
                    className="text-white hover:bg-white/10"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">{project?.name || "Untitled Project"}</h1>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingName(true)}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-white/80">
              <span className="text-sm">Job #{jobNumber}</span>
              <span className="text-2xl font-semibold">
                Total: {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
          
          <Button
            onClick={handleCreateRoom}
            disabled={isCreatingRoom}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-lg"
            size="lg"
          >
            {isCreatingRoom ? 'Adding Room...' : 'Add Room'}
          </Button>
        </div>
      </div>

      {/* Rooms Content */}
      <div className="min-h-[400px]">
        {rooms.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <EmptyRoomsState onCreateRoom={handleCreateRoom} />
          </div>
        ) : (
          <RoomsGrid
            rooms={rooms}
            projectId={project?.id}
            onUpdateRoom={() => {}}
            onDeleteRoom={() => {}}
            onCreateTreatment={() => {}}
            onCreateSurface={() => {}}
            onUpdateSurface={() => {}}
            onDeleteSurface={() => {}}
            onCopyRoom={() => {}}
            editingRoomId={null}
            setEditingRoomId={() => {}}
            editingRoomName=""
            setEditingRoomName={() => {}}
            onRenameRoom={() => {}}
            onCreateRoom={handleCreateRoom}
          />
        )}
      </div>
    </div>
  );
};
