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

  // Push error message state for specific errors
  const [pushError, setPushError] = useState<string | null>(null);

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
    if (!effectiveProjectId) {
      console.warn("[RFMS Push] No projectId available — cannot push");
      showErrorToast("Push Failed", "No project selected. Please open a specific job first.");
      return;
    }
    console.log("[RFMS Push] Starting push for project:", effectiveProjectId);
    setPushingSystem("rfms");
    setPushError(null);
    try {
      const { data, error } = await supabase.functions.invoke("rfms-sync-quotes", {
        body: { direction: "push", projectId: effectiveProjectId },
      });
      console.log("[RFMS Push] Response:", JSON.stringify(data), "Error:", error);

      if (error) throw error;
      
      // Check if the function itself returned an error
      if (data?.success === false && data?.error) {
        throw new Error(data.error);
      }

      const errorMsg = data?.errors?.[0] || "";
      const isTierError = errorMsg.includes("does not support") || errorMsg.includes("higher API tier");
      const didSomething = (data?.exported > 0) || (data?.updated > 0);
      
      if (data?.errors?.length > 0) {
        if (isTierError) {
          setPushError("Requires RFMS Enterprise tier — run diagnostics in Settings for details");
          toast({
            title: "RFMS Tier Restriction",
            description: "Your RFMS API tier doesn't support creating new quotes. Go to Settings → RFMS and run diagnostics to see what's supported.",
            variant: "warning" as any,
            importance: 'important',
          });
        } else {
          setPushError(null);
          showErrorToast("RFMS Push Issue", errorMsg);
        }
      } else if (!didSomething) {
        // Nothing changed — amber warning, not red error
        toast({
          title: "Nothing to sync",
          description: "No changes were pushed. The quote may already be up to date, or the project may not have quote data yet.",
          variant: "warning" as any,
          importance: 'important',
        });
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
          queryClient.invalidateQueries({ queryKey: ["projects", effectiveProjectId] });
        }
        onSyncComplete?.();
      }
    } catch (err: any) {
      console.error("[RFMS Push] Error:", err);
      const errMsg = err?.message || "Could not push to RFMS";
      const isTierError = errMsg.includes("does not support") || errMsg.includes("higher API tier") || errMsg.includes("405");
      if (isTierError) {
        setPushError("Requires RFMS Enterprise tier — run diagnostics in Settings for details");
        showErrorToast(
          "RFMS Push Not Available",
          "Your RFMS API tier may not support this. Run diagnostics in Settings → RFMS to check."
        );
      } else {
        setPushError(null);
        showErrorToast("RFMS Push Failed", errMsg);
      }
    } finally {
      setPushingSystem(null);
    }
  };

  // Helper: get RFMS integration config
  const getRFMSConfig = () =>
    integrations.find((i) => i.integration_type === "rfms" && i.active)?.configuration as Record<string, any> | undefined;

  const isRFMSReadOnly = getRFMSConfig()?.quote_create_unavailable === true;

  // Helper: should we show push button for RFMS?
  const shouldShowRFMSPush = (sync: SyncItem) => {
    if (sync.integrationType !== "rfms" || !effectiveProjectId) return false;
    if (isRFMSReadOnly) return false;
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
          const showPush = shouldShowRFMSPush(sync);

          return (
            <Popover key={sync.system}>
              <PopoverTrigger asChild>
                <button type="button" className="cursor-pointer">
                  <Badge
                    variant="outline"
                    className={
                      hasSynced
                        ? "text-[10px] px-1.5 py-0 h-5 gap-1 bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400 cursor-pointer"
                        : (sync.integrationType === "rfms" && isRFMSReadOnly)
                          ? "text-[10px] px-1.5 py-0 h-5 gap-1 bg-muted border-border text-muted-foreground cursor-pointer"
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
                      {sync.integrationType === "rfms" && isRFMSReadOnly ? (
                        <>
                          <p className="text-xs font-medium text-muted-foreground">
                            Connected (read-only)
                          </p>
                          <p className="text-[11px] text-muted-foreground/70 leading-snug">
                            Your RFMS plan supports reading data only. Pushing quotes requires a higher tier.
                          </p>
                        </>
                      ) : showPush ? (
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
            const showPush = shouldShowRFMSPush(sync);

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
                      <Badge variant={sync.integrationType === "rfms" && isRFMSReadOnly ? "muted" : "info"} className="text-xs">
                        <Link2 className="h-3 w-3 mr-1" />
                        {sync.integrationType === "rfms" && isRFMSReadOnly ? "Connected (read-only)" : "Connected"}
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