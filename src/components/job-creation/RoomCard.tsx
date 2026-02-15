import { useState, useEffect } from "react";
import { PixelWindowIcon } from "@/components/icons/PixelArtIcons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RectangleHorizontal, Package } from "lucide-react";
import { useRoomCardLogic } from "./RoomCardLogic";
import { RoomHeader } from "./RoomHeader";
import { cn } from "@/lib/utils";
import { SurfaceList } from "./SurfaceList";
import { RoomProductsList } from "./RoomProductsList";
import { ProductServiceDialog, SelectedProduct, CalendarEventRequest } from "./ProductServiceDialog";
import { useCompactMode } from "@/hooks/useCompactMode";
import { WindowManagementDialog } from "./WindowManagementDialog";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useCreateRoomProducts } from "@/hooks/useRoomProducts";
import { UnifiedAppointmentDialog } from "@/components/calendar/UnifiedAppointmentDialog";


interface RoomCardProps {
  room: any;
  projectId: string;
  clientId?: string;
  onUpdateRoom: any;
  onDeleteRoom: any;
  onCreateTreatment: (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => void;
  onCreateSurface: (roomId: string, surfaceType: string) => void;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
  onDeleteSurface: (surfaceId: string) => void;
  onCopyRoom: (room: any) => void;
  editingRoomId: string | null;
  setEditingRoomId: (id: string | null) => void;
  editingRoomName: string;
  setEditingRoomName: (name: string) => void;
  onRenameRoom: (roomId: string, newName: string) => void;
  onChangeRoomType: (roomId: string, roomType: string) => void;
  isCopyingRoom?: boolean;
  isReadOnly?: boolean;
  isFirstRoom?: boolean;
}

export const RoomCard = ({ 
  room, 
  projectId,
  clientId,
  onUpdateRoom, 
  onDeleteRoom, 
  onCreateTreatment,
  onCreateSurface,
  onUpdateSurface,
  onDeleteSurface,
  onCopyRoom,
  editingRoomId,
  setEditingRoomId,
  editingRoomName,
  setEditingRoomName,
  onRenameRoom,
  onChangeRoomType,
  isCopyingRoom = false,
  isReadOnly = false,
  isFirstRoom = false
}: RoomCardProps) => {
  const {
    surfacesLoading,
    roomSurfaces,
    roomTreatments,
    roomTotal,
    projectTotal,
    pricingFormOpen,
    setPricingFormOpen,
    calculatorDialogOpen,
    setCalculatorDialogOpen,
    currentFormData,
    handleAddTreatment
  } = useRoomCardLogic(room, projectId, clientId, onCreateTreatment);

  const { compact } = useCompactMode();

  const [isCreatingSurface, setIsCreatingSurface] = useState(false);
  
  // Persist collapse state in localStorage
  const storageKey = `room-collapsed-${room.id}`;
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? stored === 'true' : true;
  });
  
  // Save collapse state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(storageKey, String(isOpen));
  }, [isOpen, storageKey]);
  
  const [showWorksheetDialog, setShowWorksheetDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [pendingEventRequest, setPendingEventRequest] = useState<CalendarEventRequest | null>(null);
  const [newSurface, setNewSurface] = useState<any>(null);

  const createRoomProducts = useCreateRoomProducts();

  // Open the calendar event dialog pre-filled with service details
  const handleCreateCalendarEvent = (eventRequest: CalendarEventRequest) => {
    setPendingEventRequest(eventRequest);
    setShowEventDialog(true);
  };

  // Compute pre-filled date/time for the event dialog
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 1); // default to tomorrow
  const durationMins = pendingEventRequest?.durationMinutes || 30;
  const eventStartTime = "09:00";
  const endMins = 9 * 60 + durationMins;
  const eventEndTime = `${Math.floor(endMins / 60).toString().padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`;

  const handleSurfaceCreation = async () => {
    setIsCreatingSurface(true);
    try {
      const surface = await onCreateSurface(room.id, 'window');
      setNewSurface(surface);
      setShowWorksheetDialog(true);
    } catch (error) {
      console.error("Surface creation failed:", error);
    } finally {
      setIsCreatingSurface(false);
    }
  };

  const handleStartEditing = () => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRenameRoom(room.id, editingRoomName);
      setEditingRoomId(null);
    } else if (e.key === 'Escape') {
      setEditingRoomId(null);
      setEditingRoomName(room.name);
    }
  };

  const handleAddProducts = (products: SelectedProduct[]) => {
    const roomProducts = products.map(p => ({
      room_id: room.id,
      inventory_item_id: p.isCustom ? null : p.inventoryItemId,
      quantity: p.quantity,
      unit_price: p.unitPrice,
      total_price: p.totalPrice,
      name: p.name || null,
      description: p.notes || null,
      image_url: p.imageUrl || null,
      is_custom: p.isCustom || false,
    }));
    createRoomProducts.mutate(roomProducts);
  };

  if (surfacesLoading) {
    return (
      <Card className="bg-gray-100 min-h-[500px] flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-brand-neutral">Loading surfaces...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="relative overflow-hidden rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
        {/* Simplified subtle background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-border/50" />
        </div>
        <RoomHeader
          room={room}
          roomTotal={roomTotal}
          projectTotal={projectTotal}
          editingRoomId={editingRoomId}
          editingRoomName={editingRoomName}
          setEditingRoomName={setEditingRoomName}
          onStartEditing={handleStartEditing}
          onKeyPress={handleKeyPress}
          onRenameRoom={onRenameRoom}
          onCopyRoom={onCopyRoom}
          onDeleteRoom={onDeleteRoom}
          onChangeRoomType={onChangeRoomType}
          isCopyingRoom={isCopyingRoom}
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
          isReadOnly={isReadOnly}
        />

        <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up">
          {/* Surfaces List */}
          {roomSurfaces.length > 0 ? (
            <SurfaceList
              surfaces={roomSurfaces}
              treatments={roomTreatments}
              clientId={clientId}
              projectId={projectId}
              onAddTreatment={handleAddTreatment}
              onUpdateSurface={onUpdateSurface}
              onDeleteSurface={onDeleteSurface}
            />
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg mx-4 my-4">
              <PixelWindowIcon className="mx-auto mb-3" size={48} />
              <h4 className="font-medium text-foreground mb-1">No measurement worksheets added</h4>
              <p className="text-sm text-muted-foreground mb-4">Add measurement worksheets or products to get started</p>
            </div>
          )}

          {/* Room Products & Services */}
          <RoomProductsList roomId={room.id} />

          {/* Add Buttons */}
          {!isReadOnly && (
            <div className="flex gap-2 pt-3 pb-4 px-4 border-t border-border/50">
              <Button
                onClick={handleSurfaceCreation}
                disabled={isCreatingSurface}
                variant="outline"
                size={compact ? "sm" : "sm"}
                className={cn(
                  "flex-1",
                  isFirstRoom && roomSurfaces.length === 0 && "animate-attention-ring"
                )}
              >
                <RectangleHorizontal className="h-4 w-4 mr-2" />
                Add Measurement Worksheet
              </Button>
              <Button
                onClick={() => setShowProductDialog(true)}
                variant="outline"
                size={compact ? "sm" : "sm"}
                className="flex-1"
              >
                <Package className="h-4 w-4 mr-2" />
                Add Product/Service
              </Button>
            </div>
          )}
        </CollapsibleContent>

        {/* Auto-open worksheet dialog for new surfaces */}
        {newSurface && (
          <WindowManagementDialog
            isOpen={showWorksheetDialog}
            onClose={() => {
              setShowWorksheetDialog(false);
              setNewSurface(null);
            }}
            surface={{
              ...newSurface,
              room_name: room.name
            }}
            clientId={clientId}
            projectId={projectId}
            existingMeasurement={undefined}
            existingTreatments={[]}
            onSaveTreatment={(treatmentData) => handleAddTreatment(newSurface.id, treatmentData.treatment_type, treatmentData)}
          />
        )}

        {/* Product/Service Selection Dialog */}
        <ProductServiceDialog
          isOpen={showProductDialog}
          onClose={() => setShowProductDialog(false)}
          roomId={room.id}
          projectId={projectId}
          clientId={clientId}
          onAddProducts={handleAddProducts}
          onCreateCalendarEvent={handleCreateCalendarEvent}
        />

        {/* Calendar Event Dialog for service scheduling */}
        {pendingEventRequest && (
          <UnifiedAppointmentDialog
            open={showEventDialog}
            onOpenChange={(open) => {
              setShowEventDialog(open);
              if (!open) setPendingEventRequest(null);
            }}
            selectedDate={eventDate}
            selectedStartTime={eventStartTime}
            selectedEndTime={eventEndTime}
            prefill={{
              title: `${pendingEventRequest.title} - ${room.name}`,
              description: pendingEventRequest.description,
              appointment_type: pendingEventRequest.serviceCategory === 'measurement' ? 'measurement'
                : pendingEventRequest.serviceCategory === 'consultation' ? 'consultation'
                : pendingEventRequest.serviceCategory === 'installation' ? 'installation'
                : 'follow_up',
              project_id: projectId,
              client_id: clientId,
            }}
          />
        )}
      </Card>
    </Collapsible>
  );
};
