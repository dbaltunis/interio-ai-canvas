
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { MeasurementWorksheet } from '@/components/measurements/MeasurementWorksheet';

interface WindowsCanvasInterfaceProps {
  project: any;
  onSave: (data: any) => void;
}

export const WindowsCanvasInterface = ({ project, onSave }: WindowsCanvasInterfaceProps) => {
  const [windows, setWindows] = useState<any[]>([]);
  const [newWindowName, setNewWindowName] = useState('');
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (project && project.windows) {
      setWindows(project.windows);
    }
  }, [project]);

  const handleAddWindow = () => {
    if (newWindowName.trim() !== '') {
      const newWindow = {
        id: Date.now(),
        name: newWindowName,
        measurements: []
      };
      setWindows([...windows, newWindow]);
      setNewWindowName('');
    }
  };

  const handleDeleteWindow = (windowId: number) => {
    setWindows(windows.filter(window => window.id !== windowId));
  };

  const handleOpenMeasurementForm = (window: any) => {
    setSelectedMeasurement(window);
    setShowMeasurementForm(true);
  };

  const handleSaveMeasurement = (measurementData: any) => {
    // Update the selected window with the new measurement data
    const updatedWindows = windows.map(window => {
      if (window.id === selectedMeasurement?.id) {
        return {
          ...window,
          measurements: [...(window.measurements || []), measurementData]
        };
      }
      return window;
    });

    setWindows(updatedWindows);
    setShowMeasurementForm(false);
    setSelectedMeasurement(null);

    // Save the updated project data
    onSave({ ...project, windows: updatedWindows });

    toast({
      title: "Measurement saved!",
      description: "The measurement has been saved successfully.",
    })
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Windows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Window Name"
              value={newWindowName}
              onChange={(e) => setNewWindowName(e.target.value)}
            />
            <Button type="button" onClick={handleAddWindow}>
              <Plus className="h-4 w-4 mr-2" />
              Add Window
            </Button>
          </div>

          {windows.map((window) => (
            <div key={window.id} className="flex items-center justify-between p-2 bg-brand-secondary/10 rounded-md">
              <span>{window.name}</span>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenMeasurementForm(window)}
                  className="mr-2"
                >
                  Add Measurement
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteWindow(window.id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {showMeasurementForm && selectedMeasurement && (
        <MeasurementWorksheet
          client={selectedMeasurement.client}
          project={project}
          existingMeasurement={selectedMeasurement}
          onSave={handleSaveMeasurement}
        />
      )}
      
    </div>
  );
};
