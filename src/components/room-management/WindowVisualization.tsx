
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ruler, Settings, Eye } from "lucide-react";

interface WindowVisualizationProps {
  room: any;
  surfaces: any[];
  treatments: any[];
  measurements: any[];
}

export const WindowVisualization = ({
  room,
  surfaces,
  treatments,
  measurements
}: WindowVisualizationProps) => {
  const getVisualizationStyle = (surface: any, treatment: any) => {
    if (!treatment) return "bg-gray-200 border-2 border-dashed border-gray-400";
    
    // Different styles based on treatment type
    switch (treatment.treatment_type) {
      case 'curtains':
        return "bg-gradient-to-b from-blue-100 to-blue-200 border-2 border-blue-300";
      case 'blinds':
        return "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 border-2 border-gray-400";
      case 'shutters':
        return "bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-300";
      case 'drapes':
        return "bg-gradient-to-b from-purple-100 to-purple-200 border-2 border-purple-300";
      default:
        return "bg-gradient-to-b from-green-100 to-green-200 border-2 border-green-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Room Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{room.name} Layout</span>
            <Badge variant="outline">{surfaces.length} Windows</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 min-h-[300px] p-4 bg-gray-50 rounded-lg">
            {surfaces.map((surface, index) => {
              const treatment = treatments.find(t => t.window_id === surface.id);
              const measurement = measurements.find(m => 
                m.measurements && Object.keys(m.measurements).length > 0
              );
              
              // Calculate relative size for visualization
              const maxWidth = Math.max(...surfaces.map(s => s.width || 60));
              const maxHeight = Math.max(...surfaces.map(s => s.height || 48));
              const relativeWidth = ((surface.width || 60) / maxWidth) * 120;
              const relativeHeight = ((surface.height || 48) / maxHeight) * 80;
              
              return (
                <div
                  key={surface.id}
                  className="relative flex flex-col items-center justify-center"
                >
                  {/* Window representation */}
                  <div
                    className={`rounded-lg flex items-center justify-center text-xs font-medium relative ${getVisualizationStyle(surface, treatment)}`}
                    style={{
                      width: `${relativeWidth}px`,
                      height: `${relativeHeight}px`,
                      minWidth: '80px',
                      minHeight: '60px'
                    }}
                  >
                    {treatment ? (
                      <div className="text-center">
                        <div className="font-semibold">{treatment.treatment_type}</div>
                        {treatment.fabric_type && (
                          <div className="text-xs opacity-75">{treatment.fabric_type}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500">No Treatment</div>
                    )}
                    
                    {/* Measurement indicator */}
                    {measurement && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Ruler className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Window details */}
                  <div className="mt-2 text-center">
                    <div className="font-medium text-sm">{surface.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {surface.width}" × {surface.height}"
                    </div>
                    {treatment && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        ${treatment.total_price?.toFixed(2) || '0.00'}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Treatment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatments.map((treatment) => {
              const surface = surfaces.find(s => s.id === treatment.window_id);
              return (
                <div key={treatment.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{surface?.name}</span>
                    <Badge>{treatment.treatment_type}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {treatment.fabric_type && (
                      <div>Fabric: {treatment.fabric_type}</div>
                    )}
                    {treatment.color && (
                      <div>Color: {treatment.color}</div>
                    )}
                    <div className="font-medium text-foreground">
                      Price: ${treatment.total_price?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Modify Treatments
        </Button>
        <Button variant="outline">
          <Ruler className="h-4 w-4 mr-2" />
          Review Measurements
        </Button>
        <Button>
          <Eye className="h-4 w-4 mr-2" />
          Generate Quote
        </Button>
      </div>
    </div>
  );
};
