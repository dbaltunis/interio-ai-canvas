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
  const [canvasView, setCanvasView] = useState('design'); // design, measurements, pricing

  const getRoomName = (roomId: string) => {
    const room = existingRooms.find(r => r.id === roomId);
    return room?.name || `Room ${roomId}`;
  };

  const canvasTools = [
    { id: 'design', label: 'Design', icon: Palette, description: 'Visual design and styling' },
    { id: 'measurements', label: 'Measure', icon: Ruler, description: 'Dimensions and sizing' },
    { id: 'options', label: 'Options', icon: Settings, description: 'Hardware and extras' },
    { id: 'materials', label: 'Materials', icon: Image, description: 'Fabrics and finishes' },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, description: 'Cost calculation' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Product Canvas</h3>
        <p className="text-sm text-muted-foreground">
          Design and configure {product?.name} for each room
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

      {/* Canvas Workspace */}
      <Card className="min-h-[400px] border-2 border-dashed border-gray-300">
        <div className="p-6">
          {/* Canvas Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-semibold">{getRoomName(activeRoom)}</h4>
              <p className="text-sm text-muted-foreground">{product?.name} Configuration</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Draft</Badge>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Canvas Tools */}
          <Tabs value={canvasView} onValueChange={setCanvasView}>
            <TabsList className="grid grid-cols-5 w-full">
              {canvasTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <TabsTrigger 
                    key={tool.id} 
                    value={tool.id}
                    className="flex flex-col items-center space-y-1 h-16"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{tool.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="design" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                <div className="space-y-4">
                  <Palette className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <h5 className="font-medium">Visual Design Canvas</h5>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop elements, choose styles, colors, and patterns
                    </p>
                  </div>
                  <Button variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Start Designing
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="measurements" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                <div className="space-y-4">
                  <Ruler className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <h5 className="font-medium">Measurement Tools</h5>
                    <p className="text-sm text-muted-foreground">
                      Add dimensions, calculate fabric requirements, set mounting positions
                    </p>
                  </div>
                  <Button variant="outline">
                    <Ruler className="h-4 w-4 mr-2" />
                    Add Measurements
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="options" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                <div className="space-y-4">
                  <Settings className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <h5 className="font-medium">Hardware & Options</h5>
                    <p className="text-sm text-muted-foreground">
                      Select mounting hardware, operation types, and additional features
                    </p>
                  </div>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Options
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                <div className="space-y-4">
                  <Image className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <h5 className="font-medium">Materials Library</h5>
                    <p className="text-sm text-muted-foreground">
                      Browse fabrics, finishes, and materials from your inventory
                    </p>
                  </div>
                  <Button variant="outline">
                    <Image className="h-4 w-4 mr-2" />
                    Browse Materials
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                <div className="space-y-4">
                  <DollarSign className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <h5 className="font-medium">Cost Calculation</h5>
                    <p className="text-sm text-muted-foreground">
                      Automatic pricing based on materials, labor, and markup settings
                    </p>
                  </div>
                  <Button variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Calculate Price
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
        <div>
          <p className="font-medium text-green-900">Canvas Ready</p>
          <p className="text-sm text-green-700">
            Configure your {product?.name} using the tools above
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Save & Close
          </Button>
          <Button>
            Complete Setup
          </Button>
        </div>
      </div>
    </div>
  );
};