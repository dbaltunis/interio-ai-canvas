import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Wrench, Loader2 } from 'lucide-react';
import type { AccountAudit } from '@/hooks/useSaaSAudit';

interface BulkRepairButtonProps {
  accounts: AccountAudit[];
  onRepairAccount: (userId: string) => Promise<void>;
}

export function BulkRepairButton({ accounts, onRepairAccount }: BulkRepairButtonProps) {
  const [isRepairing, setIsRepairing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const accountsToFix = accounts.filter(
    a => a.health_status !== 'healthy' && !a.is_custom_account
  );

  if (accountsToFix.length === 0) return null;

  const handleBulkRepair = async () => {
    setIsRepairing(true);
    setProgress({ current: 0, total: accountsToFix.length });

    for (let i = 0; i < accountsToFix.length; i++) {
      try {
        await onRepairAccount(accountsToFix[i].user_id);
        setProgress({ current: i + 1, total: accountsToFix.length });
      } catch (error) {
        console.error(`Failed to repair ${accountsToFix[i].display_name}:`, error);
      }
    }

    setIsRepairing(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isRepairing}>
          {isRepairing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Repairing {progress.current}/{progress.total}
            </>
          ) : (
            <>
              <Wrench className="w-4 h-4 mr-2" />
              Fix All ({accountsToFix.length})
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Repair All Accounts</AlertDialogTitle>
          <AlertDialogDescription>
            This will repair {accountsToFix.length} account(s) by creating missing configurations:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Missing permissions</li>
              <li>Business settings</li>
              <li>Account settings</li>
              <li>Number sequences</li>
              <li>Job statuses</li>
            </ul>
            <p className="mt-2 text-amber-600">
              Note: Custom accounts will be skipped.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBulkRepair}>
            Repair All
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
