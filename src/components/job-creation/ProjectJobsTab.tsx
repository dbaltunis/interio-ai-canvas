import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCreateRoom, useRooms } from "@/hooks/useRooms";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useProductTemplates } from "@/hooks/useProductTemplates";
import { useToast } from "@/hooks/use-toast";
import { Plus, Home, Package, Palette, Wrench, ArrowRight, CheckCircle, MapPin, Square, Settings2 } from "lucide-react";
import { WindowManagementSection } from "./WindowManagementSection";
import { ProjectStats } from "./ProjectStats";
import { RoomSelectionStep } from "./product-steps/RoomSelectionStep";
import { ProductDetailsStep } from "./product-steps/ProductDetailsStep";
import { ProductCanvasStep } from "./product-steps/ProductCanvasStep";
import { supabase } from "@/integrations/supabase/client";

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
  const projectId = project?.project_id || project?.id;
  const { data: existingRooms, isLoading: roomsLoading } = useRooms(projectId);
  const { data: treatments, isLoading: treatmentsLoading } = useTreatments(projectId);
  const { data: surfaces, isLoading: surfacesLoading } = useSurfaces(projectId);
  const { templates: dbProductTemplates, isLoading: templatesLoading } = useProductTemplates();
  const { toast } = useToast();

  // Debug logging for data fetching
  console.log("ProjectJobsTab - Data Summary:", {
    projectId,
    project: project,
    roomsCount: existingRooms?.length || 0,
    treatmentsCount: treatments?.length || 0,
    surfacesCount: surfaces?.length || 0,
    templatesCount: dbProductTemplates?.length || 0,
    roomsLoading,
    treatmentsLoading,
    surfacesLoading,
    templatesLoading,
    existingRooms: existingRooms
  });

  // Don't render anything if we don't have a valid project
  if (!project || !projectId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  // Check if project has a temporary ID (not yet saved to database)
  const isTemporaryProject = !projectId || projectId.toString().startsWith('temp-') || projectId.toString().length < 10;
  if (isTemporaryProject) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Saving project...</p>
          <p className="text-sm text-gray-500">Please wait while your project is being created.</p>
        </div>
      </div>
    );
  }

  // Map database templates to UI format with icons and colors
  const getProductIcon = (productType: string) => {
    switch (productType.toLowerCase()) {
      case 'curtains':
      case 'drapes':
        return Home;
      case 'blinds':
      case 'shades':
        return Package;
      case 'wallpaper':
        return Palette;
      case 'services':
        return Wrench;
      default:
        return Package;
    }
  };

  const getProductColor = (productType: string) => {
    switch (productType.toLowerCase()) {
      case 'curtains':
      case 'drapes':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'blinds':
      case 'shades':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'wallpaper':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      case 'services':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const productTemplates = dbProductTemplates
    ?.filter(template => template.active)
    ?.map(template => ({
      id: template.id,
      name: template.name,
      icon: getProductIcon(template.product_type),
      color: getProductColor(template.product_type),
      description: template.description || `${template.product_type} products`,
      template // Include the full template data for later use
    })) || [];

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
      console.log("=== CREATING ROOM ===");
      console.log("Creating room with project:", project);
      
      const projectId = project.project_id || project.id;
      if (!projectId) {
        throw new Error("No valid project ID found");
      }

      // Verify project exists in database before creating room
      const { data: projectExists } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .single();

      if (!projectExists) {
        throw new Error(`Project ${projectId} does not exist in database`);
      }

      console.log("Project verified, creating room...");
      
      const roomCount = (existingRooms?.length || 0) + 1;
      const roomData = {
        name: `Room ${roomCount}`,
        project_id: projectId,
        room_type: 'living_room'
      };
      console.log("Room data to create:", roomData);
      
      const newRoom = await createRoom.mutateAsync(roomData);
      console.log("Room created successfully:", newRoom);
      
      toast({
        title: "Room Added",
        description: `Room ${roomCount} created successfully.`,
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
    const projectId = project.project_id || project.id;
    
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

  const projectTotal = treatments?.reduce((sum, t) => sum + (t.total_price || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Project Statistics */}
      <ProjectStats
        roomsCount={existingRooms?.length || 0}
        surfacesCount={surfaces?.length || 0}
        treatmentsCount={treatments?.length || 0}
        projectTotal={projectTotal}
      />

      {/* Window Management Section */}
      <WindowManagementSection 
        projectId={projectId} 
        rooms={existingRooms || []} 
      />

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
          {templatesLoading ? (
            // Loading state
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-4 animate-pulse">
                <div className="text-center space-y-2">
                  <div className="h-8 w-8 mx-auto bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </Card>
            ))
          ) : productTemplates.length > 0 ? (
            // Product templates
            productTemplates.map((template) => {
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
                        {template.name.toLowerCase()} products
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            // Empty state
            <div className="col-span-full">
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Templates</h3>
                <p className="text-gray-500 mb-4">
                  Create product templates in Settings to get started with job configuration.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/settings?tab=products'}
                >
                  Go to Settings
                </Button>
              </Card>
            </div>
          )}
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
                onBack={() => setStep(2)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Project Summary - Show Created Items */}
        {(existingRooms?.length > 0 || treatments?.length > 0 || surfaces?.length > 0) && (
          <div className="bg-white rounded-lg border p-4 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Project Progress
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rooms */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Rooms ({existingRooms?.length || 0})</span>
                </div>
                {roomsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : existingRooms?.length > 0 ? (
                  <div className="space-y-1">
                    {existingRooms.slice(0, 3).map((room) => (
                      <div key={room.id} className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
                        {room.name}
                      </div>
                    ))}
                    {existingRooms.length > 3 && (
                      <div className="text-xs text-gray-500">+{existingRooms.length - 3} more</div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No rooms created yet</p>
                )}
              </div>

              {/* Windows/Surfaces */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Square className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Windows ({surfaces?.length || 0})</span>
                </div>
                {surfacesLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : surfaces?.length > 0 ? (
                  <div className="space-y-1">
                    {surfaces.slice(0, 3).map((surface) => (
                      <div key={surface.id} className="text-sm text-gray-600 bg-purple-50 px-2 py-1 rounded">
                        {surface.name}
                      </div>
                    ))}
                    {surfaces.length > 3 && (
                      <div className="text-xs text-gray-500">+{surfaces.length - 3} more</div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No windows created yet</p>
                )}
              </div>

              {/* Treatments */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Treatments ({treatments?.length || 0})</span>
                </div>
                {treatmentsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : treatments?.length > 0 ? (
                  <div className="space-y-1">
                    {treatments.slice(0, 3).map((treatment) => (
                      <div key={treatment.id} className="text-sm text-gray-600 bg-green-50 px-2 py-1 rounded">
                        {treatment.treatment_type}
                        {treatment.product_name && ` - ${treatment.product_name}`}
                      </div>
                    ))}
                    {treatments.length > 3 && (
                      <div className="text-xs text-gray-500">+{treatments.length - 3} more</div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No treatments created yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Click "Add Room" to create rooms for your project</li>
            <li>2. Click on product cards above to configure treatments</li>
            <li>3. Select rooms and add measurements in the dialog</li>
            <li>4. Use the canvas to design and customize</li>
            <li>5. Move to Quote tab to see pricing</li>
          </ol>
        </div>
      </div>
    </div>
  );
};