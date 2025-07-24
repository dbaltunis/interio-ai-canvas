
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { WindowsCanvasInterface } from "./WindowsCanvasInterface";
import { TreatmentsGrid } from './TreatmentsGrid';
import { ConnectCalculateInterface } from './ConnectCalculateInterface';
import { useCreateProject } from "@/hooks/useProjects";

interface InteractiveProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: any;
}

export const InteractiveProjectDialog = ({ open, onOpenChange, client }: InteractiveProjectDialogProps) => {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    rooms: [],
    surfaces: []
  });

  const { mutate: createProject } = useCreateProject();

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreateSurface = (roomId: string) => {
    console.log("Creating surface for room:", roomId);
    // Implementation for creating surface
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Project Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={projectData.name}
                    onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    value={projectData.description}
                    onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                    placeholder="Enter project description"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <WindowsCanvasInterface
            project={projectData}
            onSave={(data) => setProjectData(data)}
          />
        );
      case 3:
        return (
          <TreatmentsGrid 
            projectId="temp"
          />
        );
      case 4:
        return (
          <ConnectCalculateInterface
            projectId="temp"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project - Step {step} of 4</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={step === 4 ? () => onOpenChange(false) : handleNext}
            >
              {step === 4 ? "Create Project" : "Next"}
              {step !== 4 && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
