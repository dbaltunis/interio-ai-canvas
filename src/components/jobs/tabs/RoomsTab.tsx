// useEffect removed - no longer needed for auto-cleanup
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EnhancedRoomView } from "@/components/room-management/EnhancedRoomView";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms, useCreateRoom } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { useQuotationSync } from "@/hooks/useQuotationSync";
import { useWorkroomSync } from "@/hooks/useWorkroomSync";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useMarkupSettings } from "@/hooks/useMarkupSettings";
import { resolveMarkup, applyMarkup } from "@/utils/pricing/markupResolver";
import { supabase } from "@/integrations/supabase/client";
import { useHasPermission } from "@/hooks/usePermissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCanEditJob } from "@/hooks/useJobEditPermissions";
import { useProjectStatus } from "@/contexts/ProjectStatusContext";

interface RoomsTabProps {
  projectId: string;
}

export const RoomsTab = ({
  projectId
}: RoomsTabProps) => {
  const queryClient = useQueryClient();
  const { formatCurrency } = useFormattedCurrency();
  const {
    data: projects
  } = useProjects();
  const {
    data: treatments,
    refetch: refetchTreatments
  } = useTreatments(projectId);
  const {
    data: rooms = []
  } = useRooms(projectId);
  const {
    data: surfaces,
    refetch: refetchSurfaces
  } = useSurfaces(projectId);
  const {
    data: projectSummaries,
    refetch: refetchSummaries
  } = useProjectWindowSummaries(projectId);
  const {
    data: businessSettings
  } = useBusinessSettings();
  const { data: markupSettings } = useMarkupSettings();
  const createRoom = useCreateRoom();
  const project = projects?.find(p => p.id === projectId);
  
  // Use explicit permissions hook for edit checks
  const { canEditJob, isLoading: editPermissionsLoading } = useCanEditJob(project);
  
  // Use project status context for locking (when inside provider)
  const { isLocked, isLoading: statusLoading } = useProjectStatus();
  
  // Combine permission and status checks
  const isReadOnly = !canEditJob || editPermissionsLoading || isLocked || statusLoading;

  // Fetch all room products for this project
  const roomIds = rooms.map(r => r.id);
  const { data: allRoomProducts = [] } = useQuery({
    queryKey: ["project-room-products", projectId, roomIds],
    queryFn: async () => {
      if (roomIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("room_products")
        .select("*")
        .in("room_id", roomIds);

      if (error) throw error;
      return data || [];
    },
    enabled: roomIds.length > 0,
  });

  // REMOVED: Auto-cleanup useEffect that caused race condition data loss
  // See memory: architecture/automatic-data-deletion-safety
  // Orphaned data cleanup is now handled via explicit admin actions only

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

  // Project pricing calculation - show RETAIL price with markup
  const summariesTotal = projectSummaries?.projectTotal || 0;

  // Calculate room products total (already at selling price)
  const roomProductsTotal = allRoomProducts.reduce((sum, p) => sum + (p.total_price || 0), 0);

  // Calculate SELLING total using stored total_selling (with per-item markups)
  const sellingTotal = (projectSummaries?.windows || []).reduce((sum, w) => {
    if (!w.summary) return sum;
    
    // ✅ CRITICAL FIX: Use stored total_selling (calculated with per-item markups)
    const storedSelling = Number(w.summary.total_selling || 0);
    if (storedSelling > 0) {
      return sum + storedSelling;
    }
    
    // Fallback for old data without total_selling
    const costPrice = Number(w.summary.total_cost || 0);
    const markupResult = resolveMarkup({
      gridMarkup: w.summary.pricing_grid_markup || undefined,
      category: w.summary.treatment_category || w.summary.treatment_type,
      subcategory: w.summary.subcategory || undefined,
      markupSettings: markupSettings || undefined
    });
    return sum + applyMarkup(costPrice, markupResult.percentage);
  }, 0);

  // Use selling total (with markup) + room products for display
  const displayTotal = sellingTotal + roomProductsTotal;
  if (!project) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  console.log('RoomsTab: Project ID:', projectId);
  console.log('RoomsTab: Rooms count:', roomCount);
  console.log('RoomsTab: Treatments count:', treatmentCount);
  console.log('RoomsTab: Treatment total (from treatments table):', treatmentTotal);
  console.log('RoomsTab: Summaries total (from windows_summary table):', summariesTotal);
  console.log('RoomsTab: Selling total (with markup):', sellingTotal);
  console.log('RoomsTab: Display total:', displayTotal);
  console.log('RoomsTab: Price source:', summariesTotal > 0 ? 'windows_summary table' : 'treatments table');
  return <div className="space-y-4">
      {/* Compact Header - Reduced spacing and size */}
      <div className="flex items-center justify-between py-3 px-4 bg-card rounded-lg border">
        <div>
          <h2 className="text-lg font-semibold">Project</h2>
          <p className="text-sm text-muted-foreground">
            {roomCount} room{roomCount !== 1 ? 's' : ''}, {treatmentCount} treatment{treatmentCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-primary">
            {formatCurrency(displayTotal)}
          </div>
          <p className="text-xs text-muted-foreground">
            Project Total
            {businessSettings?.tax_type && businessSettings.tax_type !== 'none' ? (businessSettings.pricing_settings as any)?.tax_inclusive ? ` (incl. ${businessSettings.tax_type?.toUpperCase()})` : ` (excl. ${businessSettings.tax_type?.toUpperCase()})` : ' (excl. tax)'}
            {quotationSync.isLoading && ' • Syncing...'}
          </p>
        </div>
      </div>

      {/* Enhanced Room Management - This handles all room display and management */}
      <EnhancedRoomView project={project} clientId={project.client_id} isReadOnly={isReadOnly} />
    </div>;
};