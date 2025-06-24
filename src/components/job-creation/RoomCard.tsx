
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Copy, Trash2 } from "lucide-react";
import { useTreatments } from "@/hooks/useTreatments";
import { TreatmentCard } from "./TreatmentCard";

interface RoomCardProps {
  room: any;
  projectId: string;
  onUpdateRoom: any;
  onDeleteRoom: any;
  onCreateTreatment: (roomId: string, treatmentType: string) => void;
  onCopyRoom: (room: any) => void;
  editingRoomId: string | null;
  setEditingRoomId: (id: string | null) => void;
  editingRoomName: string;
  setEditingRoomName: (name: string) => void;
  onRenameRoom: (roomId: string, newName: string) => void;
}

export const RoomCard = ({ 
  room, 
  projectId, 
  onUpdateRoom, 
  onDeleteRoom, 
  onCreateTreatment, 
  onCopyRoom,
  editingRoomId,
  setEditingRoomId,
  editingRoomName,
  setEditingRoomName,
  onRenameRoom
}: RoomCardProps) => {
  const { data: treatments } = useTreatments();
  const roomTreatments = treatments?.filter(t => t.room_id === room.id) || [];
  const roomTotal = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);

  const startEditing = () => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRenameRoom(room.id, editingRoomName);
    } else if (e.key === 'Escape') {
      setEditingRoomId(null);
      setEditingRoomName("");
    }
  };

  return (
    <Card className="bg-gray-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {editingRoomId === room.id ? (
              <Input
                value={editingRoomName}
                onChange={(e) => setEditingRoomName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={() => onRenameRoom(room.id, editingRoomName)}
                className="text-xl font-semibold bg-white"
                autoFocus
              />
            ) : (
              <CardTitle className="text-xl">{room.name}</CardTitle>
            )}
            <p className="text-2xl font-bold text-gray-900 mt-1">${roomTotal.toFixed(2)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={startEditing}
              title="Rename room"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCopyRoom(room)}
              title="Copy room"
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
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {roomTreatments.length === 0 ? (
          <div className="text-center py-8">
            <Select onValueChange={(value) => onCreateTreatment(room.id, value)}>
              <SelectTrigger className="w-48 mx-auto bg-white">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Curtains">Curtains</SelectItem>
                <SelectItem value="Blinds">Blinds</SelectItem>
                <SelectItem value="Shutters">Shutters</SelectItem>
                <SelectItem value="Valances">Valances</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-4">
            {roomTreatments.map((treatment) => (
              <TreatmentCard key={treatment.id} treatment={treatment} />
            ))}
            <div className="text-center">
              <Select onValueChange={(value) => onCreateTreatment(room.id, value)}>
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Curtains">Curtains</SelectItem>
                  <SelectItem value="Blinds">Blinds</SelectItem>
                  <SelectItem value="Shutters">Shutters</SelectItem>
                  <SelectItem value="Valances">Valances</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
