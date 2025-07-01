
import { RoomsGrid } from "./RoomsGrid";
import { EmptyRoomsState } from "./EmptyRoomsState";

interface ProjectJobsContentProps {
  rooms: any[];
  project: any;
  onCreateRoom: () => void;
}

export const ProjectJobsContent = ({ rooms, project, onCreateRoom }: ProjectJobsContentProps) => {
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
          onCreateRoom={onCreateRoom}
        />
      )}
    </div>
  );
};
