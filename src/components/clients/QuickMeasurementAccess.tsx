
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, Plus, X } from "lucide-react";
import { MeasurementWorksheet } from "../measurements/MeasurementWorksheet";
import { MeasurementsList } from "../measurements/MeasurementsList";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";

interface QuickMeasurementAccessProps {
  clientId: string;
  clientName: string;
  projectId?: string;
}

export const QuickMeasurementAccess = ({ 
  clientId, 
  clientName, 
  projectId 
}: QuickMeasurementAccessProps) => {
  const [showNewMeasurement, setShowNewMeasurement] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const { data: measurements = [] } = useClientMeasurements(clientId);

  const handleViewMeasurement = (measurement: any) => {
    setSelectedMeasurement(measurement);
    setViewMode('view');
  };

  const handleEditMeasurement = (measurement: any) => {
    setSelectedMeasurement(measurement);
    setViewMode('edit');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Measurements ({measurements.length})
          </div>
          <Dialog open={showNewMeasurement} onOpenChange={setShowNewMeasurement}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl w-[95vw] h-[95vh] flex flex-col p-0 gap-0">
              <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-semibold">
                    New Measurement - {clientName}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewMeasurement(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <MeasurementWorksheet
                  clientId={clientId}
                  projectId={projectId}
                  onSave={() => setShowNewMeasurement(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MeasurementsList
          clientId={clientId}
          projectId={projectId}
          onViewMeasurement={handleViewMeasurement}
          onEditMeasurement={handleEditMeasurement}
        />

        {/* View/Edit measurement dialog */}
        <Dialog 
          open={!!selectedMeasurement} 
          onOpenChange={() => setSelectedMeasurement(null)}
        >
          <DialogContent className="max-w-7xl w-[95vw] h-[95vh] flex flex-col p-0 gap-0">
            <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold">
                  {viewMode === 'view' ? 'View' : 'Edit'} Measurement - {clientName}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  {viewMode === 'view' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode('edit')}
                    >
                      Edit
                    </Button>
                  )}
                  {viewMode === 'edit' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode('view')}
                    >
                      View Only
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMeasurement(null)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {selectedMeasurement && (
                <MeasurementWorksheet
                  clientId={clientId}
                  projectId={projectId}
                  existingMeasurement={selectedMeasurement}
                  onSave={() => setSelectedMeasurement(null)}
                  readOnly={viewMode === 'view'}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
