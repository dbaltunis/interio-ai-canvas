
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Search, Trash2 } from "lucide-react";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useWindows, useCreateWindow, useUpdateWindow, useDeleteWindow } from "@/hooks/useWindows";
import { useTreatments, useCreateTreatment, useUpdateTreatment, useDeleteTreatment } from "@/hooks/useTreatments";

interface ProjectJobsTabProps {
  project: any;
}

export const ProjectJobsTab = ({ project }: ProjectJobsTabProps) => {
  const { data: rooms } = useRooms(project.id);
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const createTreatment = useCreateTreatment();
  const updateTreatment = useUpdateTreatment();
  const deleteTreatment = useDeleteTreatment();

  // Calculate total amount (placeholder calculation)
  const totalAmount = 0; // This should be calculated from all treatments

  const handleCreateRoom = async () => {
    const roomNumber = (rooms?.length || 0) + 1;
    await createRoom.mutateAsync({
      project_id: project.id,
      name: `Room ${roomNumber}`,
      room_type: "living_room"
    });
  };

  const handleCreateTreatment = async (roomId: string) => {
    await createTreatment.mutateAsync({
      window_id: "temp", // This needs to be handled properly
      room_id: roomId,
      project_id: project.id,
      treatment_type: "Curtains",
      status: "planned"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Total and Add Room */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Total: £{totalAmount.toFixed(2)}</h2>
          <p className="text-muted-foreground">Project total before GST</p>
        </div>
        <Button onClick={handleCreateRoom} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add room</span>
        </Button>
      </div>

      {/* Rooms Grid */}
      <div className="grid gap-6">
        {rooms?.map((room) => (
          <RoomCard 
            key={room.id} 
            room={room} 
            projectId={project.id}
            onUpdateRoom={updateRoom}
            onDeleteRoom={deleteRoom}
            onCreateTreatment={handleCreateTreatment}
          />
        ))}
      </div>
    </div>
  );
};

interface RoomCardProps {
  room: any;
  projectId: string;
  onUpdateRoom: any;
  onDeleteRoom: any;
  onCreateTreatment: (roomId: string) => void;
}

const RoomCard = ({ room, projectId, onUpdateRoom, onDeleteRoom, onCreateTreatment }: RoomCardProps) => {
  const { data: treatments } = useTreatments();
  const roomTreatments = treatments?.filter(t => t.room_id === room.id) || [];
  const roomTotal = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{room.name}</CardTitle>
            <p className="text-2xl font-bold text-green-600">£{roomTotal.toFixed(2)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const newName = prompt("Enter room name:", room.name);
                if (newName) {
                  onUpdateRoom.mutate({ id: room.id, name: newName });
                }
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm("Delete this room?")) {
                  onDeleteRoom.mutate(room.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {roomTreatments.length === 0 ? (
          <div className="text-center py-8">
            <Select onValueChange={() => onCreateTreatment(room.id)}>
              <SelectTrigger className="w-48 mx-auto">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="curtains">Curtains</SelectItem>
                <SelectItem value="blinds">Blinds</SelectItem>
                <SelectItem value="shutters">Shutters</SelectItem>
                <SelectItem value="valances">Valances</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-4">
            {roomTreatments.map((treatment) => (
              <TreatmentCard key={treatment.id} treatment={treatment} />
            ))}
            <div className="text-center">
              <Select onValueChange={() => onCreateTreatment(room.id)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curtains">Curtains</SelectItem>
                  <SelectItem value="blinds">Blinds</SelectItem>
                  <SelectItem value="shutters">Shutters</SelectItem>
                  <SelectItem value="valances">Valances</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface TreatmentCardProps {
  treatment: any;
}

const TreatmentCard = ({ treatment }: TreatmentCardProps) => {
  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg">
      {/* Fabric Image Placeholder */}
      <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
        <img 
          src="/placeholder.svg" 
          alt="Fabric sample" 
          className="w-full h-full object-cover rounded"
        />
      </div>
      
      {/* Treatment Details */}
      <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
        <div>
          <p className="font-medium">{treatment.treatment_type}</p>
          <p className="text-muted-foreground">Rail width</p>
          <p className="text-muted-foreground">Heading name</p>
          <p className="text-muted-foreground">Eyelet Ring</p>
        </div>
        
        <div>
          <p>300 cm</p>
          <p>Eyelet Curtain</p>
          <p>Gold rings 8mm</p>
        </div>
        
        <div>
          <p className="text-muted-foreground">Curtain drop</p>
          <p className="text-muted-foreground">Lining</p>
          <p className="text-muted-foreground">Fabric article</p>
        </div>
        
        <div>
          <p>200 cm</p>
          <p>Blackout</p>
          <p>SAG/02 Monday Blues</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="ghost">
          <Search className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
