
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [isSaving, setIsSaving] = useState(false);
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
  console.log("Canvas Debug - Configuration Data:", productConfigurationData);
  console.log("Canvas Debug - Selected rooms:", selectedRooms);
  console.log("Canvas Debug - All treatments:", allTreatments);

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

    setIsSaving(true);

    try {
      console.log("Starting to save configuration for rooms:", selectedRooms);
      
      // Create treatments for all selected rooms
      for (const roomId of selectedRooms) {
        console.log("Processing room:", roomId);
        
        // Get surfaces for this room
        const roomSurfaces = allSurfaces?.filter(s => s.room_id === roomId) || [];
        console.log("Found surfaces for room:", roomSurfaces);
        
        // Use first window surface, or create default if none exists
        let targetSurfaceId = roomSurfaces.find(s => s.surface_type === 'window')?.id || roomSurfaces[0]?.id || "";
        
        // Create comprehensive treatment data
        const treatmentData = {
          product_name: productConfigurationData.template?.name || product.name,
          treatment_type: productConfigurationData.template?.product_type || 'curtain',
          total_price: productConfigurationData.calculation?.totalPrice || 0,
          material_cost: productConfigurationData.calculation?.fabricPrice || 0,
          labor_cost: productConfigurationData.calculation?.manufacturingPrice || 0,
          unit_price: productConfigurationData.calculation?.totalPrice || 0,
          quantity: 1,
          fabric_type: productConfigurationData.fabric?.name || 'Unknown Fabric',
          color: productConfigurationData.fabric?.color || null,
          pattern: productConfigurationData.fabric?.pattern || null,
          measurements: productConfigurationData.measurements,
          fabric_details: productConfigurationData.fabric,
          treatment_details: productConfigurationData.template,
          calculation_details: productConfigurationData.calculation,
          notes: `Configured via product template: ${product.name}. Rail: ${productConfigurationData.measurements?.railWidth}cm, Drop: ${productConfigurationData.measurements?.dropHeight}cm`,
          status: 'planned'
        };

        console.log("Creating treatment with data:", treatmentData);
        
        await handleCreateTreatment(
          roomId, 
          targetSurfaceId, 
          treatmentData.treatment_type, 
          treatmentData
        );
        
        console.log("Treatment created successfully for room:", roomId);
      }

      // Force refresh all data
      console.log("Refreshing all data...");
      await Promise.all([
        refetchRooms(),
        refetchSurfaces(), 
        refetchTreatments()
      ]);

      toast({
        title: "Configuration Saved Successfully!",
        description: `${product.name} configured for ${selectedRooms.length} room(s). Total: $${productConfigurationData.calculation?.totalPrice || 0}`,
      });

      // Close after a short delay to show success
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Failed to save configuration:", error);
      toast({
        title: "Save Failed",
        description: `Failed to save the product configuration: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
        <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] relative border-2 border-dashed border-gray-300">
          <div className="absolute top-2 left-2">
            <Badge variant="secondary">Room Layout</Badge>
          </div>
          
          {/* Room representation */}
          <div className="mt-6 relative">
            {/* Room outline */}
            <div className="w-full h-32 border-4 border-gray-400 bg-white/50 rounded-lg relative overflow-hidden">
              {/* Floor pattern */}
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-amber-100 to-amber-200"></div>
              
              {/* Surfaces positioning */}
              {surfaces.map((surface, index) => {
                const isWindow = surface.surface_type === 'window';
                const surfaceTreatments = treatments.filter(t => t.window_id === surface.id);
                
                // Position surfaces around the room perimeter
                const positions = [
                  { top: '4px', left: '20%', width: '30%', height: '6px' }, // Top wall
                  { top: '20%', right: '4px', width: '6px', height: '30%' }, // Right wall
                  { bottom: '4px', left: '50%', width: '30%', height: '6px' }, // Bottom wall
                  { top: '50%', left: '4px', width: '6px', height: '30%' }, // Left wall
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
                        <Square className="h-2 w-2 text-blue-600" />
                      ) : (
                        <Maximize2 className="h-2 w-2 text-gray-600" />
                      )}
                    </div>
                    
                    {/* Treatment indicator */}
                    {surfaceTreatments.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white">
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
                  <p className="text-sm font-semibold text-gray-600">{room.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{room.room_type?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Surfaces and Treatments Details */}
        <div className="space-y-3">
          {surfaces.map((surface) => {
            const surfaceTreatments = treatments.filter(t => t.window_id === surface.id);
            
            return (
              <Card key={surface.id} className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {surface.surface_type === 'window' ? (
                      <Square className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Maximize2 className="h-4 w-4 text-gray-600" />
                    )}
                    <div>
                      <h5 className="font-medium text-sm">{surface.name}</h5>
                      <p className="text-xs text-muted-foreground capitalize">
                        {surface.surface_type} • {surface.width}" × {surface.height}"
                      </p>
                    </div>
                  </div>
                  <Badge variant={surface.surface_type === 'window' ? 'default' : 'secondary'} className="text-xs">
                    {surface.surface_type}
                  </Badge>
                </div>
                
                {/* Treatments for this surface */}
                {surfaceTreatments.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <h6 className="text-xs font-medium mb-1 text-green-700">Window Treatments:</h6>
                    <div className="space-y-1">
                      {surfaceTreatments.map((treatment) => (
                        <div key={treatment.id} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                          <div className="flex items-center space-x-2">
                            <Palette className="h-3 w-3 text-green-600" />
                            <div>
                              <p className="text-xs font-medium">{getWindowCoveringName(treatment.treatment_type)}</p>
                              {treatment.fabric_type && (
                                <p className="text-xs text-muted-foreground">Fabric: {treatment.fabric_type}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium">${treatment.total_price || 0}</p>
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
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground italic">No treatments assigned yet</p>
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
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h3 className="text-lg font-semibold mb-1">Project Visualization Canvas</h3>
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

      {/* Canvas Content - Made Responsive */}
      <Card className="min-h-[400px]">
        <ScrollArea className="h-full">
          <div className="p-4">
            {isDesignActive ? (
              <div className="space-y-4">
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
              <div className="text-center min-h-[300px] flex items-center justify-center">
                <div className="space-y-4 max-w-4xl">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">Project Overview</h4>
                    <p className="text-muted-foreground">Ready to visualize your {product?.name} configuration</p>
                  </div>
                  
                  {/* Show curtain configuration data if available */}
                  {productConfigurationData && (
                    <Card className="p-4 bg-blue-50 border-blue-200 max-w-2xl mx-auto">
                      <div className="text-center space-y-2">
                        <h5 className="font-medium text-blue-900 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Curtain Configuration Ready
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-left text-sm">
                          <div className="space-y-1">
                            {productConfigurationData.template?.name && (
                              <p><strong>Treatment:</strong> {productConfigurationData.template.name}</p>
                            )}
                            {productConfigurationData.fabric?.name && (
                              <p><strong>Fabric:</strong> {productConfigurationData.fabric.name}</p>
                            )}
                          </div>
                          <div className="space-y-1">
                            {productConfigurationData.measurements?.railWidth && (
                              <p><strong>Width:</strong> {productConfigurationData.measurements.railWidth}cm</p>
                            )}
                            {productConfigurationData.measurements?.dropHeight && (
                              <p><strong>Drop:</strong> {productConfigurationData.measurements.dropHeight}cm</p>
                            )}
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-lg font-semibold text-blue-900">
                            Total: ${productConfigurationData.calculation?.totalPrice || 0}
                          </p>
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
        </ScrollArea>
      </Card>

      {/* Action Bar - Fixed positioning */}
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
        <div>
          <p className="font-medium text-green-900">Configuration Ready to Save</p>
          <p className="text-sm text-green-700">
            {productConfigurationData ? 
              `${product?.name} configured for ${selectedRooms.length} room(s) - $${productConfigurationData.calculation?.totalPrice || 0}` :
              `${allRooms?.length || 0} rooms with ${allTreatments?.length || 0} window treatments`
            }
          </p>
        </div>
        <div className="flex space-x-2">
          {onBack && (
            <Button variant="ghost" onClick={onBack} disabled={isSaving}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button 
            onClick={handleSaveConfiguration} 
            disabled={!productConfigurationData || isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
