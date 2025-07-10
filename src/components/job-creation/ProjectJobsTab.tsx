import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCreateRoom, useRooms } from "@/hooks/useRooms";
import { useToast } from "@/hooks/use-toast";
import { Plus, Home, Package, Palette, Wrench, ArrowRight, CheckCircle } from "lucide-react";
import { RoomSelectionStep } from "./product-steps/RoomSelectionStep";
import { ProductDetailsStep } from "./product-steps/ProductDetailsStep";
import { ProductCanvasStep } from "./product-steps/ProductCanvasStep";

interface ProjectJobsTabProps {
  project: any;
  onProjectUpdate?: (updatedProject: any) => void;
}

export const ProjectJobsTab = ({ project, onProjectUpdate }: ProjectJobsTabProps) => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [step, setStep] = useState(1); // 1: rooms, 2: product details, 3: canvas
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomQuantity, setRoomQuantity] = useState(1);
  const [newRooms, setNewRooms] = useState([]);

  const createRoom = useCreateRoom();
  const projectId = project.id || project.project_id;
  const { data: existingRooms } = useRooms(projectId);
  const { toast } = useToast();

  const productTemplates = [
    { 
      id: 'curtains', 
      name: 'Curtains & Drapes', 
      icon: Home, 
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      description: 'Window treatments, panels, valances'
    },
    { 
      id: 'blinds', 
      name: 'Blinds & Shades', 
      icon: Package, 
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      description: 'Venetian, roller, roman blinds'
    },
    { 
      id: 'wallpaper', 
      name: 'Wallpaper', 
      icon: Palette, 
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      description: 'Wall coverings and treatments'
    },
    { 
      id: 'services', 
      name: 'Services', 
      icon: Wrench, 
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      description: 'Installation, consulting, repairs'
    }
  ];

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductDialog(true);
    setStep(1);
    setSelectedRooms([]);
    setNewRooms([]);
  };

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    try {
      console.log("Creating room with project:", project);
      console.log("Project ID:", project.id || project.project_id);
      
      const projectId = project.id || project.project_id;
      if (!projectId) {
        throw new Error("No valid project ID found");
      }
      
      const roomCount = (existingRooms?.length || 0) + 1;
      await createRoom.mutateAsync({
        name: `Room ${roomCount}`,
        project_id: projectId,
        room_type: 'living_room'
      });
      toast({
        title: "Room Added",
        description: "New room created. Now add products to it.",
      });
    } catch (error) {
      console.error("Room creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleRoomSelection = (roomId, checked) => {
    if (checked) {
      setSelectedRooms([...selectedRooms, roomId]);
    } else {
      setSelectedRooms(selectedRooms.filter(id => id !== roomId));
    }
  };

  const handleCreateNewRooms = async () => {
    const createdRooms = [];
    const projectId = project.id || project.project_id;
    
    if (!projectId) {
      toast({
        title: "Error",
        description: "No valid project ID found",
        variant: "destructive",
      });
      return [];
    }
    
    for (let i = 0; i < roomQuantity; i++) {
      const roomCount = (existingRooms?.length || 0) + i + 1;
      const roomName = newRooms[i] || `Room ${roomCount}`;
      try {
        console.log(`Creating room ${i + 1} with name: ${roomName}, project_id: ${projectId}`);
        const room = await createRoom.mutateAsync({
          name: roomName,
          project_id: projectId,
          room_type: 'living_room'
        });
        createdRooms.push(room.id);
      } catch (error) {
        console.error('Failed to create room:', error);
        toast({
          title: "Error",
          description: `Failed to create room: ${roomName}`,
          variant: "destructive",
        });
      }
    }
    setSelectedRooms([...selectedRooms, ...createdRooms]);
    return createdRooms;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (newRooms.length > 0) {
        await handleCreateNewRooms();
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      toast({
        title: "Opening Product Canvas",
        description: `Setting up ${selectedProduct?.name} for ${selectedRooms.length} room(s)`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Simple Project Header */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{project?.name}</h2>
            <p className="text-sm text-muted-foreground">Job #{project?.job_number}</p>
          </div>
        </div>
      </div>

      {/* Simple Room Creation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Add Rooms</h3>
            <p className="text-sm text-muted-foreground">Create rooms and add products to each one</p>
          </div>
          <Button onClick={handleCreateRoom} disabled={isCreatingRoom}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreatingRoom ? "Adding..." : "Add Room"}
          </Button>
        </div>

        {/* Product Templates - Now Clickable */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {productTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card 
                key={template.id} 
                className={`p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 ${template.color}`}
                onClick={() => handleProductClick(template)}
              >
                <div className="text-center space-y-2">
                  <Icon className="h-8 w-8 mx-auto text-gray-600" />
                  <p className="font-medium text-sm">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                  <div className="pt-2">
                    <Badge variant="secondary" className="text-xs">
                      Click to configure
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Product Configuration Dialog */}
        <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {selectedProduct && <selectedProduct.icon className="h-5 w-5" />}
                <span>Configure {selectedProduct?.name}</span>
                <Badge variant="outline">Step {step} of 3</Badge>
              </DialogTitle>
            </DialogHeader>

            {step === 1 && (
              <RoomSelectionStep 
                existingRooms={existingRooms || []}
                selectedRooms={selectedRooms}
                onRoomSelection={handleRoomSelection}
                newRooms={newRooms}
                setNewRooms={setNewRooms}
                roomQuantity={roomQuantity}
                setRoomQuantity={setRoomQuantity}
                onNext={handleNextStep}
              />
            )}

            {step === 2 && (
              <ProductDetailsStep 
                product={selectedProduct}
                selectedRooms={selectedRooms}
                existingRooms={existingRooms || []}
                onNext={handleNextStep}
                onBack={() => setStep(1)}
                onSave={(data) => {
                  console.log("Product configuration saved:", data);
                  // Here you could save to localStorage, state, or database
                }}
              />
            )}

            {step === 3 && (
              <ProductCanvasStep 
                product={selectedProduct}
                selectedRooms={selectedRooms}
                existingRooms={existingRooms || []}
                onClose={() => setShowProductDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Click on product cards above to configure them</li>
            <li>2. Select rooms and add measurements</li>
            <li>3. Use the canvas to design and customize</li>
            <li>4. Move to Quote to see pricing</li>
          </ol>
        </div>
      </div>
    </div>
  );
};