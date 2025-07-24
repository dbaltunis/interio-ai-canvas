import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Square } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RoomsGridProps {
  rooms: any[];
  onCreateRoom?: (roomData?: { name: string; room_type: string }) => Promise<void>;
  onCreateSurface?: (roomId: string, surfaceType: string) => void;
  onBack?: () => void;
}

export const RoomsGrid = ({ rooms, onCreateRoom, onCreateSurface, onBack }: RoomsGridProps) => {
  const [showNewRoomForm, setShowNewRoomForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('living_room');
  const [showSurfaceSelector, setShowSurfaceSelector] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

  const handleCreateRoom = async () => {
    if (newRoomName.trim() !== '' && onCreateRoom) {
      await onCreateRoom({ name: newRoomName, room_type: newRoomType });
      setShowNewRoomForm(false);
      setNewRoomName('');
    }
  };

  const handleRoomClick = (room: any) => {
    setSelectedRoom(room);
    setShowSurfaceSelector(true);
  };

  const handleSurfaceCreate = (surfaceType: string) => {
    if (selectedRoom && onCreateSurface) {
      onCreateSurface(selectedRoom.id, surfaceType);
      setShowSurfaceSelector(false);
      setSelectedRoom(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Rooms</CardTitle>
          <Button onClick={() => setShowNewRoomForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </CardHeader>
        <CardContent>
          {showNewRoomForm && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
                    Room Name
                  </label>
                  <input
                    type="text"
                    id="roomName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="roomType" className="block text-sm font-medium text-gray-700">
                    Room Type
                  </label>
                  <Select onValueChange={setNewRoomType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="living_room">Living Room</SelectItem>
                      <SelectItem value="bedroom">Bedroom</SelectItem>
                      <SelectItem value="kitchen">Kitchen</SelectItem>
                      <SelectItem value="bathroom">Bathroom</SelectItem>
                      <SelectItem value="dining_room">Dining Room</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="button" onClick={handleCreateRoom} className="w-full">
                Create Room
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => handleRoomClick(room)}>
                <CardHeader>
                  <CardTitle>{room.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Type: {room.room_type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {showSurfaceSelector && selectedRoom && (
        <Card>
          <CardHeader>
            <CardTitle>Add Surface to {selectedRoom.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Select a surface type to add to this room:</p>
            <div className="flex space-x-4">
              <Button onClick={() => handleSurfaceCreate('window')} variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Window
              </Button>
              <Button onClick={() => handleSurfaceCreate('wall')} variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Wall
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
