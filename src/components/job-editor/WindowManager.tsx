import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash } from 'lucide-react';
import { MeasurementWorksheet } from '@/components/measurements/MeasurementWorksheet';

interface WindowManagerProps {
  project: any;
  onSave: (data: any) => void;
}

export const WindowManager = ({ project, onSave }: WindowManagerProps) => {
  const [windows, setWindows] = useState(project.windows || []);
  const [newWindowName, setNewWindowName] = useState('');
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);

  useEffect(() => {
    setWindows(project.windows || []);
  }, [project.windows]);

  const handleAddWindow = () => {
    if (newWindowName.trim() !== '') {
      const newWindow = {
        id: Date.now(),
        name: newWindowName,
        measurements: [],
        client: project.client,
      };
      const updatedWindows = [...windows, newWindow];
      setWindows(updatedWindows);
      setNewWindowName('');
      onSave({ ...project, windows: updatedWindows });
    }
  };

  const handleEditWindow = (windowId: number) => {
    // Implement edit functionality
    console.log('Edit window:', windowId);
  };

  const handleDeleteWindow = (windowId: number) => {
    const updatedWindows = windows.filter(window => window.id !== windowId);
    setWindows(updatedWindows);
    onSave({ ...project, windows: updatedWindows });
  };

  const handleAddMeasurement = (window: any) => {
    setSelectedMeasurement({ ...window, client: project.client });
    setShowMeasurementForm(true);
  };

  const handleSaveMeasurement = (measurementData: any) => {
    setShowMeasurementForm(false);
    setSelectedMeasurement(null);
    // Integrate the new measurement into the window's data
    console.log('Measurement data saved:', measurementData);
    // Update the project with the new measurement
    onSave({ ...project, windows: windows.map(window => window.id === measurementData.id ? { ...window, measurements: [...(window.measurements || []), measurementData] } : window) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Windows</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-[1fr_150px] gap-4">
            <Input
              type="text"
              placeholder="Window Name"
              value={newWindowName}
              onChange={(e) => setNewWindowName(e.target.value)}
            />
            <Button onClick={handleAddWindow}>Add Window</Button>
          </div>
          <div className="space-y-2">
            {windows.map((window) => (
              <div key={window.id} className="flex items-center justify-between border rounded-md p-2">
                <span>{window.name}</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleAddMeasurement(window)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleEditWindow(window.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteWindow(window.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
