import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Home, Square } from "lucide-react";

interface QuickTreatmentCreatorProps {
  projectId: string;
  onTreatmentCreated: () => void;
  existingRooms: any[];
  existingTreatments: any[];
  onQuickCreate?: (treatmentData: any) => Promise<any>; // Add this prop
}

export const QuickTreatmentCreator = ({ 
  projectId, 
  onTreatmentCreated, 
  existingRooms,
  existingTreatments,
  onQuickCreate // Add this
}: QuickTreatmentCreatorProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTreatmentType, setSelectedTreatmentType] = useState("");
  const [treatmentData, setTreatmentData] = useState({
    name: "",
    roomName: "",
    windowName: "",
    width: 60,
    height: 48,
    quantity: 1,
    unitPrice: 100
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const treatmentTypes = [
    { id: "curtains", name: "Curtains", icon: Home },
    { id: "blinds", name: "Blinds", icon: Square },
    { id: "drapes", name: "Drapes", icon: Home },
    { id: "shades", name: "Shades", icon: Square }
  ];

  const handleQuickCreate = async (treatmentType: string) => {
    setSelectedTreatmentType(treatmentType);
    setTreatmentData({
      ...treatmentData,
      name: `${treatmentType} Treatment`,
      roomName: existingRooms.length > 0 ? existingRooms[0].name : `Room ${existingRooms.length + 1}`,
      windowName: `Window 1`
    });
    setShowDialog(true);
  };

  const handleCreateTreatment = async () => {
    setIsCreating(true);
    try {
      const treatmentData = {
        type: selectedTreatmentType.toLowerCase(),
        name: treatmentData.name,
        roomName: treatmentData.roomName,
        windowName: treatmentData.windowName,
        width: treatmentData.width,
        height: treatmentData.height,
        quantity: treatmentData.quantity,
        unitPrice: treatmentData.unitPrice,
        projectId
      };

      if (onQuickCreate) {
        await onQuickCreate(treatmentData);
      } else {
        console.log("Creating treatment:", treatmentData);
      }
      
      toast({
        title: "Treatment Created",
        description: `${treatmentData.name} has been created successfully.`,
      });
      
      setShowDialog(false);
      onTreatmentCreated();
    } catch (error) {
      console.error("Failed to create treatment:", error);
      toast({
        title: "Error",
        description: "Failed to create treatment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicateTreatment = (treatment: any) => {
    setSelectedTreatmentType(treatment.treatment_type);
    setTreatmentData({
      name: `${treatment.product_name} (Copy)`,
      roomName: "New Room",
      windowName: "New Window",
      width: 60,
      height: 48,
      quantity: treatment.quantity || 1,
      unitPrice: treatment.unit_price || 100
    });
    setShowDialog(true);
  };

  return (
    <div className="space-y-4">
      {/* Quick Treatment Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Treatment Creation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {treatmentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover:bg-primary/5"
                  onClick={() => handleQuickCreate(type.name)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm">{type.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Existing Treatments - Quick Duplicate */}
      {existingTreatments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Duplicate Existing Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {existingTreatments.slice(0, 3).map((treatment) => (
                <div key={treatment.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{treatment.product_name || treatment.treatment_type}</p>
                    <p className="text-sm text-muted-foreground">
                      ${treatment.total_price || 0} • {treatment.quantity || 1} units
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicateTreatment(treatment)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Creation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create {selectedTreatmentType}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Treatment Name</Label>
              <Input
                id="name"
                value={treatmentData.name}
                onChange={(e) => setTreatmentData({...treatmentData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  value={treatmentData.roomName}
                  onChange={(e) => setTreatmentData({...treatmentData, roomName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="windowName">Window Name</Label>
                <Input
                  id="windowName"
                  value={treatmentData.windowName}
                  onChange={(e) => setTreatmentData({...treatmentData, windowName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width (inches)</Label>
                <Input
                  id="width"
                  type="number"
                  value={treatmentData.width}
                  onChange={(e) => setTreatmentData({...treatmentData, width: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (inches)</Label>
                <Input
                  id="height"
                  type="number"
                  value={treatmentData.height}
                  onChange={(e) => setTreatmentData({...treatmentData, height: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={treatmentData.quantity}
                  onChange={(e) => setTreatmentData({...treatmentData, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label htmlFor="unitPrice">Unit Price ($)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  value={treatmentData.unitPrice}
                  onChange={(e) => setTreatmentData({...treatmentData, unitPrice: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleCreateTreatment} 
                disabled={isCreating || !treatmentData.name}
                className="flex-1"
              >
                {isCreating ? "Creating..." : "Create Treatment"}
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
