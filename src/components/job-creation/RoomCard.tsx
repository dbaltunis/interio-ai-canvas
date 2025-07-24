import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Ruler } from 'lucide-react';
import { SurfaceList } from './SurfaceList';

interface RoomCardProps {
  room: any;
  surfaces: any[];
  treatments: any[];
  onCreateSurface: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onDeleteSurface: (surfaceId: string) => void;
  onDeleteTreatment: (treatmentId: string) => void;
  onViewMeasurements: (surfaceId: string) => void;
}

export const RoomCard = ({ 
  room, 
  surfaces, 
  treatments, 
  onCreateSurface, 
  onDeleteRoom, 
  onDeleteSurface, 
  onDeleteTreatment, 
  onViewMeasurements 
}: RoomCardProps) => {
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [selectedSurface, setSelectedSurface] = useState(null);

  const handleCreateSurface = () => {
    onCreateSurface(room.id);
  };

  const handleDeleteRoom = () => {
    onDeleteRoom(room.id);
  };

  const handleViewMeasurements = (surfaceId: string) => {
    onViewMeasurements(surfaceId);
  };

  return (
    <Card className="bg-white shadow-sm border border-brand-secondary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{room.name}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={handleCreateSurface}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDeleteRoom}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <SurfaceList 
          surfaces={surfaces}
          treatments={treatments}
          onDeleteSurface={onDeleteSurface}
          onDeleteTreatment={onDeleteTreatment}
          onViewMeasurements={onViewMeasurements}
        />
        
      </CardContent>
    </Card>
  );
};
