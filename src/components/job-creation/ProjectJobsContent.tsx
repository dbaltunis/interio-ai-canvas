
import { RoomsGrid } from "./RoomsGrid";
import { EmptyRoomsState } from "./EmptyRoomsState";
import { ProjectBlueprint } from "./ProjectBlueprint";
import { ProjectOverview } from "./ProjectOverview";
import { QuickTreatmentCreator } from "./QuickTreatmentCreator";
import { StreamlinedJobsInterface } from "./StreamlinedJobsInterface";
import { useJobHandlers } from "./JobHandlers";
import { useToast } from "@/hooks/use-toast";

interface ProjectJobsContentProps {
  rooms: any[];
  project: any;
  onCreateRoom: () => void;
  isCreatingRoom: boolean;
  editingRoomId: string | null;
  setEditingRoomId: (id: string | null) => void;
  editingRoomName: string;
  setEditingRoomName: (name: string) => void;
}

export const ProjectJobsContent = ({ 
  rooms, 
  project, 
  onCreateRoom, 
  isCreatingRoom,
  editingRoomId,
  setEditingRoomId,
  editingRoomName,
  setEditingRoomName
}: ProjectJobsContentProps) => {
  const { toast } = useToast();

  console.log("=== PROJECT JOBS CONTENT RENDER ===");
  console.log("Project:", project);
  console.log("Rooms:", rooms);

  const {
    allSurfaces,
    allTreatments,
    handleCreateSurface,
    handleUpdateSurface,
    handleDeleteSurface,
    handleRenameRoom,
    handleCopyRoom,
    handlePasteRoom,
    handleCreateTreatment,
    handleChangeRoomType,
    handleQuickCreateTreatment,
    updateRoom,
    deleteRoom,
    createRoom
  } = useJobHandlers(project);

  console.log("Job handlers data:", {
    surfacesCount: allSurfaces?.length || 0,
    treatmentsCount: allTreatments?.length || 0
  });

  // Calculate project totals with safe error handling
  const projectTotalNumber = allTreatments?.reduce((sum, treatment) => {
    try {
      const price = parseFloat(treatment?.total_price?.toString() || '0') || 0;
      return sum + price;
    } catch (error) {
      console.error("Error calculating treatment price:", error, treatment);
      return sum;
    }
  }, 0) || 0;

  console.log("Project total calculated:", projectTotalNumber);

  // Wrapper function to handle the return type mismatch
  const handleQuickCreate = async (formData: any): Promise<void> => {
    try {
      console.log("Quick create treatment:", formData);
      await handleQuickCreateTreatment(formData);
      toast({
        title: "Success",
        description: "Treatment created successfully",
      });
    } catch (error) {
      console.error("Quick create failed:", error);
      toast({
        title: "Error",
        description: "Failed to create treatment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[400px]">
      {/* Always show blueprint */}
      <ProjectBlueprint 
        rooms={rooms}
        surfaces={allSurfaces || []}
        treatments={allTreatments || []}
        projectTotal={projectTotalNumber.toString()}
      />

      {/* Use Streamlined Interface */}
      <div className="mb-6">
        <StreamlinedJobsInterface
          project={project}
          rooms={rooms || []}
          surfaces={allSurfaces || []}
          treatments={allTreatments || []}
          onCreateTreatment={handleCreateTreatment}
        />
      </div>

      {/* Quick Treatment Creator */}
      <QuickTreatmentCreator 
        onCreateTreatment={handleQuickCreate}
      />
    </div>
  );
};
