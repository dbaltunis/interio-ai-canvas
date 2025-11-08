import { EnhancedHomeDashboard } from "./EnhancedHomeDashboard";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh-indicator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";

const Dashboard = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  
  const handleRefresh = async () => {
    // Invalidate all dashboard-related queries to trigger a refetch
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    await queryClient.invalidateQueries({ queryKey: ['kpis'] });
    await queryClient.invalidateQueries({ queryKey: ['stats'] });
    await queryClient.invalidateQueries({ queryKey: ['shopify'] });
  };

  const { isPulling, isRefreshing, pullDistance, progress } = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled: isMobile
  });

  return (
    <>
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        progress={progress}
        pullDistance={pullDistance}
      />
      <div className="p-3 sm:p-4 md:p-6">
        <EnhancedHomeDashboard />
      </div>
    </>
  );
};

export default Dashboard;