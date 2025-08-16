
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RoomActionsMenu } from "./RoomActionsMenu";
import { formatCurrency } from "@/utils/currency";
import { useCompactMode } from "@/hooks/useCompactMode";


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
  const { compact } = useCompactMode();
  return (
    <CardHeader className={`relative bg-muted/30 border-b border-border p-[14px] ${compact ? 'py-3 px-4' : 'py-4 px-6'}`}>
      {/* Simplified background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
      </div>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          {editingRoomId === room.id ? (
            <Input
              value={editingRoomName}
              onChange={(e) => setEditingRoomName(e.target.value)}
              onKeyDown={onKeyPress}
              onBlur={() => onRenameRoom(room.id, editingRoomName)}
              className="text-lg font-semibold bg-background border border-input focus:border-primary"
              autoFocus
            />
          ) : (
            <CardTitle className="text-lg font-semibold text-foreground">{room.name}</CardTitle>
          )}
          <p className="text-xl font-bold text-primary mt-1">{formatCurrency(roomTotal)}</p>
        </div>
        <div className="flex items-center gap-2">
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
      </div>
    </CardHeader>
  );
};
