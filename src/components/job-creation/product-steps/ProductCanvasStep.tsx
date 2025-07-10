import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Edit3, 
  Eye, 
  Save, 
  Palette, 
  Ruler, 
  Settings,
  Image,
  DollarSign
} from "lucide-react";

interface ProductCanvasStepProps {
  product: any;
  selectedRooms: string[];
  existingRooms: any[];
  onClose: () => void;
}

export const ProductCanvasStep = ({
  product,
  selectedRooms,
  existingRooms,
  onClose
}: ProductCanvasStepProps) => {
  const [activeRoom, setActiveRoom] = useState(selectedRooms[0]);

  const getRoomName = (roomId: string) => {
    const room = existingRooms.find(r => r.id === roomId);
    return room?.name || `Room ${roomId}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Visual Design Canvas</h3>
        <p className="text-sm text-muted-foreground">
          Create a visual design for your {product?.name} configuration
        </p>
      </div>

      {/* Room Selector */}
      <div className="flex flex-wrap gap-2">
        {selectedRooms.map((roomId) => (
          <Button
            key={roomId}
            variant={activeRoom === roomId ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveRoom(roomId)}
            className="relative"
          >
            {getRoomName(roomId)}
            {activeRoom === roomId && (
              <CheckCircle className="h-3 w-3 ml-2" />
            )}
          </Button>
        ))}
      </div>

      {/* Simple Canvas */}
      <Card className="min-h-[400px] border-2 border-dashed border-gray-300">
        <div className="p-8 text-center min-h-[400px] flex items-center justify-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">{getRoomName(activeRoom)}</h4>
              <p className="text-muted-foreground">{product?.name} Visual Design</p>
            </div>
            
            <Palette className="h-16 w-16 mx-auto text-gray-400" />
            
            <div className="space-y-4">
              <h5 className="font-medium">Visual Design Canvas</h5>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                This canvas will let you create visual designs, choose colors, patterns, and see how your {product?.name} will look in the room.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-yellow-800">
                  <strong>Coming Soon:</strong> Interactive design tools, color picker, pattern library, and 3D visualization.
                </p>
              </div>
            </div>
            
            <Button variant="outline" size="lg">
              <Edit3 className="h-4 w-4 mr-2" />
              Start Visual Design
            </Button>
          </div>
        </div>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
        <div>
          <p className="font-medium text-green-900">Design Complete</p>
          <p className="text-sm text-green-700">
            Your {product?.name} configuration is ready for quoting
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Save & Close
          </Button>
          <Button onClick={onClose}>
            Complete & Move to Quote
          </Button>
        </div>
      </div>
    </div>
  );
};