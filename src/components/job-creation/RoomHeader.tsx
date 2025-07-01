
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Copy, Trash2 } from "lucide-react";

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
  onDeleteRoom
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
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onStartEditing}
            title="Rename room"
            className="hover:bg-brand-secondary/20 text-brand-neutral hover:text-brand-primary"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onCopyRoom(room)}
            title="Copy room"
            className="hover:bg-brand-secondary/20 text-brand-neutral hover:text-brand-primary"
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
            className="hover:bg-red-50 text-brand-neutral hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};
