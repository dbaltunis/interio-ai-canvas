
import { RoomsGrid } from "./RoomsGrid";
import { EmptyRoomsState } from "./EmptyRoomsState";
import { useJobHandlers } from "./JobHandlers";

interface ProjectJobsContentProps {
  rooms: any[];
  project: any;
  onCreateRoom: () => void;
}

export const ProjectJobsContent = ({ rooms, project, onCreateRoom }: ProjectJobsContentProps) => {
  const {
    allSurfaces,
    allTreatments,
    handleCreateSurface,
    handleUpdateSurface,
    handleDeleteSurface,
    handleRenameRoom,
    handleCopyRoom,
    handlePasteRoom,
    handleCreateTreatment
  } = useJobHandlers(project);

  return (
    <div className="min-h-[400px]">
      {rooms.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <EmptyRoomsState onCreateRoom={onCreateRoom} />
        </div>
      ) : (
        <RoomsGrid
          rooms={rooms}
          projectId={project?.id}
          onUpdateRoom={() => {}}
          onDeleteRoom={() => {}}
          onCreateTreatment={handleCreateTreatment}
          onCreateSurface={handleCreateSurface}
          onUpdateSurface={handleUpdateSurface}
          onDeleteSurface={handleDeleteSurface}
          onCopyRoom={handleCopyRoom}
          editingRoomId={null}
          setEditingRoomId={() => {}}
          editingRoomName=""
          setEditingRoomName={() => {}}
          onRenameRoom={handleRenameRoom}
          onCreateRoom={onCreateRoom}
        />
      )}
    </div>
  );
};
