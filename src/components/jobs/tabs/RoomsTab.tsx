
import { EnhancedRoomView } from "@/components/room-management/EnhancedRoomView";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";

interface RoomsTabProps {
  projectId: string;
}

export const RoomsTab = ({ projectId }: RoomsTabProps) => {
  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);
  
  const project = projects?.find(p => p.id === projectId);

  // Calculate totals
  const treatmentTotal = treatments?.reduce((sum, treatment) => {
    return sum + (treatment.total_price || 0);
  }, 0) || 0;

  const markupPercentage = 25;
  const taxRate = 0.08;
  const subtotal = treatmentTotal * (1 + markupPercentage / 100);
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
            ${total.toFixed(2)}
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
