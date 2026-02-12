import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import rfmsLogo from "@/assets/rfms-logo.svg";
import netsuiteLogo from "@/assets/netsuite-logo.svg";

interface IntegrationSyncStatusProps {
  /** Project data with integration IDs */
  project: {
    rfms_quote_id?: string | null;
    rfms_order_id?: string | null;
    netsuite_estimate_id?: string | null;
    netsuite_sales_order_id?: string | null;
    netsuite_invoice_id?: string | null;
  };
  /** Optional: compact mode for inline display */
  compact?: boolean;
}

interface SyncItem {
  system: string;
  logo: string;
  logoClass: string;
  records: { label: string; id: string | null | undefined }[];
}

/**
 * Displays integration sync status badges for a project.
 * Shows which ERP systems have received data from this project.
 */
export const IntegrationSyncStatus = ({ project, compact = false }: IntegrationSyncStatusProps) => {
  const syncItems: SyncItem[] = [
    {
      system: "RFMS",
      logo: rfmsLogo,
      logoClass: "h-4 w-auto",
      records: [
        { label: "Quote", id: project.rfms_quote_id },
        { label: "Order", id: project.rfms_order_id },
      ],
    },
    {
      system: "NetSuite",
      logo: netsuiteLogo,
      logoClass: "h-4 w-auto",
      records: [
        { label: "Estimate", id: project.netsuite_estimate_id },
        { label: "Sales Order", id: project.netsuite_sales_order_id },
        { label: "Invoice", id: project.netsuite_invoice_id },
      ],
    },
  ];

  // Filter to only show systems that have at least one synced record
  const activeSyncs = syncItems.filter((s) =>
    s.records.some((r) => r.id)
  );

  // In compact mode, just show small badges inline
  if (compact) {
    if (activeSyncs.length === 0) return null;

    return (
      <TooltipProvider>
        <div className="flex items-center gap-1.5">
          {activeSyncs.map((sync) => {
            const syncedRecords = sync.records.filter((r) => r.id);
            return (
              <Tooltip key={sync.system}>
                <TooltipTrigger>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-5 gap-1 bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400"
                  >
                    <img src={sync.logo} alt={sync.system} className={sync.logoClass} />
                    <CheckCircle2 className="h-3 w-3" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="text-xs">
                    <p className="font-medium mb-1">Synced to {sync.system}</p>
                    {syncedRecords.map((r) => (
                      <p key={r.label} className="text-muted-foreground">
                        {r.label}: {r.id}
                      </p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  // Full card mode for project detail page
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
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Not synced
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {activeSyncs.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            No data has been synced to ERP systems yet. Use Settings &gt; Integrations &gt; ERP &amp; Business to configure and sync.
          </p>
        )}
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
