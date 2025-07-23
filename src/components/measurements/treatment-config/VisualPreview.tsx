
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VisualPreviewProps {
  measurements: any;
  treatmentConfig: any;
  photos: string[];
}

export const VisualPreview = ({
  measurements,
  treatmentConfig,
  photos
}: VisualPreviewProps) => {
  const windowWidth = parseFloat(measurements.width) || 100;
  const windowHeight = parseFloat(measurements.height) || 150;
  
  // Scale for preview (max 300px width)
  const scale = Math.min(300 / windowWidth, 200 / windowHeight);
  const previewWidth = windowWidth * scale;
  const previewHeight = windowHeight * scale;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Visual Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Background - Client Photo if available */}
            {photos.length > 0 && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 rounded"
                style={{ backgroundImage: `url(${photos[0]})` }}
              />
            )}
            
            {/* Window Frame */}
            <div 
              className="relative border-4 border-gray-600 bg-sky-100 mx-auto"
              style={{ 
                width: `${previewWidth}px`, 
                height: `${previewHeight}px`
              }}
            >
              {/* Treatment Overlay */}
              {treatmentConfig.treatmentType && (
                <div className="absolute inset-0">
                  {treatmentConfig.treatmentType === "curtains" && (
                    <div className="relative h-full">
                      {/* Curtain panels */}
                      <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-red-300 to-red-400 opacity-80 rounded-l">
                        <div className="w-full h-2 bg-red-500 opacity-60"></div>
                      </div>
                      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-red-300 to-red-400 opacity-80 rounded-r">
                        <div className="w-full h-2 bg-red-500 opacity-60"></div>
                      </div>
                      
                      {/* Rod */}
                      {treatmentConfig.rodTrack && (
                        <div className="absolute -top-2 left-0 right-0 h-1 bg-gray-700 rounded-full"></div>
                      )}
                    </div>
                  )}
                  
                  {treatmentConfig.treatmentType === "blinds" && (
                    <div className="relative h-full bg-white opacity-90">
                      {/* Horizontal slats */}
                      {Array.from({ length: Math.floor(previewHeight / 8) }).map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute left-0 right-0 h-1 bg-gray-300 border-b border-gray-400"
                          style={{ top: `${i * 8}px` }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {treatmentConfig.treatmentType === "shutters" && (
                    <div className="relative h-full bg-white border-2 border-gray-400">
                      {/* Shutter panels */}
                      <div className="absolute left-0 top-0 w-1/2 h-full border-r border-gray-400">
                        {/* Louvres */}
                        {Array.from({ length: Math.floor(previewHeight / 12) }).map((_, i) => (
                          <div 
                            key={i} 
                            className="absolute left-1 right-1 h-1 bg-gray-200 border border-gray-300 rounded"
                            style={{ top: `${i * 12 + 4}px` }}
                          />
                        ))}
                      </div>
                      <div className="absolute right-0 top-0 w-1/2 h-full">
                        {/* Louvres */}
                        {Array.from({ length: Math.floor(previewHeight / 12) }).map((_, i) => (
                          <div 
                            key={i} 
                            className="absolute left-1 right-1 h-1 bg-gray-200 border border-gray-300 rounded"
                            style={{ top: `${i * 12 + 4}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Motorization indicator */}
              {treatmentConfig.motorization && treatmentConfig.motorization.id !== "none" && (
                <div className="absolute top-1 right-1">
                  <Badge variant="secondary" className="text-xs">
                    {treatmentConfig.motorization.battery ? "🔋" : "🔌"} Motor
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Measurements overlay */}
            <div className="mt-2 text-center text-xs text-muted-foreground">
              {windowWidth}cm × {windowHeight}cm
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {treatmentConfig.treatmentType && (
              <div className="flex justify-between">
                <span>Treatment:</span>
                <span className="font-medium">{treatmentConfig.treatmentType}</span>
              </div>
            )}
            {treatmentConfig.rodTrack && (
              <div className="flex justify-between">
                <span>Hardware:</span>
                <span className="font-medium">{treatmentConfig.rodTrack.name}</span>
              </div>
            )}
            {treatmentConfig.fabric && (
              <div className="flex justify-between">
                <span>Fabric:</span>
                <span className="font-medium">{treatmentConfig.fabric.name}</span>
              </div>
            )}
            {treatmentConfig.motorization && treatmentConfig.motorization.id !== "none" && (
              <div className="flex justify-between">
                <span>Motor:</span>
                <span className="font-medium">{treatmentConfig.motorization.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
