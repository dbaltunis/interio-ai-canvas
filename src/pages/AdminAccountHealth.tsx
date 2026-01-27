import { useState } from 'react';
import { useAccountHealth } from '@/hooks/useAccountHealth';
import { useSaaSAudit, type AuditSummary } from '@/hooks/useSaaSAudit';
import { HealthOverviewCards } from '@/components/admin/health/HealthOverviewCards';
import { AccountHealthTable } from '@/components/admin/health/AccountHealthTable';
import { AuditActionsBar } from '@/components/admin/health/AuditActionsBar';
import { AuditReportDialog } from '@/components/admin/health/AuditReportDialog';
import { OrphanedDataCard } from '@/components/admin/health/OrphanedDataCard';
import { BulkRepairButton } from '@/components/admin/health/BulkRepairButton';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAccountHealth() {
  const { data: summary, isLoading, refetch, isFetching } = useAccountHealth();
  const { runAudit, repairAccount, cleanupOrphans, downloadReport } = useSaaSAudit();
  
  const [auditData, setAuditData] = useState<AuditSummary | null>(null);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [showScriptDialog, setShowScriptDialog] = useState(false);

  const handleRunAudit = async () => {
    try {
      const result = await runAudit.mutateAsync(undefined);
      setAuditData(result);
      setShowAuditDialog(true);
    } catch (error) {
      console.error('Audit failed:', error);
    }
  };

  const handleDownloadReport = () => {
    if (auditData) {
      downloadReport(auditData);
    }
  };

  const handleCleanupOrphans = async () => {
    await cleanupOrphans.mutateAsync(undefined);
    // Re-run audit to refresh data
    const result = await runAudit.mutateAsync(undefined);
    setAuditData(result);
  };

  const handleRepairAccount = async (userId: string) => {
    await repairAccount.mutateAsync(userId);
    // Refresh health data
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin/accounts">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                Account Health Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor account configuration and identify issues
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => refetch()}
              disabled={isFetching}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Audit Actions */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <AuditActionsBar
            onRunAudit={handleRunAudit}
            onDownloadReport={handleDownloadReport}
            onCleanupOrphans={handleCleanupOrphans}
            onViewScript={() => setShowAuditDialog(true)}
            isAuditing={runAudit.isPending}
            isCleaning={cleanupOrphans.isPending}
            auditData={auditData}
          />
          {auditData && (
            <BulkRepairButton
              accounts={auditData.accounts}
              onRepairAccount={handleRepairAccount}
            />
          )}
        </div>

        {/* Orphaned Data Warning */}
        {auditData && (
          <div className="mb-6">
            <OrphanedDataCard
              orphanedData={auditData.orphaned_data}
              onCleanup={handleCleanupOrphans}
              isCleaning={cleanupOrphans.isPending}
            />
          </div>
        )}

        {/* Overview Cards */}
        <div className="mb-6">
          <HealthOverviewCards summary={summary} isLoading={isLoading} />
        </div>

        {/* Health Table */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Account Details</h2>
          <AccountHealthTable accounts={summary?.accounts || []} isLoading={isLoading} />
        </div>

        {/* Audit Report Dialog */}
        <AuditReportDialog
          open={showAuditDialog}
          onOpenChange={setShowAuditDialog}
          auditData={auditData}
          onRepairAccount={handleRepairAccount}
          isRepairing={repairAccount.isPending}
        />
      </div>
    </div>
  );
}
