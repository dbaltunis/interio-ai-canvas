
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, History, LayoutGrid } from "lucide-react";
import { VisualRoomCard } from "./VisualRoomCard";
import { ClientMeasurementHistory } from "./ClientMeasurementHistory";
import { EmptyRoomsState } from "../job-creation/EmptyRoomsState";

interface VisualRoomManagementTabsProps {
  rooms: any[];
  surfaces: any[];
  treatments: any[];
  projectId: string;
  clientId?: string;
  onUpdateRoom: any;
  onDeleteRoom: any;
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
  onCreateRoom: () => void;
  isCreatingRoom: boolean;
  onChangeRoomType: (roomId: string, roomType: string) => void;
  onCreateFromTemplate?: (template: any, customName?: string) => void;
}

export const VisualRoomManagementTabs = ({
  rooms,
  surfaces,
  treatments,
  projectId,
  clientId,
  onCreateTreatment,
  onCreateSurface,
  onUpdateSurface,
  onCreateRoom,
  isCreatingRoom
}: VisualRoomManagementTabsProps) => {
  const [showHistory, setShowHistory] = useState(false);

  const handleCopyMeasurement = (measurement: any) => {
    // Implementation for copying measurement to current project
    console.log("Copying measurement:", measurement);
    setShowHistory(false);
  };

  return (
    <>
      <Tabs defaultValue="rooms" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Room Layout
            </TabsTrigger>
            {clientId && (
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Measurement History
              </TabsTrigger>
            )}
          </TabsList>
          
          <div className="flex gap-2">
            {clientId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
              >
                <History className="h-4 w-4 mr-2" />
                View History
              </Button>
            )}
            <Button
              onClick={onCreateRoom}
              disabled={isCreatingRoom}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCreatingRoom ? 'Adding...' : 'Add Room'}
            </Button>
          </div>
        </div>

        <TabsContent value="rooms" className="space-y-6">
          {!rooms || rooms.length === 0 ? (
            <EmptyRoomsState onCreateRoom={onCreateRoom} isCreatingRoom={isCreatingRoom} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <VisualRoomCard
                  key={room.id}
                  room={room}
                  clientId={clientId}
                  onCreateSurface={onCreateSurface}
                  onCreateTreatment={onCreateTreatment}
                  onUpdateSurface={onUpdateSurface}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {clientId && (
          <TabsContent value="history">
            <ClientMeasurementHistory
              clientId={clientId}
              currentProjectId={projectId}
              onCopyMeasurement={handleCopyMeasurement}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* History Dialog */}
      {clientId && (
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Client Measurement History</DialogTitle>
            </DialogHeader>
            <ClientMeasurementHistory
              clientId={clientId}
              currentProjectId={projectId}
              onCopyMeasurement={handleCopyMeasurement}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
