
import { RoomsGrid } from "./RoomsGrid";
import { EmptyRoomsState } from "./EmptyRoomsState";
import { useJobHandlers } from "./JobHandlers";
import { WorkflowEnhancements } from "../workflow/WorkflowEnhancements";

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
    updateRoom,
    deleteRoom
  } = useJobHandlers(project);

  return (
    <div className="min-h-[400px]">
      <WorkflowEnhancements
        projectId={project?.id}
        rooms={rooms}
        surfaces={allSurfaces || []}
        treatments={allTreatments || []}
        onCreateRoom={onCreateRoom}
        onCreateSurface={(roomId) => handleCreateSurface(roomId, 'window')}
        onCreateTreatment={(surfaceId) => {
          const surface = allSurfaces?.find(s => s.id === surfaceId);
          if (surface) {
            // Navigate to surface for treatment selection
            console.log("Navigate to treatment selection for surface:", surfaceId);
          }
        }}
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
