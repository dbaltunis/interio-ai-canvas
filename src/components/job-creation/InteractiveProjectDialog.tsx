import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button";
import { RoomsGrid } from './RoomsGrid';
import { WindowsCanvasInterface } from './WindowsCanvasInterface';
import { TreatmentsGrid } from './TreatmentsGrid';
import { ConnectCalculateInterface } from './ConnectCalculateInterface';

interface InteractiveProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'rooms' | 'surfaces' | 'treatments' | 'connect';
  project: any;
  rooms: any[];
  surfaces: any[];
  treatments: any[];
  onCreateRoom?: (roomData?: { name: string; room_type: string }) => Promise<void>;
  onCreateSurface?: (roomId: string, surfaceType: string) => void;
  onCreateTreatment?: (roomId: string, surfaceId: string, treatmentType: string) => void;
}

export const InteractiveProjectDialog = ({
  isOpen,
  onClose,
  type,
  project,
  rooms,
  surfaces,
  treatments,
  onCreateRoom,
  onCreateSurface,
  onCreateTreatment,
}: InteractiveProjectDialogProps) => {
  const [dialogType, setDialogType] = useState(type);

  const renderContent = () => {
    switch (type) {
      case 'rooms':
        return (
          <RoomsGrid
            rooms={rooms}
            onCreateRoom={onCreateRoom}
            onCreateSurface={onCreateSurface}
            onBack={() => setDialogType('rooms')}
          />
        );
      case 'surfaces':
        return (
          <WindowsCanvasInterface
            project={project}
            onSave={(data) => {
              console.log('Surface data saved:', data);
              onClose();
            }}
          />
        );
      case 'treatments':
        return (
          <TreatmentsGrid
            rooms={rooms}
            surfaces={surfaces}
            treatments={treatments}
            onCreateTreatment={onCreateTreatment}
            onBack={() => setDialogType('treatments')}
          />
        );
      case 'connect':
        return (
          <ConnectCalculateInterface
            project={project}
            rooms={rooms}
            surfaces={surfaces}
            treatments={treatments}
            onBack={() => setDialogType('connect')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%] 2xl:max-w-[50%]">
        <DialogHeader>
          <DialogTitle>Interactive Project Setup</DialogTitle>
          <DialogDescription>
            Add rooms, surfaces, and treatments to your project.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        <div className="py-4 flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
