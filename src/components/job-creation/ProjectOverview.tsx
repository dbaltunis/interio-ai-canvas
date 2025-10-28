import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Square, Settings2, DollarSign, Plus, Edit, Trash2, Lock } from "lucide-react";
import { useState } from "react";
import { InteractiveProjectDialog } from "./InteractiveProjectDialog";
import { useStatusPermissions } from "@/hooks/useStatusPermissions";
import { useToast } from "@/hooks/use-toast";

interface ProjectOverviewProps {
  project: any;
  rooms: any[];
  surfaces: any[];
  treatments: any[];
  onCreateRoom?: (roomData?: { name: string; room_type: string }) => Promise<void>;
  onCreateSurface?: (roomId: string, surfaceType: string) => void;
  onCreateTreatment?: (roomId: string, surfaceId: string, treatmentType: string) => void;
  onUpdateRoom?: (roomId: string, updates: any) => void;
  onDeleteRoom?: (roomId: string) => void;
}

export const ProjectOverview = ({ 
  project, 
  rooms, 
  surfaces, 
  treatments,
  onCreateRoom,
  onCreateSurface,
  onCreateTreatment,
  onUpdateRoom,
  onDeleteRoom
}: ProjectOverviewProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'rooms' | 'surfaces' | 'treatments' | 'connect'>('rooms');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");
  const { toast } = useToast();
  
  // Check if status allows editing
  const statusPermissions = useStatusPermissions(project?.status_id);
  const { canEdit, isLocked, statusInfo } = statusPermissions.data || { canEdit: true, isLocked: false, statusInfo: null };
  
  const handleActionClick = (action: () => void) => {
    if (!canEdit) {
      toast({
        title: "Action Not Allowed",
        description: `Project is ${statusInfo?.action === 'locked' ? 'locked' : 'read-only'} in ${statusInfo?.name || 'this'} status`,
        variant: "destructive"
      });
      return;
    }
    action();
  };

  console.log("ProjectOverview render data:", { project, rooms, surfaces, treatments, canEdit, isLocked });

  // Safely calculate totals with error handling
  const calculateTreatmentTotal = (treatment: any) => {
    try {
      if (treatment.total_price && typeof treatment.total_price === 'number') {
        return treatment.total_price;
      }
      return 0;
    } catch (error) {
      console.error("Error calculating treatment total:", error, treatment);
      return 0;
    }
  };

  const projectTotal = treatments?.reduce((sum, treatment) => {
    return sum + calculateTreatmentTotal(treatment);
  }, 0) || 0;

  const handleCardClick = (type: 'rooms' | 'surfaces' | 'treatments' | 'connect') => {
    handleActionClick(() => {
      setDialogType(type);
      setDialogOpen(true);
    });
  };

  const handleEditRoom = (room: any) => {
    handleActionClick(() => {
      setEditingRoomId(room.id);
      setEditingRoomName(room.name);
    });
  };

  const handleSaveRoomEdit = async (roomId: string) => {
    if (editingRoomName.trim() && onUpdateRoom) {
      await onUpdateRoom(roomId, { name: editingRoomName.trim() });
      setEditingRoomId(null);
      setEditingRoomName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setEditingRoomName("");
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (confirm("Are you sure you want to delete this room? This will also delete all associated surfaces and treatments.")) {
      if (onDeleteRoom) {
        await onDeleteRoom(roomId);
      }
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Small delay to allow any pending operations to complete
    setTimeout(() => {
      // This will trigger a re-render to show updated room counts
      console.log("Dialog closed, rooms updated:", rooms?.length);
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className={`${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105'} border-2 ${!canEdit ? 'border-gray-300' : 'hover:border-primary'}`}
          onClick={() => canEdit && handleCardClick('rooms')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {isLocked ? <Lock className="h-3 w-3 text-destructive" /> : <Plus className="h-3 w-3 text-primary" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isLocked ? 'Status locked' : 'Click to add rooms'}
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105'} border-2 ${!canEdit ? 'border-gray-300' : 'hover:border-primary'}`}
          onClick={() => canEdit && handleCardClick('surfaces')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Surfaces</CardTitle>
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4 text-muted-foreground" />
              {isLocked ? <Lock className="h-3 w-3 text-destructive" /> : <Plus className="h-3 w-3 text-primary" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surfaces?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isLocked ? 'Status locked' : 'Click to add windows & walls'}
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105'} border-2 ${!canEdit ? 'border-gray-300' : 'hover:border-primary'}`}
          onClick={() => canEdit && handleCardClick('treatments')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treatments</CardTitle>
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              {isLocked ? <Lock className="h-3 w-3 text-destructive" /> : <Plus className="h-3 w-3 text-primary" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treatments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isLocked ? 'Status locked' : 'Click for advanced treatments'}
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-green-500"
          onClick={() => handleCardClick('connect')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connect & Calculate</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${projectTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Advanced calculations
            </p>
          </CardContent>
        </Card>
      </div>

      {rooms && rooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Rooms ({rooms.length})</span>
              <Button 
                onClick={() => handleCardClick('rooms')} 
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rooms.map((room) => {
                const roomSurfaces = surfaces?.filter(s => s.room_id === room.id) || [];
                const roomTreatments = treatments?.filter(t => t.room_id === room.id) || [];
                const roomTotal = roomTreatments.reduce((sum, t) => sum + calculateTreatmentTotal(t), 0);

                return (
                  <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {editingRoomId === room.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingRoomName}
                              onChange={(e) => setEditingRoomName(e.target.value)}
                              className="px-2 py-1 border rounded text-sm font-medium"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveRoomEdit(room.id);
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleSaveRoomEdit(room.id)}
                              className="h-7 px-2"
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleCancelEdit}
                              className="h-7 px-2"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-medium">{room.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {room.room_type?.replace('_', ' ') || 'Unknown'}
                            </Badge>
                          </>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {roomSurfaces.length} surface{roomSurfaces.length !== 1 ? 's' : ''} • {roomTreatments.length} treatment{roomTreatments.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="font-medium">${roomTotal.toFixed(2)}</div>
                      </div>
                      
                      {editingRoomId !== room.id && (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditRoom(room)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRoom(room.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {(!rooms || rooms.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Rooms Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click on the cards above to start adding rooms, surfaces, and treatments.
            </p>
            <Button onClick={() => handleCardClick('rooms')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}

      <InteractiveProjectDialog
        isOpen={dialogOpen}
        onClose={handleDialogClose}
        type={dialogType}
        project={project}
        rooms={rooms}
        surfaces={surfaces}
        treatments={treatments}
        onCreateRoom={onCreateRoom}
        onCreateSurface={onCreateSurface}
        onCreateTreatment={onCreateTreatment}
      />
    </div>
  );
};
