
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RoomActionsMenu } from "./RoomActionsMenu";
import { formatCurrency } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { Minimize2, Maximize2 } from "lucide-react";
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
  const { compact, toggleCompact } = useCompactMode();
  return (
    <CardHeader className={`relative overflow-hidden rounded-b-3xl bg-gradient-to-b from-background/40 via-background/20 to-background/10 border-b border-brand-secondary/30 backdrop-blur-md ${compact ? 'pb-2' : 'pb-4'}`}>
      {/* Water-drop blobs & gloss like Team Hub */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-20 w-72 h-72 bg-brand-primary/20 rounded-full blur-3xl animate-enter" />
        <div className="absolute -bottom-24 -right-10 w-80 h-80 bg-brand-secondary/20 rounded-full blur-3xl animate-enter" />
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-brand-light/25 to-transparent" />
        <div className="absolute inset-0 ring-1 ring-inset ring-brand-secondary/20 rounded-b-3xl" />
      </div>
      <div className="flex items-center justify-between relative animate-fade-in">
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
          <p className="text-2xl font-bold text-brand-accent mt-1">{formatCurrency(roomTotal)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCompact}
            aria-label="Toggle compact mode"
            className="shrink-0"
            title={compact ? "Switch to comfortable spacing" : "Switch to compact spacing"}
          >
            {compact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
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
