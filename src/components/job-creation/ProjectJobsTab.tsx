
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Search, Trash2, Copy, Clipboard, ArrowLeft, Home } from "lucide-react";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useWindows, useCreateWindow, useUpdateWindow, useDeleteWindow } from "@/hooks/useWindows";
import { useTreatments, useCreateTreatment, useUpdateTreatment, useDeleteTreatment } from "@/hooks/useTreatments";

interface ProjectJobsTabProps {
  project: any;
  onBack?: () => void;
}

export const ProjectJobsTab = ({ project, onBack }: ProjectJobsTabProps) => {
  const { data: rooms } = useRooms(project.id);
  const { data: allWindows } = useWindows();
  const { data: allTreatments } = useTreatments();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const createWindow = useCreateWindow();
  const createTreatment = useCreateTreatment();
  
  const [copiedRoom, setCopiedRoom] = useState<any>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");
  const [activeTab, setActiveTab] = useState("Client");

  // Calculate total amount from all treatments
  const projectTreatments = allTreatments?.filter(t => t.project_id === project.id) || [];
  const totalAmount = projectTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);

  const handleCreateRoom = async () => {
    const roomNumber = (rooms?.length || 0) + 1;
    await createRoom.mutateAsync({
      project_id: project.id,
      name: `Room ${roomNumber}`,
      room_type: "living_room"
    });
  };

  const handleRenameRoom = async (roomId: string, newName: string) => {
    if (newName.trim()) {
      await updateRoom.mutateAsync({ id: roomId, name: newName.trim() });
    }
    setEditingRoomId(null);
    setEditingRoomName("");
  };

  const handleCopyRoom = (room: any) => {
    const roomWindows = allWindows?.filter(w => w.room_id === room.id) || [];
    const roomTreatments = allTreatments?.filter(t => t.room_id === room.id) || [];
    
    setCopiedRoom({
      room,
      windows: roomWindows,
      treatments: roomTreatments
    });
  };

  const handlePasteRoom = async () => {
    if (!copiedRoom) return;

    try {
      // Create new room
      const roomNumber = (rooms?.length || 0) + 1;
      const newRoom = await createRoom.mutateAsync({
        project_id: project.id,
        name: `${copiedRoom.room.name} (Copy ${roomNumber})`,
        room_type: copiedRoom.room.room_type
      });

      // Create windows for the new room
      for (const window of copiedRoom.windows) {
        const newWindow = await createWindow.mutateAsync({
          room_id: newRoom.id,
          project_id: project.id,
          name: window.name,
          width: window.width,
          height: window.height
        });

        // Create treatments for each window
        const windowTreatments = copiedRoom.treatments.filter((t: any) => t.window_id === window.id);
        for (const treatment of windowTreatments) {
          await createTreatment.mutateAsync({
            window_id: newWindow.id,
            room_id: newRoom.id,
            project_id: project.id,
            treatment_type: treatment.treatment_type,
            status: treatment.status,
            total_price: treatment.total_price
          });
        }
      }
    } catch (error) {
      console.error("Failed to paste room:", error);
    }
  };

  const handleCreateTreatment = async (roomId: string, treatmentType: string) => {
    // Find or create a default window for this room
    let roomWindows = allWindows?.filter(w => w.room_id === roomId) || [];
    
    if (roomWindows.length === 0) {
      // Create a default window if none exists
      const newWindow = await createWindow.mutateAsync({
        room_id: roomId,
        project_id: project.id,
        name: "Window 1",
        width: 200,
        height: 250
      });
      roomWindows = [newWindow];
    }

    await createTreatment.mutateAsync({
      window_id: roomWindows[0].id,
      room_id: roomId,
      project_id: project.id,
      treatment_type: treatmentType,
      status: "planned",
      total_price: treatmentType === "Curtains" ? 75.00 : 
                  treatmentType === "Blinds" ? 45.00 : 
                  treatmentType === "Shutters" ? 120.00 : 50.00
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Jobs</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold">{project.quote_number}</h1>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                £{totalAmount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Project total before GST</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-4 flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
            {["Client", "Quote", "Workshop", "Jobs"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm ${
                  activeTab === tab
                    ? "bg-white shadow-sm"
                    : "hover:bg-white/50"
                }`}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === "Jobs" && (
          <>
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                {copiedRoom && (
                  <Button 
                    onClick={handlePasteRoom}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Clipboard className="h-4 w-4" />
                    <span>Paste Room</span>
                  </Button>
                )}
              </div>
              <Button 
                onClick={handleCreateRoom} 
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add room</span>
              </Button>
            </div>

            {/* Rooms Grid */}
            <div className="space-y-6">
              {!rooms || rooms.length === 0 ? (
                <div className="text-center py-12">
                  <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
                  <p className="text-gray-500 mb-4">
                    Add your first room to start designing window treatments
                  </p>
                  <Button onClick={handleCreateRoom} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add your first room</span>
                  </Button>
                </div>
              ) : (
                rooms.map((room) => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    projectId={project.id}
                    onUpdateRoom={updateRoom}
                    onDeleteRoom={deleteRoom}
                    onCreateTreatment={handleCreateTreatment}
                    onCopyRoom={handleCopyRoom}
                    editingRoomId={editingRoomId}
                    setEditingRoomId={setEditingRoomId}
                    editingRoomName={editingRoomName}
                    setEditingRoomName={setEditingRoomName}
                    onRenameRoom={handleRenameRoom}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "Client" && (
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Client Information</h3>
            <p className="text-gray-500">Client details will be displayed here.</p>
          </div>
        )}

        {activeTab === "Quote" && (
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Quote Details</h3>
            <p className="text-gray-500">Quote information will be displayed here.</p>
          </div>
        )}

        {activeTab === "Workshop" && (
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Workshop Orders</h3>
            <p className="text-gray-500">Workshop orders will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

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

const RoomCard = ({ 
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
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {editingRoomId === room.id ? (
              <Input
                value={editingRoomName}
                onChange={(e) => setEditingRoomName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={() => onRenameRoom(room.id, editingRoomName)}
                className="text-xl font-semibold"
                autoFocus
              />
            ) : (
              <CardTitle className="text-xl">{room.name}</CardTitle>
            )}
            <p className="text-2xl font-bold text-green-600 mt-1">£{roomTotal.toFixed(2)}</p>
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
            <Button size="sm" variant="ghost" title="Search">
              <Search className="h-4 w-4" />
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
              <SelectTrigger className="w-48 mx-auto">
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
                <SelectTrigger className="w-48">
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

interface TreatmentCardProps {
  treatment: any;
}

const TreatmentCard = ({ treatment }: TreatmentCardProps) => {
  const getFabricDetails = (treatmentType: string) => {
    switch (treatmentType) {
      case "Curtains":
        return {
          railWidth: "300 cm",
          heading: "Eyelet Curtain",
          eyeletRing: "Gold rings 8mm",
          drop: "200 cm",
          lining: "Blackout",
          fabric: "SAG/02 Monday Blues",
          price: "£76.67"
        };
      default:
        return {
          railWidth: "200 cm",
          heading: "Pencil Pleat",
          eyeletRing: "Standard rings",
          drop: "250 cm",
          lining: "Blackout",
          fabric: "Sky Gray 01",
          price: `£${treatment.total_price?.toFixed(2) || "0.00"}`
        };
    }
  };

  const details = getFabricDetails(treatment.treatment_type);

  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg bg-white">
      {/* Fabric Image */}
      <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
        <img 
          src="/placeholder.svg" 
          alt="Fabric sample" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Treatment Details Grid */}
      <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
        <div>
          <p className="font-medium text-gray-900">{treatment.treatment_type}</p>
          <p className="text-gray-600 mt-1">Rail width</p>
          <p className="text-gray-600">Heading name</p>
          <p className="text-gray-600">Eyelet Ring</p>
        </div>
        
        <div>
          <p className="text-gray-900">{details.railWidth}</p>
          <p className="text-gray-900 mt-1">{details.heading}</p>
          <p className="text-gray-900">{details.eyeletRing}</p>
        </div>
        
        <div>
          <p className="text-gray-600">Curtain drop</p>
          <p className="text-gray-600 mt-1">Lining</p>
          <p className="text-gray-600">Fabric article</p>
          <p className="text-gray-600">Fabric price</p>
        </div>
        
        <div>
          <p className="text-gray-900">{details.drop}</p>
          <p className="text-gray-900 mt-1">{details.lining}</p>
          <p className="text-gray-900">{details.fabric}</p>
          <p className="text-gray-900 font-medium">{details.price}</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="ghost" title="View details">
          <Search className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" title="Delete treatment">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
