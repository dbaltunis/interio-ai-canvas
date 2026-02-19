import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RefreshCw, CheckCircle2, Link2, Loader2, ExternalLink, Upload, Info, Check } from "lucide-react";
import rfmsLogo from "@/assets/rfms-logo.svg";
import netsuiteLogo from "@/assets/netsuite-logo.svg";
import { useIntegrations } from "@/hooks/useIntegrations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { showSuccessToast, showErrorToast } from "@/components/ui/use-toast";

interface IntegrationSyncStatusProps {
  project: {
    id?: string;
    rfms_quote_id?: string | null;
    rfms_order_id?: string | null;
    netsuite_estimate_id?: string | null;
    netsuite_sales_order_id?: string | null;
    netsuite_invoice_id?: string | null;
  };
  compact?: boolean;
  projectId?: string;
  onSyncComplete?: () => void;
}

interface SyncItem {
  system: string;
  integrationType: string;
  logo: string;
  logoClass: string;
  records: { label: string; id: string | null | undefined }[];
}

export const IntegrationSyncStatus = ({ project, compact = false, projectId, onSyncComplete }: IntegrationSyncStatusProps) => {
  const { integrations, isLoading } = useIntegrations();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pushingSystem, setPushingSystem] = useState<string | null>(null);
  const [justSynced, setJustSynced] = useState(false);

  const effectiveProjectId = projectId || project.id;

  const hasActiveIntegration = (type: string) =>
    integrations.some((i) => i.integration_type === type && i.active);

  // Check if quote creation is unavailable for this RFMS tier
  const rfmsIntegration = integrations.find((i) => i.integration_type === "rfms" && i.active);
  const quoteCreateUnavailable = !!(rfmsIntegration?.configuration as any)?.quote_create_unavailable;

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

  const handlePushToRFMS = async () => {
    if (!effectiveProjectId) return;
    setPushingSystem("rfms");
    try {
      const { data, error } = await supabase.functions.invoke("rfms-sync-quotes", {
        body: { direction: "push", projectId: effectiveProjectId },
      });
      if (error) throw error;
      const errorMsg = data?.errors?.[0] || "";
      const isTierError = errorMsg.includes("does not support") || errorMsg.includes("higher API tier");
      if (data?.errors?.length > 0) {
        if (isTierError) {
          toast({
            title: "RFMS Push Not Available",
            description: "Your RFMS plan doesn't support creating quotes. You can still pull/import quotes from RFMS.",
            variant: "warning",
            importance: "important",
          });
        } else {
          showErrorToast("RFMS Push Issue", errorMsg);
        }
      } else {
        showSuccessToast(
          "Pushed to RFMS",
          data?.summary || "Quote synced successfully",
          "important"
        );
        // Show brief visual success state
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 3000);
        // Invalidate project data so rfms_quote_id refreshes immediately
        if (effectiveProjectId) {
          queryClient.invalidateQueries({ queryKey: ["project-data", effectiveProjectId] });
          queryClient.invalidateQueries({ queryKey: ["project", effectiveProjectId] });
        }
        onSyncComplete?.();
      }
    } catch (err: any) {
      const errMsg = err?.message || "Could not push to RFMS";
      const isTierError = errMsg.includes("does not support") || errMsg.includes("higher API tier") || errMsg.includes("405");
      if (isTierError) {
        toast({
          title: "RFMS Push Not Available",
          description: "Your RFMS plan doesn't support creating quotes. You can still pull/import quotes from RFMS.",
          variant: "warning",
          importance: "important",
        });
      } else {
        showErrorToast("RFMS Push Failed", errMsg);
      }
    } finally {
      setPushingSystem(null);
    }
  };

  // Helper: should we show push button for RFMS?
  const shouldShowRFMSPush = (sync: SyncItem, hasSynced: boolean) => {
    if (sync.integrationType !== "rfms" || !effectiveProjectId) return false;
    // If already synced, always show re-sync (PUT works)
    if (hasSynced) return true;
    // If not synced and create is unavailable, don't show push button
    if (quoteCreateUnavailable) return false;
    return true;
  };

  // Compact mode for job header — uses Popover instead of Tooltip
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {syncItems.map((sync) => {
          const syncedRecords = sync.records.filter((r) => r.id);
          const hasSynced = syncedRecords.length > 0;
          const isPushing = pushingSystem === sync.integrationType;
          const showPush = shouldShowRFMSPush(sync, hasSynced);

          return (
            <Popover key={sync.system}>
              <PopoverTrigger asChild>
                <button type="button" className="cursor-pointer">
                  <Badge
                    variant="outline"
                    className={
                      hasSynced
                        ? "text-[10px] px-1.5 py-0 h-5 gap-1 bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400 cursor-pointer"
                        : "text-[10px] px-1.5 py-0 h-5 gap-1 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400 cursor-pointer"
                    }
                  >
                    <img src={sync.logo} alt={sync.system} className={sync.logoClass} />
                    {hasSynced ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Link2 className="h-3 w-3" />
                    )}
                  </Badge>
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-56 p-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <img src={sync.logo} alt={sync.system} className="h-5 w-auto" />
                    <span className="text-sm font-medium">{sync.system}</span>
                  </div>

                  {hasSynced ? (
                    <div className="space-y-1.5">
                      {syncedRecords.map((r) => (
                        <div key={r.label} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{r.label}</span>
                          <span className="font-mono text-foreground">{r.id}</span>
                        </div>
                      ))}
                      {showPush && (
                        <Button
                          size="xs"
                          variant={justSynced ? "success" : "outline"}
                          className="w-full mt-2"
                          onClick={handlePushToRFMS}
                          disabled={isPushing || justSynced}
                        >
                          {isPushing ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : justSynced ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          {justSynced ? "Synced!" : "Re-sync"}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {showPush ? (
                        <>
                          <p className="text-xs text-muted-foreground">
                            Connected — not yet synced for this job
                          </p>
                          <Button
                            size="xs"
                            variant={justSynced ? "success" : "default"}
                            className="w-full"
                            onClick={handlePushToRFMS}
                            disabled={isPushing || justSynced}
                          >
                            {isPushing ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : justSynced ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : (
                              <Upload className="h-3 w-3 mr-1" />
                            )}
                            {justSynced ? "Synced!" : "Push to RFMS"}
                          </Button>
                        </>
                      ) : sync.integrationType === "rfms" && quoteCreateUnavailable ? (
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <Info className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>Import-only — create new quotes in RFMS, then pull them here</span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Connected — not yet synced for this job
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    size="xs"
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground"
                    onClick={() => navigate("/settings?tab=integrations")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View in Settings
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
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
            const isPushing = pushingSystem === sync.integrationType;
            const showPush = shouldShowRFMSPush(sync, hasSynced);

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
                    <>
                      {syncedRecords.map((r) => (
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
                      ))}
                      {showPush && (
                        <Button
                          size="icon-xs"
                          variant={justSynced ? "success" : "ghost"}
                          onClick={handlePushToRFMS}
                          disabled={isPushing || justSynced}
                        >
                          {isPushing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : justSynced ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      {sync.integrationType === "rfms" && quoteCreateUnavailable ? (
                        <Badge variant="outline" className="text-xs">
                          <Info className="h-3 w-3 mr-1" />
                          Import-only
                        </Badge>
                      ) : (
                        <>
                          <Badge variant="info" className="text-xs">
                            <Link2 className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                          {showPush && (
                            <Button
                              size="xs"
                              variant={justSynced ? "success" : "outline"}
                              onClick={handlePushToRFMS}
                              disabled={isPushing || justSynced}
                            >
                              {isPushing ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : justSynced ? (
                                <Check className="h-3 w-3 mr-1" />
                              ) : (
                                <Upload className="h-3 w-3 mr-1" />
                              )}
                              {justSynced ? "Synced!" : "Push"}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
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