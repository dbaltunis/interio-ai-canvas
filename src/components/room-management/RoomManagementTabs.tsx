import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { RoomsGrid } from "../job-creation/RoomsGrid";
import { RoomAnalytics } from "./RoomAnalytics";
import { RoomTemplates } from "./RoomTemplates";
import { BarChart3, Home, Layout, Settings } from "lucide-react";

interface RoomManagementTabsProps {
  rooms: any[];
  surfaces: any[];
  treatments: any[];
  projectId: string;
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

export const RoomManagementTabs = ({
  rooms,
  surfaces,
  treatments,
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
  onCreateRoom,
  isCreatingRoom,
  onChangeRoomType,
  onCreateFromTemplate
}: RoomManagementTabsProps) => {
  const [activeTab, setActiveTab] = useState("rooms");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rooms" className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Rooms</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Layout className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-6">
          <RoomsGrid
            rooms={rooms}
            projectId={projectId}
            onUpdateRoom={onUpdateRoom}
            onDeleteRoom={onDeleteRoom}
            onCreateTreatment={onCreateTreatment}
            onCreateSurface={onCreateSurface}
            onUpdateSurface={onUpdateSurface}
            onDeleteSurface={onDeleteSurface}
            onCopyRoom={onCopyRoom}
            editingRoomId={editingRoomId}
            setEditingRoomId={setEditingRoomId}
            editingRoomName={editingRoomName}
            setEditingRoomName={setEditingRoomName}
            onRenameRoom={onRenameRoom}
            onCreateRoom={onCreateRoom}
            isCreatingRoom={isCreatingRoom}
            onChangeRoomType={onChangeRoomType}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <RoomAnalytics
            rooms={rooms}
            surfaces={surfaces}
            treatments={treatments}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <RoomTemplates
            onCreateFromTemplate={onCreateFromTemplate || (() => {})}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Room Settings</h3>
                <p className="text-muted-foreground">
                  Room configuration options coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};