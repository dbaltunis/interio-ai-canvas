
import { EnhancedRoomView } from "@/components/room-management/EnhancedRoomView";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { useMemo } from "react";

interface RoomsTabProps {
  projectId: string;
}

export const RoomsTab = ({ projectId }: RoomsTabProps) => {
  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);
  
  const project = projects?.find(p => p.id === projectId);
  const { data: clientMeasurements } = useClientMeasurements(project?.client_id);

  // Calculate room totals properly (including both treatments and worksheets)
  const roomTotals = useMemo(() => {
    if (!rooms) return [];
    
    return rooms.map(room => {
      const roomSurfaces = surfaces?.filter(s => s.room_id === room.id) || [];
      const roomTreatments = treatments?.filter(t => t.room_id === room.id) || [];
      
      let roomTotal = 0;
      
      // Sum treatment prices
      const treatmentTotal = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
      roomTotal += treatmentTotal;
      
      // If no treatment prices, add worksheet calculations
      if (treatmentTotal === 0 && clientMeasurements && roomSurfaces.length > 0) {
        const roomMeasurements = clientMeasurements.filter(measurement => {
          if (measurement.room_id === room.id) return true;
          
          if (measurement.notes && roomSurfaces.length > 0) {
            return roomSurfaces.some(surface => 
              measurement.notes === surface.name ||
              measurement.notes.includes(`${surface.name} -`) ||
              measurement.notes.includes(`- ${surface.name}`)
            );
          }
          
          return false;
        });
        
        roomMeasurements.forEach(measurement => {
          if (measurement.measurements) {
            const measurements = measurement.measurements as Record<string, any>;
            const fabricCost = Number(measurements.fabric_total_cost || measurements.fabric_total_price || 0);
            const liningCost = Number(measurements.lining_cost || measurements.lining_price || 0);
            const manufacturingCost = Number(measurements.manufacturing_cost || measurements.manufacturing_price || 0);
            roomTotal += fabricCost + liningCost + manufacturingCost;
          }
        });
      }
      
      return { roomId: room.id, roomName: room.name, total: roomTotal };
    });
  }, [rooms, surfaces, treatments, clientMeasurements]);

  // Calculate project total from room totals
  const projectTotal = roomTotals.reduce((sum, room) => sum + room.total, 0);
  
  console.log("=== PROJECT TOTAL CALCULATION ===");
  console.log("Room totals:", roomTotals);
  console.log("Project total:", projectTotal);

  const markupPercentage = 25;
  const taxRate = 0.08;
  const subtotal = projectTotal * (1 + markupPercentage / 100);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  console.log('RoomsTab: Project ID:', projectId);
  console.log('RoomsTab: Rooms data:', rooms);
  console.log('RoomsTab: Surfaces data:', surfaces);
  console.log('RoomsTab: Treatments data:', treatments);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rooms & Measurement Worksheets</h2>
          <p className="text-muted-foreground">
            Manage rooms and create measurement worksheets for this project
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">
            £{total.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">Total Project Cost</p>
        </div>
      </div>

      {/* Enhanced Room Management - This handles all room display and management */}
      <div>
        <EnhancedRoomView project={project} clientId={project.client_id} />
      </div>
    </div>
  );
};
