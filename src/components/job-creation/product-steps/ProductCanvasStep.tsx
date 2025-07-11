import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Edit3, 
  Eye, 
  Save, 
  Palette, 
  Ruler, 
  Settings,
  Image,
  DollarSign,
  Home,
  Square,
  Maximize2,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useJobHandlers } from "@/components/job-creation/JobHandlers";
import { useToast } from "@/hooks/use-toast";

interface ProductCanvasStepProps {
  product: any;
  selectedRooms: string[];
  existingRooms: any[];
  productConfigurationData?: any;
  onClose: () => void;
  onBack?: () => void;
}

export const ProductCanvasStep = ({
  product,
  selectedRooms,
  existingRooms,
  productConfigurationData,
  onClose,
  onBack
}: ProductCanvasStepProps) => {
  const [activeRoom, setActiveRoom] = useState(selectedRooms[0]);
  const [isDesignActive, setIsDesignActive] = useState(false);
  const { toast } = useToast();
  
  // Get initial project ID from existingRooms
  const initialProjectId = existingRooms[0]?.project_id;
  
  // Fetch all project data
  const { data: allRooms, refetch: refetchRooms } = useRooms(initialProjectId);
  const { data: allSurfaces, refetch: refetchSurfaces } = useSurfaces(initialProjectId);
  const { data: allTreatments, refetch: refetchTreatments } = useTreatments(initialProjectId);
  const { windowCoverings } = useWindowCoverings();
  
  // Use the job handlers for creating treatments
  const { handleCreateTreatment } = useJobHandlers({ 
    project_id: initialProjectId,
    id: initialProjectId 
  });

  // Final project ID - try multiple sources
  const projectId = initialProjectId || allRooms?.[0]?.project_id;

  // Debug logging
  console.log("Canvas Debug - Initial Project ID:", initialProjectId);
  console.log("Canvas Debug - Final Project ID:", projectId);
  console.log("Canvas Debug - Product Configuration Data:", productConfigurationData);
  console.log("Canvas Debug - Existing rooms:", existingRooms);
  console.log("Canvas Debug - Selected rooms:", selectedRooms);
  console.log("Canvas Debug - All treatments:", allTreatments);
  console.log("Canvas Debug - All rooms:", allRooms);
  console.log("Canvas Debug - All surfaces:", allSurfaces);

  const handleRefresh = () => {
    refetchRooms();
    refetchSurfaces();
    refetchTreatments();
  };

  const handleSaveConfiguration = async () => {
    if (!productConfigurationData || selectedRooms.length === 0) {
      toast({
        title: "No Configuration Data",
        description: "Please configure the product before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create treatments for all selected rooms
      for (const roomId of selectedRooms) {
        console.log("Creating treatment for room:", roomId);
        
        // Get the first surface for this room, or create one if none exists
        const roomSurfaces = allSurfaces?.filter(s => s.room_id === roomId) || [];
        let surfaceId = roomSurfaces[0]?.id;
        
        // Create treatment data from the configuration
        const treatmentData = {
          product_name: productConfigurationData.template?.name || product.name,
          treatment_type: productConfigurationData.template?.product_type || 'curtain',
          total_price: productConfigurationData.calculation?.totalPrice || 0,
          material_cost: productConfigurationData.calculation?.fabricPrice || 0,
          labor_cost: productConfigurationData.calculation?.manufacturingPrice || 0,
          fabric_type: productConfigurationData.fabric?.name,
          measurements: productConfigurationData.measurements,
          fabric_details: productConfigurationData.fabric,
          treatment_details: productConfigurationData.template,
          calculation_details: productConfigurationData.calculation,
          notes: `Configured via product template: ${product.name}`
        };

        console.log("Treatment data to save:", treatmentData);
        
        await handleCreateTreatment(roomId, surfaceId || "", treatmentData.treatment_type, treatmentData);
      }

      // Refresh data after creating treatments
      await Promise.all([
        refetchRooms(),
        refetchSurfaces(), 
        refetchTreatments()
      ]);

      toast({
        title: "Configuration Saved",
        description: `${product.name} has been configured for ${selectedRooms.length} room(s).`,
      });

      // Close the dialog after successful save
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error("Failed to save configuration:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save the product configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoomName = (roomId: string) => {
    const room = existingRooms.find(r => r.id === roomId) || allRooms?.find(r => r.id === roomId);
    return room?.name || `Room ${roomId}`;
  };

  const getRoomData = (roomId: string) => {
    const room = allRooms?.find(r => r.id === roomId);
    const surfaces = allSurfaces?.filter(s => s.room_id === roomId) || [];
    const treatments = allTreatments?.filter(t => t.room_id === roomId) || [];
    return { room, surfaces, treatments };
  };

  const getWindowCoveringName = (treatmentType: string) => {
    const covering = windowCoverings.find(wc => 
      wc.name.toLowerCase().includes(treatmentType.toLowerCase()) ||
      treatmentType.toLowerCase().includes(wc.name.toLowerCase())
    );
    return covering?.name || treatmentType;
  };

  const renderRoomVisualization = (roomId: string) => {
    const { room, surfaces, treatments } = getRoomData(roomId);
    
    if (!room) return null;

    return (
      <div className="space-y-4">
        {/* Room Header */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border">
          <div className="flex items-center space-x-3">
            <Home className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">{room.name}</h4>
              <p className="text-sm text-blue-700 capitalize">{room.room_type?.replace('_', ' ')}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white">
            {surfaces.length} Surface{surfaces.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Room Layout Visualization */}
        <div className="bg-gray-50 rounded-lg p-6 min-h-[300px] relative border-2 border-dashed border-gray-300">
          <div className="absolute top-2 left-2">
            <Badge variant="secondary">Room Layout</Badge>
          </div>
          
          {/* Room representation */}
          <div className="mt-8 relative">
            {/* Room outline */}
            <div className="w-full h-48 border-4 border-gray-400 bg-white/50 rounded-lg relative overflow-hidden">
              {/* Floor pattern */}
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-amber-100 to-amber-200"></div>
              
              {/* Surfaces positioning */}
              {surfaces.map((surface, index) => {
                const isWindow = surface.surface_type === 'window';
                const surfaceTreatments = treatments.filter(t => t.window_id === surface.id);
                
                // Position surfaces around the room perimeter
                const positions = [
                  { top: '5px', left: '20%', width: '30%', height: '8px' }, // Top wall
                  { top: '20%', right: '5px', width: '8px', height: '30%' }, // Right wall
                  { bottom: '5px', left: '50%', width: '30%', height: '8px' }, // Bottom wall
                  { top: '50%', left: '5px', width: '8px', height: '30%' }, // Left wall
                ];
                
                const position = positions[index % positions.length];
                
                return (
                  <div
                    key={surface.id}
                    className={`absolute ${isWindow ? 'bg-blue-200 border-blue-400' : 'bg-gray-200 border-gray-400'} border-2 rounded`}
                    style={position}
                    title={`${surface.name} - ${surface.surface_type}`}
                  >
                    {/* Surface icon */}
                    <div className="flex items-center justify-center h-full">
                      {isWindow ? (
                        <Square className="h-3 w-3 text-blue-600" />
                      ) : (
                        <Maximize2 className="h-3 w-3 text-gray-600" />
                      )}
                    </div>
                    
                    {/* Treatment indicator */}
                    {surfaceTreatments.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white">
                        <span className="text-xs text-white font-bold flex items-center justify-center h-full">
                          {surfaceTreatments.length}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Room center label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-600">{room.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{room.room_type?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Surfaces and Treatments Details */}
        <div className="grid gap-4">
          {surfaces.map((surface) => {
            const surfaceTreatments = treatments.filter(t => t.window_id === surface.id);
            
            return (
              <Card key={surface.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {surface.surface_type === 'window' ? (
                      <Square className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Maximize2 className="h-4 w-4 text-gray-600" />
                    )}
                    <div>
                      <h5 className="font-medium">{surface.name}</h5>
                      <p className="text-sm text-muted-foreground capitalize">
                        {surface.surface_type} • {surface.width}" × {surface.height}"
                      </p>
                    </div>
                  </div>
                  <Badge variant={surface.surface_type === 'window' ? 'default' : 'secondary'}>
                    {surface.surface_type}
                  </Badge>
                </div>
                
                {/* Treatments for this surface */}
                {surfaceTreatments.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h6 className="text-sm font-medium mb-2 text-green-700">Window Treatments:</h6>
                    <div className="space-y-2">
                      {surfaceTreatments.map((treatment) => (
                        <div key={treatment.id} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                          <div className="flex items-center space-x-2">
                            <Palette className="h-3 w-3 text-green-600" />
                            <div>
                              <p className="text-sm font-medium">{getWindowCoveringName(treatment.treatment_type)}</p>
                              {treatment.fabric_type && (
                                <p className="text-xs text-muted-foreground">Fabric: {treatment.fabric_type}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">${treatment.total_price || 0}</p>
                            <Badge variant="outline" className="text-xs">
                              {treatment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {surfaceTreatments.length === 0 && surface.surface_type === 'window' && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground italic">No treatments assigned yet</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h3 className="text-lg font-semibold mb-2">Project Visualization Canvas</h3>
          <p className="text-sm text-muted-foreground">
            Visual overview of your {product?.name} configuration across all rooms
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Room Selector */}
      <div className="flex flex-wrap gap-2">
        {selectedRooms.map((roomId) => (
          <Button
            key={roomId}
            variant={activeRoom === roomId ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveRoom(roomId)}
            className="relative"
          >
            <Home className="h-3 w-3 mr-2" />
            {getRoomName(roomId)}
            {activeRoom === roomId && (
              <CheckCircle className="h-3 w-3 ml-2" />
            )}
          </Button>
        ))}
      </div>

      {/* Canvas Content */}
      <Card className="min-h-[500px]">
        <div className="p-6">
          {isDesignActive ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Design Mode: {getRoomName(activeRoom)}
                </h4>
                <Badge variant="default">Active Design</Badge>
              </div>
              
              {/* Room Visualization */}
              {renderRoomVisualization(activeRoom)}
            </div>
          ) : (
            <div className="text-center min-h-[400px] flex items-center justify-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Project Overview</h4>
                  <p className="text-muted-foreground">Ready to visualize your {product?.name} configuration</p>
                </div>
                
                {/* Show curtain configuration data if available */}
                {productConfigurationData && (
                  <Card className="p-4 bg-blue-50 border-blue-200 max-w-lg mx-auto">
                    <div className="text-center space-y-2">
                      <h5 className="font-medium text-blue-900">✅ Curtain Configuration Loaded</h5>
                      <div className="text-left text-sm space-y-1">
                        {productConfigurationData.template?.name && (
                          <p><strong>Treatment:</strong> {productConfigurationData.template.name}</p>
                        )}
                        {productConfigurationData.measurements?.railWidth && (
                          <p><strong>Rail Width:</strong> {productConfigurationData.measurements.railWidth}cm</p>
                        )}
                        {productConfigurationData.measurements?.dropHeight && (
                          <p><strong>Drop:</strong> {productConfigurationData.measurements.dropHeight}cm</p>
                        )}
                        {productConfigurationData.fabric?.name && (
                          <p><strong>Fabric:</strong> {productConfigurationData.fabric.name}</p>
                        )}
                        {productConfigurationData.calculation?.totalPrice && (
                          <p><strong>Total Price:</strong> ${productConfigurationData.calculation.totalPrice}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-blue-50 rounded-lg border">
                    <Home className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <p className="font-medium">{allRooms?.length || 0} Rooms</p>
                    <p className="text-sm text-muted-foreground">Created</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border">
                    <Square className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <p className="font-medium">{allSurfaces?.length || 0} Surfaces</p>
                    <p className="text-sm text-muted-foreground">Defined</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border">
                    <Palette className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <p className="font-medium">{allTreatments?.length || 0} Treatments</p>
                    <p className="text-sm text-muted-foreground">Applied</p>
                  </div>
                </div>
                
                <Button 
                  variant={isDesignActive ? "default" : "outline"} 
                  size="lg"
                  onClick={() => setIsDesignActive(!isDesignActive)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isDesignActive ? "Exit Design Mode" : "Start Visual Design"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
        <div>
          <p className="font-medium text-green-900">Project Visualization Ready</p>
          <p className="text-sm text-green-700">
            {allRooms?.length || 0} rooms with {allTreatments?.length || 0} window treatments configured
          </p>
        </div>
        <div className="flex space-x-2">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Configuration
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            <Save className="h-4 w-4 mr-2" />
            Save & Close
          </Button>
          <Button onClick={handleSaveConfiguration}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};
