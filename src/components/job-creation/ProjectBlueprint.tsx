
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Square, Package } from "lucide-react";

interface ProjectBlueprintProps {
  rooms: any[];
  surfaces: any[];
  treatments: any[];
  projectTotal: number;
}

export const ProjectBlueprint = ({ rooms, surfaces, treatments, projectTotal }: ProjectBlueprintProps) => {
  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Project Blueprint
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Home className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{rooms.length}</span>
            </div>
            <p className="text-sm text-gray-600">Rooms</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Square className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{surfaces.length}</span>
            </div>
            <p className="text-sm text-gray-600">Surfaces</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{treatments.length}</span>
            </div>
            <p className="text-sm text-gray-600">Treatments</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Project Value</span>
            <span className="text-2xl font-bold text-green-600">${projectTotal.toFixed(2)}</span>
          </div>
        </div>

        {rooms.length > 0 && (
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold mb-2">Room Overview</h4>
            <div className="space-y-2">
              {rooms.slice(0, 3).map((room: any) => {
                const roomSurfaces = surfaces.filter(s => s.room_id === room.id);
                const roomTreatments = treatments.filter(t => t.room_id === room.id);
                return (
                  <div key={room.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{room.name}</span>
                    <span className="text-gray-600">
                      {roomSurfaces.length} surfaces • {roomTreatments.length} treatments
                    </span>
                  </div>
                );
              })}
              {rooms.length > 3 && (
                <div className="text-sm text-gray-500 text-center">
                  +{rooms.length - 3} more rooms
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
