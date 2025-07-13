import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Plus, 
  Copy, 
  MoreVertical, 
  Edit, 
  Trash2,
  ChevronDown
} from "lucide-react";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useToast } from "@/hooks/use-toast";
import { SimplifiedTreatmentCard } from "./SimplifiedTreatmentCard";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";

interface SimplifiedRoomCardProps {
  room: any;
  treatments: any[];
  onAddTreatment: (roomId: string, treatmentType: string) => void;
  onCopyRoom: (room: any) => void;
  projectId: string;
}

export const SimplifiedRoomCard = ({ 
  room, 
  treatments, 
  onAddTreatment, 
  onCopyRoom,
  projectId 
}: SimplifiedRoomCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [roomName, setRoomName] = useState(room.name);
  const [showTreatmentDropdown, setShowTreatmentDropdown] = useState(false);
  
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const { toast } = useToast();
  const { windowCoverings, isLoading: windowCoveringsLoading } = useWindowCoverings();

  // Filter active window covering templates
  const activeTemplates = windowCoverings?.filter(wc => wc.active) || [];

  const roomTotal = treatments.reduce((sum, t) => sum + (t.total_price || 0), 0);

  const handleSaveRoomName = async () => {
    if (roomName.trim() && roomName !== room.name) {
      try {
        await updateRoom.mutateAsync({
          id: room.id,
          name: roomName.trim()
        });
        toast({
          title: "Room Updated",
          description: "Room name updated successfully",
        });
      } catch (error) {
        console.error("Failed to update room:", error);
        toast({
          title: "Error",
          description: "Failed to update room name",
          variant: "destructive",
        });
        setRoomName(room.name); // Reset on error
      }
    }
    setIsEditing(false);
  };

  const handleDeleteRoom = async () => {
    if (!confirm(`Delete "${room.name}"? This will also delete all treatments in this room.`)) {
      return;
    }

    try {
      await deleteRoom.mutateAsync(room.id);
      toast({
        title: "Room Deleted",
        description: `${room.name} has been deleted`,
      });
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    }
  };

  const handleAddTreatment = (treatmentType: string) => {
    onAddTreatment(room.id, treatmentType);
    setShowTreatmentDropdown(false);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Home className="h-5 w-5 text-primary" />
            {isEditing ? (
              <Input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onBlur={handleSaveRoomName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRoomName();
                  if (e.key === 'Escape') {
                    setRoomName(room.name);
                    setIsEditing(false);
                  }
                }}
                className="h-8 font-semibold"
                autoFocus
              />
            ) : (
              <CardTitle 
                className="cursor-pointer hover:text-primary"
                onClick={() => setIsEditing(true)}
              >
                {room.name}
              </CardTitle>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Rename Room
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopyRoom(room)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Room
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDeleteRoom}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Room
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{treatments.length} treatments</Badge>
            {roomTotal > 0 && (
              <Badge variant="outline">${roomTotal.toFixed(2)}</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Treatments */}
        {treatments.length > 0 && (
          <div className="space-y-3">
            {treatments.map((treatment) => (
              <SimplifiedTreatmentCard
                key={treatment.id}
                treatment={treatment}
                projectId={projectId}
              />
            ))}
          </div>
        )}

        {/* Add Treatment Button */}
        <DropdownMenu open={showTreatmentDropdown} onOpenChange={setShowTreatmentDropdown}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={treatments.length === 0 ? "default" : "outline"} 
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Treatment
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-background border border-border shadow-lg">
            {windowCoveringsLoading ? (
              <DropdownMenuItem disabled>
                Loading templates...
              </DropdownMenuItem>
            ) : activeTemplates.length > 0 ? (
              activeTemplates.map((template) => (
                <DropdownMenuItem 
                  key={template.id} 
                  onClick={() => handleAddTreatment(template.name)}
                  className="flex items-center gap-2 hover:bg-muted cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add {template.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled className="text-muted-foreground">
                No templates found. Create templates in Settings first.
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {treatments.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            {activeTemplates.length > 0 
              ? "No treatments yet. Add treatments from your configured templates."
              : "No treatments yet. Create product templates in Settings to get started."
            }
          </p>
        )}
      </CardContent>
    </Card>
  );
};