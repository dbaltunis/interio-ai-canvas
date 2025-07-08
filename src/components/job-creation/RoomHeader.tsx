
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RoomActionsMenu } from "./RoomActionsMenu";

interface RoomHeaderProps {
  room: any;
  roomTotal: number;
  editingRoomId: string | null;
  editingRoomName: string;
  setEditingRoomName: (name: string) => void;
  onStartEditing: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onRenameRoom: (roomId: string, newName: string) => void;
  onCopyRoom: (room: any) => void;
  onDeleteRoom: any;
  onChangeRoomType: (roomId: string, roomType: string) => void;
}

export const RoomHeader = ({
  room,
  roomTotal,
  editingRoomId,
  editingRoomName,
  setEditingRoomName,
  onStartEditing,
  onKeyPress,
  onRenameRoom,
  onCopyRoom,
  onDeleteRoom,
  onChangeRoomType
}: RoomHeaderProps) => {
  return (
    <CardHeader className="pb-4 bg-brand-primary/5 border-b border-brand-secondary/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {editingRoomId === room.id ? (
            <Input
              value={editingRoomName}
              onChange={(e) => setEditingRoomName(e.target.value)}
              onKeyDown={onKeyPress}
              onBlur={() => onRenameRoom(room.id, editingRoomName)}
              className="text-xl font-semibold bg-brand-light border-brand-secondary focus:border-brand-primary"
              autoFocus
            />
          ) : (
            <CardTitle className="text-xl text-brand-primary">{room.name}</CardTitle>
          )}
          <p className="text-2xl font-bold text-brand-accent mt-1">${roomTotal.toFixed(2)}</p>
        </div>
        <RoomActionsMenu
          room={room}
          onEditName={onStartEditing}
          onCopyRoom={() => onCopyRoom(room)}
          onDeleteRoom={() => {
            if (confirm("Delete this room and all its contents?")) {
              onDeleteRoom.mutate(room.id);
            }
          }}
          onChangeRoomType={(type) => onChangeRoomType(room.id, type)}
        />
      </div>
    </CardHeader>
  );
};
