import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AuditSummary, AccountAudit } from '@/hooks/useSaaSAudit';

interface AuditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditData: AuditSummary | null;
  onRepairAccount: (userId: string) => void;
  isRepairing: boolean;
}

export function AuditReportDialog({
  open,
  onOpenChange,
  auditData,
  onRepairAccount,
  isRepairing,
}: AuditReportDialogProps) {
  const { toast } = useToast();

  if (!auditData) return null;

  const copyScript = () => {
    navigator.clipboard.writeText(auditData.auto_fix_script);
    toast({
      title: 'Copied',
      description: 'SQL script copied to clipboard',
    });
  };

  const StatusIcon = ({ status }: { status: AccountAudit['health_status'] }) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>SaaS Consistency Audit Report</DialogTitle>
          <DialogDescription>
            Generated at {new Date(auditData.timestamp).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="orphans">Orphaned Data</TabsTrigger>
            <TabsTrigger value="script">Fix Script</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl font-bold">{auditData.summary.total_accounts}</div>
                  <div className="text-sm text-muted-foreground">Total Accounts</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{auditData.summary.healthy_accounts}</div>
                  <div className="text-sm text-muted-foreground">Healthy</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{auditData.summary.needs_attention}</div>
                  <div className="text-sm text-muted-foreground">Need Attention</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl font-bold text-destructive">{auditData.summary.orphaned_records}</div>
                  <div className="text-sm text-muted-foreground">Orphaned Records</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {auditData.accounts.map((account) => (
                  <Card key={account.user_id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon status={account.health_status} />
                          <span className="font-medium">{account.display_name}</span>
                          {account.is_custom_account && (
                            <Badge variant="outline" className="text-xs">Custom</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">{account.email}</div>
                        
                        <div className="flex flex-wrap gap-2">
                          {account.missing_configs.permissions.missing.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              Missing {account.missing_configs.permissions.missing.length} permissions
                            </Badge>
                          )}
                          {account.missing_configs.business_settings && (
                            <Badge variant="destructive" className="text-xs">No business settings</Badge>
                          )}
                          {account.missing_configs.account_settings && (
                            <Badge variant="secondary" className="text-xs">No account settings</Badge>
                          )}
                          {account.missing_configs.number_sequences.missing.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Missing {account.missing_configs.number_sequences.missing.length} sequences
                            </Badge>
                          )}
                          {account.missing_configs.job_statuses === 0 && (
                            <Badge variant="secondary" className="text-xs">No job statuses</Badge>
                          )}
                          {account.twc_issues.heading_type_required > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {account.twc_issues.heading_type_required} TWC issues
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          account.health_status === 'healthy' ? 'default' :
                          account.health_status === 'warning' ? 'secondary' : 'destructive'
                        }>
                          {account.health_score}%
                        </Badge>
                        {account.health_status !== 'healthy' && !account.is_custom_account && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRepairAccount(account.user_id)}
                            disabled={isRepairing}
                          >
                            Fix
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="orphans">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {Object.entries(auditData.orphaned_data).map(([table, records]) => (
                  records.length > 0 && (
                    <Card key={table}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span className="capitalize">{table.replace('_', ' ')}</span>
                          <Badge variant="destructive">{records.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs font-mono text-muted-foreground max-h-24 overflow-auto">
                          {records.slice(0, 5).map((r) => (
                            <div key={r.id}>ID: {r.id.slice(0, 8)}... (user: {r.user_id.slice(0, 8)}...)</div>
                          ))}
                          {records.length > 5 && (
                            <div className="text-muted-foreground">...and {records.length - 5} more</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
                {auditData.summary.orphaned_records === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600 dark:text-green-400" />
                    <p>No orphaned data found!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="script">
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                className="absolute right-2 top-2 z-10"
                onClick={copyScript}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <ScrollArea className="h-[400px] w-full rounded-md border bg-muted/50 p-4">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {auditData.auto_fix_script || '-- No fixes needed! All accounts are healthy.'}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
