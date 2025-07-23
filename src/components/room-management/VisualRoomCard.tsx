import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  Ruler, 
  Eye, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Copy
} from "lucide-react";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { EnhancedMeasurementWorksheet } from "../measurements/EnhancedMeasurementWorksheet";
import { WindowVisualization } from "./WindowVisualization";
import { TreatmentSelector } from "./TreatmentSelector";

interface VisualRoomCardProps {
  room: any;
  clientId?: string;
  onCreateSurface: (roomId: string, surfaceType: string) => void;
  onCreateTreatment: (roomId: string, surfaceId: string, treatmentType: string) => void;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
}

export const VisualRoomCard = ({
  room,
  clientId,
  onCreateSurface,
  onCreateTreatment,
  onUpdateSurface
}: VisualRoomCardProps) => {
  const [selectedWindow, setSelectedWindow] = useState<any>(null);
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [showTreatmentSelector, setShowTreatmentSelector] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);

  const { data: surfaces = [] } = useSurfaces(room.project_id);
  const { data: treatments = [] } = useTreatments(room.project_id);
  const { data: clientMeasurements = [] } = useClientMeasurements(clientId);
  const { units, formatLength } = useMeasurementUnits();

  const roomSurfaces = surfaces.filter(s => s.room_id === room.id);
  const roomTreatments = treatments.filter(t => t.room_id === room.id);

  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return `${currencySymbols[units.currency] || units.currency}${amount.toFixed(2)}`;
  };

  const getMeasurementStatus = (surface: any) => {
    const hasMeasurement = clientMeasurements.some(m => 
      m.room_id === room.id && m.measurements && 
      typeof m.measurements === 'object' && 
      m.measurements !== null &&
      Object.keys(m.measurements).length > 0
    );
    return hasMeasurement ? 'measured' : 'not_measured';
  };

  const getTreatmentForSurface = (surfaceId: string) => {
    return roomTreatments.find(t => t.window_id === surfaceId);
  };

  const handleMeasureWindow = (surface: any) => {
    setSelectedWindow(surface);
    setShowMeasurement(true);
  };

  const handleAddTreatment = (surface: any) => {
    setSelectedWindow(surface);
    setShowTreatmentSelector(true);
  };

  const handleVisualizeRoom = () => {
    setShowVisualization(true);
  };

  const roomTotal = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{room.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{room.room_type}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{formatCurrency(roomTotal)}</Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={handleVisualizeRoom}
              >
                <Eye className="h-3 w-3 mr-1" />
                Visualize
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Windows Grid */}
          <div className="grid grid-cols-2 gap-3">
            {roomSurfaces.map((surface) => {
              const measurementStatus = getMeasurementStatus(surface);
              const treatment = getTreatmentForSurface(surface.id);
              
              return (
                <Card key={surface.id} className="p-3 bg-muted/30">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{surface.name}</span>
                      <div className="flex items-center gap-1">
                        {measurementStatus === 'measured' ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-orange-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {formatLength(surface.width || 60)} × {formatLength(surface.height || 48)}
                    </div>
                    
                    {treatment && (
                      <Badge variant="secondary" className="text-xs">
                        {treatment.treatment_type}
                      </Badge>
                    )}
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 h-6"
                        onClick={() => handleMeasureWindow(surface)}
                      >
                        <Ruler className="h-2 w-2 mr-1" />
                        {measurementStatus === 'measured' ? 'Edit' : 'Measure'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 h-6"
                        onClick={() => handleAddTreatment(surface)}
                      >
                        <Settings className="h-2 w-2 mr-1" />
                        Treatment
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {/* Add Window Button */}
            <Card 
              className="p-3 bg-muted/30 border-dashed border-2 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onCreateSurface(room.id, 'window')}
            >
              <div className="flex flex-col items-center justify-center h-full min-h-[80px] text-muted-foreground">
                <Plus className="h-6 w-6 mb-1" />
                <span className="text-xs">Add Window</span>
              </div>
            </Card>
          </div>

          {/* Previous Measurements for Returning Clients */}
          {clientId && clientMeasurements.length > 0 && (
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Previous Measurements</span>
                <Button size="sm" variant="ghost" className="text-xs">
                  <Copy className="h-3 w-3 mr-1" />
                  Copy from Previous
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {clientMeasurements.length} measurement sets available
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Measurement Dialog */}
      <Dialog open={showMeasurement} onOpenChange={setShowMeasurement}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Configure Treatment - {selectedWindow?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[85vh]">
            {selectedWindow && (
              <EnhancedMeasurementWorksheet
                clientId={clientId || ""}
                projectId={room.project_id}
                roomId={room.id}
                surfaceId={selectedWindow.id}
                surfaceName={selectedWindow.name}
                existingMeasurement={clientMeasurements.find(m => 
                  m.room_id === room.id && 
                  typeof m.measurements === 'object' && 
                  m.measurements !== null &&
                  'surface_id' in m.measurements &&
                  m.measurements.surface_id === selectedWindow.id
                )}
                onSave={() => setShowMeasurement(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Treatment Selector Dialog */}
      <Dialog open={showTreatmentSelector} onOpenChange={setShowTreatmentSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Select Treatment - {selectedWindow?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedWindow && (
            <TreatmentSelector
              surface={selectedWindow}
              room={room}
              onTreatmentSelect={(treatmentType) => {
                onCreateTreatment(room.id, selectedWindow.id, treatmentType);
                setShowTreatmentSelector(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Room Visualization Dialog */}
      <Dialog open={showVisualization} onOpenChange={setShowVisualization}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Room Visualization - {room.name}</DialogTitle>
          </DialogHeader>
          <WindowVisualization
            room={room}
            surfaces={roomSurfaces}
            treatments={roomTreatments}
            measurements={clientMeasurements.filter(m => m.room_id === room.id)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
