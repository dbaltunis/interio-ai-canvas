import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MeasurementWorksheet } from '@/components/measurements/MeasurementWorksheet';

interface SurfaceListProps {
  surfaces: any[];
  treatments: any[];
  onDeleteSurface: (surfaceId: string) => void;
  onDeleteTreatment: (treatmentId: string) => void;
  onViewMeasurements: (surface: any) => void;
}

export const SurfaceList = ({ 
  surfaces, 
  treatments, 
  onDeleteSurface, 
  onDeleteTreatment, 
  onViewMeasurements 
}: SurfaceListProps) => {
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [selectedSurface, setSelectedSurface] = useState(null);

  const handleViewMeasurements = (surface: any) => {
    setSelectedSurface(surface);
    setShowMeasurementForm(true);
    onViewMeasurements(surface);
  };

  const handleSaveMeasurement = () => {
    setShowMeasurementForm(false);
    setSelectedSurface(null);
  };

  return (
    <div className="space-y-4">
      {surfaces.map((surface) => (
        <Card key={surface.id} className="bg-white shadow-sm border border-brand-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{surface.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewMeasurements(surface)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Measurements
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteSurface(surface.id)}>
                  Delete Surface
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-brand-neutral/80">
              {surface.description}
            </p>
          </CardContent>
        </Card>
      ))}
      
      {showMeasurementForm && selectedSurface && (
        <MeasurementWorksheet
          client={selectedSurface.client}
          project={selectedSurface.project}
          room={selectedSurface.room}
          surface={selectedSurface}
          treatment={selectedSurface.treatment}
          isJobFlow={true}
          onSave={handleSaveMeasurement}
        />
      )}
    </div>
  );
};
