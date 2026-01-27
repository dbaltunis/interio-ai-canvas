import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Trash2, Wrench, FileText } from 'lucide-react';
import type { AuditSummary } from '@/hooks/useSaaSAudit';

interface AuditActionsBarProps {
  onRunAudit: () => void;
  onDownloadReport: () => void;
  onCleanupOrphans: () => void;
  onViewScript: () => void;
  isAuditing: boolean;
  isCleaning: boolean;
  auditData: AuditSummary | null;
}

export function AuditActionsBar({
  onRunAudit,
  onDownloadReport,
  onCleanupOrphans,
  onViewScript,
  isAuditing,
  isCleaning,
  auditData,
}: AuditActionsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={onRunAudit}
        disabled={isAuditing}
        variant="default"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isAuditing ? 'animate-spin' : ''}`} />
        {isAuditing ? 'Running Audit...' : 'Run Full Audit'}
      </Button>

      {auditData && (
        <>
          <Button
            onClick={onDownloadReport}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>

          <Button
            onClick={onViewScript}
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            View SQL Script
          </Button>

          {auditData.summary.orphaned_records > 0 && (
            <Button
              onClick={onCleanupOrphans}
              disabled={isCleaning}
              variant="destructive"
            >
              <Trash2 className={`w-4 h-4 mr-2 ${isCleaning ? 'animate-spin' : ''}`} />
              {isCleaning ? 'Cleaning...' : `Cleanup ${auditData.summary.orphaned_records} Orphans`}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
