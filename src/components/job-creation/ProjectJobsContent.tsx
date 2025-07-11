
import { RoomsGrid } from "./RoomsGrid";
import { EmptyRoomsState } from "./EmptyRoomsState";
import { ProjectBlueprint } from "./ProjectBlueprint";
import { QuickTreatmentCreator } from "./QuickTreatmentCreator";
import { useJobHandlers } from "./JobHandlers";

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
    deleteRoom
  } = useJobHandlers(project);

  // Calculate project totals
  const projectTotal = allTreatments?.reduce((sum, treatment) => {
    return sum + (treatment.total_price || 0);
  }, 0) || 0;

  return (
    <div className="min-h-[400px]">
      {/* Always show blueprint */}
      <ProjectBlueprint 
        rooms={rooms}
        surfaces={allSurfaces || []}
        treatments={allTreatments || []}
        projectTotal={projectTotal}
      />

      {/* Quick Treatment Creator */}
      <QuickTreatmentCreator 
        onCreateTreatment={handleQuickCreateTreatment}
      />

      {rooms.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <EmptyRoomsState onCreateRoom={onCreateRoom} isCreatingRoom={isCreatingRoom} />
        </div>
      ) : (
        <RoomsGrid
          rooms={rooms}
          projectId={project?.id}
          onUpdateRoom={updateRoom}
          onDeleteRoom={deleteRoom}
          onCreateTreatment={handleCreateTreatment}
          onCreateSurface={handleCreateSurface}
          onUpdateSurface={handleUpdateSurface}
          onDeleteSurface={handleDeleteSurface}
          onCopyRoom={handleCopyRoom}
          editingRoomId={editingRoomId}
          setEditingRoomId={setEditingRoomId}
          editingRoomName={editingRoomName}
          setEditingRoomName={setEditingRoomName}
          onRenameRoom={handleRenameRoom}
          onCreateRoom={onCreateRoom}
          isCreatingRoom={isCreatingRoom}
          onChangeRoomType={handleChangeRoomType}
        />
      )}
    </div>
  );
};
