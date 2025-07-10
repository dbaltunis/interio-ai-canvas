import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, ArrowRight } from "lucide-react";

interface RoomSelectionStepProps {
  existingRooms: any[];
  selectedRooms: string[];
  onRoomSelection: (roomId: string, checked: boolean) => void;
  newRooms: string[];
  setNewRooms: (rooms: string[]) => void;
  roomQuantity: number;
  setRoomQuantity: (quantity: number) => void;
  onNext: () => void;
}

export const RoomSelectionStep = ({
  existingRooms,
  selectedRooms,
  onRoomSelection,
  newRooms,
  setNewRooms,
  roomQuantity,
  setRoomQuantity,
  onNext
}: RoomSelectionStepProps) => {
  const [showNewRoomInputs, setShowNewRoomInputs] = useState(false);

  const updateNewRoomName = (index: number, name: string) => {
    const updated = [...newRooms];
    updated[index] = name;
    setNewRooms(updated);
  };

  const canProceed = selectedRooms.length > 0 || newRooms.some(name => name.trim());

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Rooms</h3>
        <p className="text-sm text-muted-foreground">
          Choose existing rooms or create new ones for your products
        </p>
      </div>

      {/* Existing Rooms */}
      {existingRooms.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center">
            <Home className="h-4 w-4 mr-2" />
            Existing Rooms
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {existingRooms.map((room) => (
              <Card 
                key={room.id} 
                className={`p-3 cursor-pointer border-2 transition-all ${
                  selectedRooms.includes(room.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onRoomSelection(room.id, !selectedRooms.includes(room.id))}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    checked={selectedRooms.includes(room.id)}
                    onCheckedChange={() => {}}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{room.name}</p>
                    <p className="text-sm text-muted-foreground">{room.room_type}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create New Rooms */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create New Rooms
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewRoomInputs(!showNewRoomInputs)}
          >
            {showNewRoomInputs ? 'Hide' : 'Add New'}
          </Button>
        </div>

        {showNewRoomInputs && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <Label>How many rooms?</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={roomQuantity}
                onChange={(e) => {
                  const qty = parseInt(e.target.value) || 1;
                  setRoomQuantity(qty);
                  setNewRooms(Array(qty).fill(''));
                }}
                className="w-20"
              />
            </div>

            <div className="space-y-2">
              {Array.from({ length: roomQuantity }, (_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Label className="w-16">Room {index + 1}:</Label>
                  <Input
                    placeholder={`Room ${index + 1}`}
                    value={newRooms[index] || ''}
                    onChange={(e) => updateNewRoomName(index, e.target.value)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div>
          <p className="font-medium">
            Selected: {selectedRooms.length} existing + {newRooms.filter(name => name.trim()).length} new rooms
          </p>
          <p className="text-sm text-muted-foreground">
            Total: {selectedRooms.length + newRooms.filter(name => name.trim()).length} rooms
          </p>
        </div>
        <Button onClick={onNext} disabled={!canProceed}>
          Next: Product Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
