
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Home, Square, Package, DollarSign, Fabric, Wrench, Eye } from "lucide-react";

interface ProjectOverviewProps {
  project: any;
  rooms: any[];
  surfaces: any[];
  treatments: any[];
}

export const ProjectOverview = ({ project, rooms, surfaces, treatments }: ProjectOverviewProps) => {
  const totalValue = treatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
  const completedTreatments = treatments.filter(t => t.status === 'completed').length;
  const progressPercentage = treatments.length > 0 ? (completedTreatments / treatments.length) * 100 : 0;

  // Group treatments by room
  const treatmentsByRoom = rooms.map(room => ({
    ...room,
    treatments: treatments.filter(t => t.room_id === room.id),
    surfaces: surfaces.filter(s => s.room_id === room.id)
  }));

  // Material analysis
  const fabricTypes = [...new Set(treatments.map(t => t.fabric_type).filter(Boolean))];
  const totalFabricUsage = treatments.reduce((sum, t) => {
    const details = t.calculation_details ? JSON.parse(t.calculation_details) : {};
    return sum + (details.fabricRequired || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <p className="text-muted-foreground">Job #{project.job_number}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">${totalValue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Project Value</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{rooms.length}</p>
              <p className="text-sm text-muted-foreground">Rooms</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Square className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold">{surfaces.length}</p>
              <p className="text-sm text-muted-foreground">Windows</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold">{treatments.length}</p>
              <p className="text-sm text-muted-foreground">Treatments</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Room Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {treatmentsByRoom.map((room) => (
          <Card key={room.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{room.name}</span>
                <Badge variant="secondary">
                  {room.treatments.length} treatment{room.treatments.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Room Surfaces */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Windows & Surfaces
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {room.surfaces.map((surface) => (
                    <div key={surface.id} className="p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium">{surface.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {surface.width}" × {surface.height}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Treatments */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Treatments
                </h4>
                <div className="space-y-2">
                  {room.treatments.map((treatment) => (
                    <div key={treatment.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{treatment.product_name || treatment.treatment_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {treatment.fabric_type && `${treatment.fabric_type} • `}
                          {treatment.color && `${treatment.color} • `}
                          Qty: {treatment.quantity || 1}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">${(treatment.total_price || 0).toFixed(2)}</p>
                        <Badge variant={treatment.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {treatment.status || 'planned'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Total */}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">Room Total:</span>
                <span className="font-bold text-lg">
                  ${room.treatments.reduce((sum, t) => sum + (t.total_price || 0), 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Material Summary */}
      {fabricTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fabric className="h-5 w-5" />
              Material Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Fabric Types</h4>
                <div className="space-y-1">
                  {fabricTypes.map((fabric, index) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                      {fabric}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Total Fabric Usage</h4>
                <p className="text-2xl font-bold">{totalFabricUsage.toFixed(2)} yards</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Hardware Components</h4>
                <p className="text-sm text-muted-foreground">
                  {treatments.filter(t => t.hardware).length} treatments require hardware
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
