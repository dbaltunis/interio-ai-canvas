
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

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
  const { formatLength } = useMeasurementUnits();

  const getSurfaceTreatment = (surfaceId: string) => {
    return treatments.find(t => t.window_id === surfaceId);
  };

  const getSurfaceMeasurement = (surfaceId: string) => {
    return measurements.find(m => 
      m.measurements && 
      Object.keys(m.measurements).some(key => 
        key.includes(surfaceId) || key.includes('window')
      )
    );
  };

  const getClientImages = (measurement: any) => {
    if (!measurement?.photos) return [];
    try {
      return Array.isArray(measurement.photos) ? measurement.photos : JSON.parse(measurement.photos);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">{room.name} Visualization</h3>
        <p className="text-muted-foreground">
          Room type: {room.room_type} • {surfaces.length} windows
        </p>
      </div>

      {/* Room Layout */}
      <Card className="bg-gradient-to-b from-blue-50 to-blue-100 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-center text-blue-800">Room Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-white rounded-lg p-8 min-h-[400px] border-2 border-dashed border-blue-300">
            {/* Room representation */}
            <div className="absolute inset-4 border-4 border-gray-300 rounded-lg bg-gray-50">
              <div className="absolute top-2 left-2 text-xs text-gray-600 font-medium">
                {room.name}
              </div>
              
              {/* Windows positioned around the room */}
              <div className="grid grid-cols-2 gap-4 p-4 h-full">
                {surfaces.map((surface, index) => {
                  const treatment = getSurfaceTreatment(surface.id);
                  const measurement = getSurfaceMeasurement(surface.id);
                  const clientImages = getClientImages(measurement);
                  
                  return (
                    <div
                      key={surface.id}
                      className="relative bg-white border-2 border-blue-300 rounded-lg p-3 shadow-sm"
                    >
                      {/* Window representation */}
                      <div className="bg-sky-100 border border-sky-300 rounded p-2 mb-2">
                        <div className="text-xs font-medium text-center">{surface.name}</div>
                        <div className="text-xs text-center text-muted-foreground">
                          {formatLength(surface.width || 60)} × {formatLength(surface.height || 48)}
                        </div>
                      </div>

                      {/* Client Images */}
                      {clientImages.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs font-medium mb-1">Client Photos:</div>
                          <div className="grid grid-cols-2 gap-1">
                            {clientImages.slice(0, 4).map((image: any, imgIndex: number) => (
                              <img
                                key={imgIndex}
                                src={image.url || image}
                                alt={`Client photo ${imgIndex + 1}`}
                                className="w-full h-8 object-cover rounded border"
                              />
                            ))}
                          </div>
                          {clientImages.length > 4 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              +{clientImages.length - 4} more photos
                            </div>
                          )}
                        </div>
                      )}

                      {/* Treatment visualization */}
                      {treatment ? (
                        <div className="space-y-1">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              treatment.treatment_type.includes('curtain') || treatment.treatment_type.includes('drape')
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {treatment.treatment_type}
                          </Badge>
                          
                          {treatment.fabric_type && (
                            <div className="text-xs text-muted-foreground">
                              Fabric: {treatment.fabric_type}
                            </div>
                          )}
                          
                          {treatment.color && (
                            <div className="text-xs text-muted-foreground">
                              Color: {treatment.color}
                            </div>
                          )}
                          
                          {treatment.total_price && (
                            <div className="text-xs font-medium text-green-600">
                              ${treatment.total_price.toFixed(2)}
                            </div>
                          )}

                          {/* Treatment visualization overlay */}
                          <div 
                            className={`absolute inset-0 rounded-lg opacity-30 pointer-events-none ${
                              treatment.treatment_type.includes('curtain') || treatment.treatment_type.includes('drape')
                                ? 'bg-gradient-to-b from-purple-200 to-purple-400'
                                : 'bg-gradient-to-b from-gray-200 to-gray-400'
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-2">
                          No treatment selected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Summary */}
      {treatments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Treatment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {treatments.map((treatment) => (
                <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{treatment.product_name || treatment.treatment_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {treatment.fabric_type && `${treatment.fabric_type} • `}
                      {treatment.color && `${treatment.color} • `}
                      Qty: {treatment.quantity || 1}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${treatment.total_price?.toFixed(2) || '0.00'}</div>
                    <div className="text-sm text-muted-foreground">
                      ${treatment.unit_price?.toFixed(2) || '0.00'} each
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-bold">
                  <span>Total Room Cost:</span>
                  <span>${treatments.reduce((sum, t) => sum + (t.total_price || 0), 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
