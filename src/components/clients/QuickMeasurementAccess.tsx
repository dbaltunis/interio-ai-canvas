
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, Plus } from "lucide-react";
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
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Measurement - {clientName}</DialogTitle>
              </DialogHeader>
              <MeasurementWorksheet
                isOpen={showNewMeasurement}
                onClose={() => setShowNewMeasurement(false)}
                client={{ id: clientId, name: clientName }}
                project={projectId ? { id: projectId, name: "Project" } : undefined}
                onSave={() => setShowNewMeasurement(false)}
              />
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
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewMode === 'view' ? 'View' : 'Edit'} Measurement - {clientName}
              </DialogTitle>
            </DialogHeader>
            {selectedMeasurement && (
              <MeasurementWorksheet
                isOpen={!!selectedMeasurement}
                onClose={() => setSelectedMeasurement(null)}
                client={{ id: clientId, name: clientName }}
                project={projectId ? { id: projectId, name: "Project" } : undefined}
                existingMeasurement={selectedMeasurement}
                onSave={() => setSelectedMeasurement(null)}
                readOnly={viewMode === 'view'}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
