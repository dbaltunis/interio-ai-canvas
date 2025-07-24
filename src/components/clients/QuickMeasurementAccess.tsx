import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from 'lucide-react';
import { MeasurementWorksheet } from '@/components/measurements/MeasurementWorksheet';

interface QuickMeasurementAccessProps {
  client: any;
  onSave: (measurement: any) => void;
}

export const QuickMeasurementAccess = ({ client, onSave }: QuickMeasurementAccessProps) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);

  useEffect(() => {
    // Fetch projects for the client
    const fetchProjects = async () => {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/projects?clientId=${client.id}`);
      const data = await response.json();
      setProjects(data);
    };

    fetchProjects();
  }, [client.id]);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setShowMeasurementForm(false);
    setSelectedMeasurement(null);
  };

  const handleNewMeasurement = () => {
    setShowMeasurementForm(true);
    setSelectedMeasurement(null);
  };

  const handleEditMeasurement = (measurement) => {
    setSelectedMeasurement(measurement);
    setShowMeasurementForm(true);
  };

  const handleDeleteMeasurement = async (measurementId) => {
    // Implement your delete logic here
    // Replace with your actual API endpoint
    await fetch(`/api/measurements/${measurementId}`, { method: 'DELETE' });
    // Refresh the project to update measurements
    setSelectedProject(prev => ({
      ...prev,
      measurements: prev.measurements.filter(m => m.id !== measurementId)
    }));
  };

  const handleSaveMeasurement = async (measurementData) => {
    // Implement your save logic here
    // Replace with your actual API endpoint
    const response = await fetch('/api/measurements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...measurementData, clientId: client.id, projectId: selectedProject.id }),
    });

    const newMeasurement = await response.json();

    onSave(newMeasurement);

    // Update the project with the new measurement
    setSelectedProject(prev => ({
      ...prev,
      measurements: [...(prev.measurements || []), newMeasurement]
    }));

    setShowMeasurementForm(false);
    setSelectedMeasurement(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Select a project to add measurements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {projects.map((project) => (
            <Button
              key={project.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleProjectSelect(project)}
            >
              {project.name}
            </Button>
          ))}
        </CardContent>
      </Card>
      
      {selectedProject && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{selectedProject.name}</CardTitle>
              <CardDescription>Manage measurements for this project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleNewMeasurement}>
                <Plus className="h-4 w-4 mr-2" />
                Add Measurement
              </Button>

              {selectedProject.measurements && selectedProject.measurements.length > 0 ? (
                <div className="space-y-2">
                  {selectedProject.measurements.map((measurement) => (
                    <div key={measurement.id} className="flex items-center justify-between">
                      <span>Measurement {measurement.id}</span>
                      <div className="space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => handleEditMeasurement(measurement)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteMeasurement(measurement.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No measurements yet.</p>
              )}
            </CardContent>
          </Card>
          
          {showMeasurementForm && !selectedMeasurement && (
            <MeasurementWorksheet
              client={client}
              project={selectedProject}
              onSave={handleSaveMeasurement}
            />
          )}
          
          {selectedMeasurement && (
            <MeasurementWorksheet
              client={client}
              project={selectedProject}
              existingMeasurement={selectedMeasurement}
              onSave={handleSaveMeasurement}
              readOnly={false}
            />
          )}
          
        </div>
      )}
    </div>
  );
};
