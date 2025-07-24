
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Edit2, Trash2, Plus, Copy, Check, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SurfaceList } from "./SurfaceList";
import { useRoomCardLogic } from "./RoomCardLogic";

interface RoomCardProps {
  room: any;
  projectId: string;
  onUpdateRoom: (roomId: string, updates: any) => void;
  onDeleteRoom: (roomId: string) => void;
  onCreateTreatment: (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => void;
  onCreateSurface: (roomId: string, surfaceType: string) => void;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
  onDeleteSurface: (surfaceId: string) => void;
  onCopyRoom: (room: any) => void;
  editingRoomId: string | null;
  setEditingRoomId: (id: string | null) => void;
  editingRoomName: string;
  setEditingRoomName: (name: string) => void;
  onRenameRoom: (roomId: string, newName: string) => void;
  onChangeRoomType: (roomId: string, roomType: string) => void;
}

const ROOM_TYPES = [
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "dining_room", label: "Dining Room" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "office", label: "Office" },
  { value: "other", label: "Other" }
];

export const RoomCard = ({
  room,
  projectId,
  onUpdateRoom,
  onDeleteRoom,
  onCreateTreatment,
  onCreateSurface,
  onUpdateSurface,
  onDeleteSurface,
  onCopyRoom,
  editingRoomId,
  setEditingRoomId,
  editingRoomName,
  setEditingRoomName,
  onRenameRoom,
  onChangeRoomType
}: RoomCardProps) => {
  const {
    roomSurfaces,
    roomTreatments,
    roomTotal
  } = useRoomCardLogic(room, projectId);

  const isEditing = editingRoomId === room.id;

  const handleStartEdit = (room: any) => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
  };

  const handleSaveEdit = (roomId: string, newName: string) => {
    onRenameRoom(roomId, newName);
    setEditingRoomId(null);
  };

  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setEditingRoomName("");
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  value={editingRoomName}
                  onChange={(e) => setEditingRoomName(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSaveEdit(room.id, editingRoomName)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <CardTitle className="text-lg">{room.name}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {ROOM_TYPES.find(type => type.value === room.room_type)?.label || room.room_type}
                </Badge>
              </>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">
                  ${roomTotal.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  {roomTreatments.length} treatments
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStartEdit(room)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCopyRoom(room)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Room
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDeleteRoom(room.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center justify-between pt-2">
            <Select 
              value={room.room_type} 
              onValueChange={(value) => onChangeRoomType(room.id, value)}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCreateSurface(room.id, 'window')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Window
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <SurfaceList
          surfaces={roomSurfaces}
          treatments={roomTreatments}
          projectId={projectId}
          onUpdateSurface={onUpdateSurface}
          onDeleteSurface={onDeleteSurface}
          onCreateTreatment={onCreateTreatment}
        />
      </CardContent>
    </Card>
  );
};
