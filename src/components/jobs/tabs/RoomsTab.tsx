
import { EnhancedRoomView } from "@/components/room-management/EnhancedRoomView";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { formatCurrency } from "@/utils/currency";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";

interface RoomsTabProps {
  projectId: string;
}

export const RoomsTab = ({ projectId }: RoomsTabProps) => {
  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces } = useSurfaces(projectId);
const { data: projectSummaries } = useProjectWindowSummaries(projectId);
  const project = projects?.find(p => p.id === projectId);

  // Calculate comprehensive project total - prioritize windows_summary over treatments table
  const treatmentTotal = treatments?.reduce((sum, treatment) => {
    return sum + (treatment.total_price || 0);
  }, 0) || 0;

  const roomCount = rooms?.length || 0;
  
  // Count actual windows with pricing data, not raw treatment records
  // This ensures the count matches what's displayed in the UI
  const windowsWithPricing = projectSummaries?.windows?.filter(w => w.summary && w.summary.total_cost > 0) || [];
  const treatmentCount = windowsWithPricing.length;

  // Project pricing calculation - show base cost without automatic markups
  const summariesTotal = projectSummaries?.projectTotal || 0;
  
  // Use windows_summary data if available (more accurate as it includes fabric calculations)
  // Fall back to treatments table data only if no window summaries exist
  const baseSubtotal = summariesTotal > 0 ? summariesTotal : treatmentTotal;
  
  // TODO: Markup and tax should be configurable in settings, not hardcoded
  // For now, show the base cost without automatic markup/tax to provide clarity
  const displayTotal = baseSubtotal;

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  console.log('RoomsTab: Project ID:', projectId);
  console.log('RoomsTab: Rooms count:', roomCount);
  console.log('RoomsTab: Treatments count:', treatmentCount);
  console.log('RoomsTab: Treatment total (from treatments table):', treatmentTotal);
  console.log('RoomsTab: Summaries total (from windows_summary table):', summariesTotal);
  console.log('RoomsTab: Base subtotal used:', baseSubtotal);
  console.log('RoomsTab: Display total (no markup/tax):', displayTotal);
  console.log('RoomsTab: Price source:', summariesTotal > 0 ? 'windows_summary table' : 'treatments table');

  return (
    <div className="space-y-4">
      {/* Compact Header - Reduced spacing and size */}
      <div className="flex items-center justify-between py-3 px-4 bg-card rounded-lg border">
        <div>
          <h2 className="text-lg font-semibold">Rooms & Worksheets</h2>
          <p className="text-sm text-muted-foreground">
            {roomCount} room{roomCount !== 1 ? 's' : ''}, {treatmentCount} treatment{treatmentCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-primary">
            {formatCurrency(displayTotal)}
          </div>
          <p className="text-xs text-muted-foreground">
            Base Project Cost
          </p>
        </div>
      </div>

      {/* Enhanced Room Management - This handles all room display and management */}
      <EnhancedRoomView project={project} clientId={project.client_id} />
    </div>
  );
};
