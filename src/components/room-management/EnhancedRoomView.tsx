
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Copy, Home, Maximize, Grid3x3, Package } from 'lucide-react';
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '@/hooks/useRooms';
import { useSurfaces, useCreateSurface, useUpdateSurface, useDeleteSurface } from '@/hooks/useSurfaces';
import { useTreatments } from '@/hooks/useTreatments';
import { useToast } from '@/hooks/use-toast';
import { RoomManagementTabs } from './RoomManagementTabs';

interface EnhancedRoomViewProps {
  project: any;
}

export const EnhancedRoomView = ({ project }: EnhancedRoomViewProps) => {
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const { toast } = useToast();
  const { data: rooms, isLoading: roomsLoading } = useRooms(project.id);
  const { data: surfaces, isLoading: surfacesLoading } = useSurfaces(project.id);
  const { data: treatments, isLoading: treatmentsLoading } = useTreatments(project.id);

  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();
  const createSurfaceMutation = useCreateSurface();
  const updateSurfaceMutation = useUpdateSurface();
  const deleteSurfaceMutation = useDeleteSurface();

  const handleCreateRoom = async (roomData?: { name: string; room_type: string }) => {
    setIsCreatingRoom(true);
    try {
      const roomToCreate = roomData || {
        name: `Room ${(rooms?.length || 0) + 1}`,
        room_type: 'living_room'
      };

      await createRoomMutation.mutateAsync({
        project_id: project.id,
        ...roomToCreate
      });

      toast({
        title: "Room Created",
        description: `${roomToCreate.name} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleUpdateRoom = async (roomId: string, data: any) => {
    try {
      await updateRoomMutation.mutateAsync({
        id: roomId,
        ...data
      });
      toast({
        title: "Room Updated",
        description: "Room has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoomMutation.mutateAsync(roomId);
      toast({
        title: "Room Deleted",
        description: "Room has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSurface = async (roomId: string, surfaceType: string) => {
    try {
      await createSurfaceMutation.mutateAsync({
        project_id: project.id,
        room_id: roomId,
        surface_type: surfaceType,
        name: `${surfaceType} Surface`,
        width: 100,
        height: 100
      });
      toast({
        title: "Surface Created",
        description: "Surface has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create surface. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSurface = async (surfaceId: string, data: any) => {
    try {
      await updateSurfaceMutation.mutateAsync({
        id: surfaceId,
        ...data
      });
      toast({
        title: "Surface Updated",
        description: "Surface has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update surface. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSurface = async (surfaceId: string) => {
    try {
      await deleteSurfaceMutation.mutateAsync(surfaceId);
      toast({
        title: "Surface Deleted",
        description: "Surface has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete surface. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyRoom = async (roomId: string) => {
    const room = rooms?.find(r => r.id === roomId);
    if (room) {
      handleCreateRoom({
        name: `${room.name} (Copy)`,
        room_type: room.room_type
      });
    }
  };

  const handleRenameRoom = async (roomId: string, newName: string) => {
    await handleUpdateRoom(roomId, { name: newName });
    setEditingRoomId(null);
    setEditingRoomName('');
  };

  const handleChangeRoomType = async (roomId: string, roomType: string) => {
    await handleUpdateRoom(roomId, { room_type: roomType });
  };

  const handleCreateFromTemplate = async (template: any, customName?: string) => {
    const roomName = customName || `${template.name} Room`;
    await handleCreateRoom({
      name: roomName,
      room_type: template.room_type
    });
  };

  if (roomsLoading || surfacesLoading || treatmentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoomManagementTabs
        surfaces={surfaces || []}
        treatments={treatments || []}
        projectId={project.id}
        onUpdateRoom={handleUpdateRoom}
        onDeleteRoom={handleDeleteRoom}
        onCreateSurface={handleCreateSurface}
        onUpdateSurface={handleUpdateSurface}
        onDeleteSurface={handleDeleteSurface}
        onCopyRoom={handleCopyRoom}
        editingRoomId={editingRoomId}
        setEditingRoomId={setEditingRoomId}
        editingRoomName={editingRoomName}
        setEditingRoomName={setEditingRoomName}
        onRenameRoom={handleRenameRoom}
        onCreateRoom={handleCreateRoom}
        isCreatingRoom={isCreatingRoom}
        onChangeRoomType={handleChangeRoomType}
        onCreateFromTemplate={handleCreateFromTemplate}
      />
    </div>
  );
};
