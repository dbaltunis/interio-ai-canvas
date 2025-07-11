
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Zap } from "lucide-react";
import { useWindowCoveringTypes } from "@/hooks/useWindowCoveringTypes";

interface QuickTreatmentCreatorProps {
  onCreateTreatment: (treatmentData: any) => Promise<void>;
  isCreating?: boolean;
}

export const QuickTreatmentCreator = ({ onCreateTreatment, isCreating = false }: QuickTreatmentCreatorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: windowCoveringTypes } = useWindowCoveringTypes();
  
  const [formData, setFormData] = useState({
    roomName: "",
    windowName: "",
    type: "",
    name: "",
    width: 60,
    height: 48,
    quantity: 1,
    unitPrice: 150
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roomName || !formData.windowName || !formData.type || !formData.name) {
      return;
    }

    try {
      await onCreateTreatment(formData);
      
      // Reset form
      setFormData({
        roomName: "",
        windowName: "",
        type: "",
        name: "",
        width: 60,
        height: 48,
        quantity: 1,
        unitPrice: 150
      });
      
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to create quick treatment:", error);
    }
  };

  if (!isExpanded) {
    return (
      <Card className="mb-6 border-dashed border-2 border-muted hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <Button
            onClick={() => setIsExpanded(true)}
            variant="ghost"
            className="w-full h-16 text-muted-foreground hover:text-primary"
          >
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Quick Add Treatment</div>
                <div className="text-sm text-muted-foreground">Create room, window, and treatment in one step</div>
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Add Treatment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                value={formData.roomName}
                onChange={(e) => setFormData(prev => ({ ...prev, roomName: e.target.value }))}
                placeholder="e.g., Living Room"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="windowName">Window/Surface Name</Label>
              <Input
                id="windowName"
                value={formData.windowName}
                onChange={(e) => setFormData(prev => ({ ...prev, windowName: e.target.value }))}
                placeholder="e.g., Main Window"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Treatment Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment type" />
                </SelectTrigger>
                <SelectContent>
                  {windowCoveringTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Premium Blackout Curtains"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="width">Width (inches)</Label>
              <Input
                id="width"
                type="number"
                value={formData.width}
                onChange={(e) => setFormData(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="unitPrice">Unit Price ($)</Label>
              <Input
                id="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isCreating}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? "Creating..." : "Create Treatment"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
