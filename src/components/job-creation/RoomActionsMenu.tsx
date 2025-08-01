import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Copy, Trash2, Building, Home, Hotel } from "lucide-react";

interface RoomActionsMenuProps {
  room: any;
  onEditName: () => void;
  onCopyRoom: () => void;
  onDeleteRoom: () => void;
  onChangeRoomType: (type: string) => void;
}

export const RoomActionsMenu = ({ 
  room, 
  onEditName, 
  onCopyRoom, 
  onDeleteRoom, 
  onChangeRoomType 
}: RoomActionsMenuProps) => {
  const roomTypes = [
    { value: "living_room", label: "Living Room", icon: Home },
    { value: "bedroom", label: "Bedroom", icon: Building },
    { value: "kitchen", label: "Kitchen", icon: Building },
    { value: "bathroom", label: "Bathroom", icon: Building },
    { value: "office", label: "Office", icon: Building },
    { value: "hospitality", label: "Hospitality", icon: Hotel },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          variant="ghost" 
          className="hover:bg-brand-secondary/20"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onEditName}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Room Name
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopyRoom}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Room
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {roomTypes.map((type) => (
          <DropdownMenuItem 
            key={type.value}
            onClick={() => onChangeRoomType(type.value)}
            className={room.room_type === type.value ? "bg-brand-light" : ""}
          >
            <type.icon className="mr-2 h-4 w-4" />
            {type.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onDeleteRoom}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Room
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};