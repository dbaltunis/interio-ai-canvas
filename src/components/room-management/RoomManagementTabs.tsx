
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface RoomManagementTabsProps {
  surfaces: any[];
  treatments: any[];
  projectId: string;
  onUpdateRoom: (roomId: string, data: any) => void;
  onDeleteRoom: (roomId: string) => void;
  onCreateSurface: (roomId: string, surfaceType: string) => void;
  onUpdateSurface: (surfaceId: string, data: any) => void;
  onDeleteSurface: (surfaceId: string) => void;
  onCopyRoom: (roomId: string) => void;
  editingRoomId: string | null;
  setEditingRoomId: (id: string | null) => void;
  editingRoomName: string;
  setEditingRoomName: (name: string) => void;
  onRenameRoom: (roomId: string, newName: string) => void;
  onCreateRoom: (roomData?: { name: string; room_type: string }) => void;
  isCreatingRoom: boolean;
  onChangeRoomType: (roomId: string, roomType: string) => void;
  onCreateFromTemplate: (template: any, customName?: string) => void;
}

export const RoomManagementTabs = ({
  surfaces,
  treatments,
  projectId,
  onUpdateRoom,
  onDeleteRoom,
  onCreateSurface,
  onUpdateSurface,
  onDeleteSurface,
  onCopyRoom,
  editingRoomId,
  setEditingRoomId,
  editingRoomName,
  setEditingRoomName,
  onRenameRoom,
  onCreateRoom,
  isCreatingRoom,
  onChangeRoomType,
  onCreateFromTemplate
}: RoomManagementTabsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Room Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Rooms & Surfaces</h3>
            <Button onClick={() => onCreateRoom()} disabled={isCreatingRoom}>
              <Plus className="h-4 w-4 mr-2" />
              {isCreatingRoom ? 'Creating...' : 'Add Room'}
            </Button>
          </div>
          
          <div className="space-y-4">
            {surfaces.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No surfaces created yet. Create a room first, then add surfaces to it.
              </p>
            ) : (
              <div className="grid gap-4">
                {surfaces.map((surface) => (
                  <Card key={surface.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{surface.name}</h4>
                        <p className="text-sm text-gray-600">{surface.surface_type}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateSurface(surface.id, surface)}
                      >
                        Edit
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {treatments.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Treatments</h4>
              <div className="space-y-2">
                {treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{treatment.product_name || treatment.treatment_type}</span>
                      <p className="text-sm text-gray-600">${treatment.total_price || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
