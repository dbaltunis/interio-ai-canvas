import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, CheckCircle2, Link2 } from "lucide-react";
import rfmsLogo from "@/assets/rfms-logo.svg";
import netsuiteLogo from "@/assets/netsuite-logo.svg";
import { useIntegrations } from "@/hooks/useIntegrations";

interface IntegrationSyncStatusProps {
  project: {
    rfms_quote_id?: string | null;
    rfms_order_id?: string | null;
    netsuite_estimate_id?: string | null;
    netsuite_sales_order_id?: string | null;
    netsuite_invoice_id?: string | null;
  };
  compact?: boolean;
}

interface SyncItem {
  system: string;
  integrationType: string;
  logo: string;
  logoClass: string;
  records: { label: string; id: string | null | undefined }[];
}

export const IntegrationSyncStatus = ({ project, compact = false }: IntegrationSyncStatusProps) => {
  const { integrations, isLoading } = useIntegrations();

  const hasActiveIntegration = (type: string) =>
    integrations.some((i) => i.integration_type === type && i.active);

  const allSyncItems: SyncItem[] = [
    {
      system: "RFMS",
      integrationType: "rfms",
      logo: rfmsLogo,
      logoClass: "h-4 w-auto",
      records: [
        { label: "Quote", id: project.rfms_quote_id },
        { label: "Order", id: project.rfms_order_id },
      ],
    },
    {
      system: "NetSuite",
      integrationType: "netsuite",
      logo: netsuiteLogo,
      logoClass: "h-4 w-auto",
      records: [
        { label: "Estimate", id: project.netsuite_estimate_id },
        { label: "Sales Order", id: project.netsuite_sales_order_id },
        { label: "Invoice", id: project.netsuite_invoice_id },
      ],
    },
  ];

  // Only show rows for integrations that are actually configured & active
  const syncItems = allSyncItems.filter((s) => hasActiveIntegration(s.integrationType));

  // Hide entire component if no ERP integrations are active (or still loading)
  if (isLoading || syncItems.length === 0) return null;

  // Compact mode for job header
  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1.5">
          {syncItems.map((sync) => {
            const syncedRecords = sync.records.filter((r) => r.id);
            const hasSynced = syncedRecords.length > 0;

            return (
              <Tooltip key={sync.system}>
                <TooltipTrigger>
                  <Badge
                    variant="outline"
                    className={
                      hasSynced
                        ? "text-[10px] px-1.5 py-0 h-5 gap-1 bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400"
                        : "text-[10px] px-1.5 py-0 h-5 gap-1 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400"
                    }
                  >
                    <img src={sync.logo} alt={sync.system} className={sync.logoClass} />
                    {hasSynced ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Link2 className="h-3 w-3" />
                    )}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="text-xs">
                    {hasSynced ? (
                      <>
                        <p className="font-medium mb-1">Synced to {sync.system}</p>
                        {syncedRecords.map((r) => (
                          <p key={r.label} className="text-muted-foreground">
                            {r.label}: {r.id}
                          </p>
                        ))}
                      </>
                    ) : (
                      <p className="font-medium">{sync.system} connected — not yet synced for this job</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  // Full card mode
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          ERP Sync Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {syncItems.map((sync) => {
            const syncedRecords = sync.records.filter((r) => r.id);
            const hasSynced = syncedRecords.length > 0;

            return (
              <div
                key={sync.system}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-2">
                  <img src={sync.logo} alt={sync.system} className="h-5 w-auto" />
                  <span className="text-sm font-medium">{sync.system}</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasSynced ? (
                    syncedRecords.map((r) => (
                      <TooltipProvider key={r.label}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {r.label}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {sync.system} {r.label} ID: {r.id}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))
                  ) : (
                    <Badge variant="info" className="text-xs">
                      <Link2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Compact badges for client integration sync status.
 */
export const ClientIntegrationStatus = ({
  client,
}: {
  client: {
    rfms_customer_id?: string | null;
    netsuite_customer_id?: string | null;
  };
}) => {
  const hasRfms = !!client.rfms_customer_id;
  const hasNetsuite = !!client.netsuite_customer_id;

  if (!hasRfms && !hasNetsuite) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        {hasRfms && (
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 gap-1 bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400"
              >
                <img src={rfmsLogo} alt="RFMS" className="h-3.5 w-auto" />
                <CheckCircle2 className="h-3 w-3" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Synced to RFMS (ID: {client.rfms_customer_id})</p>
            </TooltipContent>
          </Tooltip>
        )}
        {hasNetsuite && (
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 gap-1 bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400"
              >
                <img src={netsuiteLogo} alt="NetSuite" className="h-3.5 w-auto" />
                <CheckCircle2 className="h-3 w-3" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Synced to NetSuite (ID: {client.netsuite_customer_id})</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
