
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EnhancedRoomView } from "@/components/room-management/EnhancedRoomView";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms, useCreateRoom } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { formatCurrency } from "@/utils/currency";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { useQuotationSync } from "@/hooks/useQuotationSync";
import { useWorkroomSync } from "@/hooks/useWorkroomSync";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { supabase } from "@/integrations/supabase/client";

interface RoomsTabProps {
  projectId: string;
}

export const RoomsTab = ({ projectId }: RoomsTabProps) => {
  const queryClient = useQueryClient();
  const { data: projects } = useProjects();
  const { data: treatments, refetch: refetchTreatments } = useTreatments(projectId);
  const { data: rooms } = useRooms(projectId);
  const { data: surfaces, refetch: refetchSurfaces } = useSurfaces(projectId);
  const { data: projectSummaries, refetch: refetchSummaries } = useProjectWindowSummaries(projectId);
  const { data: businessSettings } = useBusinessSettings();
  const createRoom = useCreateRoom();
  const project = projects?.find(p => p.id === projectId);

  // Auto-cleanup: Remove orphaned treatments and surfaces (those with no/invalid parent room)
  useEffect(() => {
    const cleanupOrphanedData = async () => {
      if (!rooms || !treatments || !surfaces || !projectId) return;
      
      console.log('RoomsTab: Checking for orphaned data...', {
        rooms: rooms.length,
        treatments: treatments.length,
        surfaces: surfaces.length
      });
      
      const roomIds = new Set(rooms.map(r => r.id));
      
      // Find and delete orphaned surfaces (no room_id OR invalid room_id)
      const orphanedSurfaces = surfaces.filter(s => !s.room_id || !roomIds.has(s.room_id));
      if (orphanedSurfaces.length > 0) {
        console.log('Cleaning up orphaned surfaces:', orphanedSurfaces.length);
        for (const surface of orphanedSurfaces) {
          await supabase.from('surfaces').delete().eq('id', surface.id);
        }
        // Force refetch after cleanup
        await refetchSurfaces();
        await refetchSummaries();
      }
      
      // Find and delete orphaned treatments (no room_id OR invalid room_id)
      const orphanedTreatments = treatments.filter(t => !t.room_id || !roomIds.has(t.room_id));
      if (orphanedTreatments.length > 0) {
        console.log('Cleaning up orphaned treatments:', orphanedTreatments.length);
        for (const treatment of orphanedTreatments) {
          await supabase.from('treatments').delete().eq('id', treatment.id);
        }
        // Force refetch after cleanup
        await refetchTreatments();
        await refetchSummaries();
      }
      
      // If no rooms but we have data showing, force a complete cache clear
      if (rooms.length === 0 && (treatments.length > 0 || surfaces.length > 0)) {
        console.log('No rooms but data exists - forcing cache clear');
        queryClient.removeQueries({ queryKey: ["treatments", projectId] });
        queryClient.removeQueries({ queryKey: ["surfaces", projectId] });
        queryClient.removeQueries({ queryKey: ["project-window-summaries", projectId] });
        await refetchTreatments();
        await refetchSurfaces();
        await refetchSummaries();
      }
    };
    
    cleanupOrphanedData();
  }, [rooms, treatments, surfaces, projectId, refetchTreatments, refetchSurfaces, refetchSummaries, queryClient]);

  // Auto-sync room and treatment data to quotations and workroom
  const quotationSync = useQuotationSync({
    projectId,
    clientId: project?.client_id,
    autoCreateQuote: true
  });

  const workroomSync = useWorkroomSync({
    projectId,
    autoCreateWorkshopItems: true
  });

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
            {businessSettings?.tax_type && businessSettings.tax_type !== 'none' ? (
              (businessSettings.pricing_settings as any)?.tax_inclusive ? 
                ` (incl. ${businessSettings.tax_type?.toUpperCase()})` : 
                ` (excl. ${businessSettings.tax_type?.toUpperCase()})`
            ) : ' (no tax)'}
            {quotationSync.isLoading && ' • Syncing...'}
          </p>
        </div>
      </div>

      {/* Enhanced Room Management - This handles all room display and management */}
      <EnhancedRoomView project={project} clientId={project.client_id} />
    </div>
  );
};
