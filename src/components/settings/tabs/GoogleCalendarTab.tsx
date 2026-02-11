import { useState } from "react";
import { GoogleCalendarSetup } from "@/components/calendar/GoogleCalendarSetup";
import { OutlookCalendarSetup } from "@/components/calendar/OutlookCalendarSetup";
import { NylasCalendarSetup } from "@/components/calendar/NylasCalendarSetup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, CheckCircle2, XCircle, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiagResult {
  supabase_url: string;
  google: {
    client_id_set: boolean;
    client_id_prefix: string;
    client_secret_set: boolean;
    client_secret_length: number;
    redirect_uri: string;
    instructions: string;
    token_endpoint_reachable?: boolean;
  };
  nylas: {
    client_id_set: boolean;
    client_id_prefix: string;
    api_key_set: boolean;
    api_key_length: number;
    api_uri: string;
    redirect_uri: string;
    instructions: string;
  };
}

export const GoogleCalendarTab = () => {
  const [diagResult, setDiagResult] = useState<DiagResult | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [showDiag, setShowDiag] = useState(false);

  const runDiagnostics = async () => {
    setIsDiagnosing(true);
    try {
      const { data, error } = await supabase.functions.invoke('calendar-diagnose');
      if (error) throw error;
      setDiagResult(data);
      setShowDiag(true);

      const issues = [];
      if (!data.google.client_id_set) issues.push('Google Client ID');
      if (!data.google.client_secret_set) issues.push('Google Client Secret');
      if (!data.nylas.client_id_set) issues.push('Nylas Client ID');
      if (!data.nylas.api_key_set) issues.push('Nylas API Key');

      if (issues.length > 0) {
        toast.error(`Missing: ${issues.join(', ')}`, { description: 'Set these in Supabase Dashboard → Edge Functions → Secrets' });
      } else {
        toast.success('All credentials configured', { description: 'Check redirect URIs below if auth still fails' });
      }
    } catch (err: any) {
      toast.error('Diagnostics failed', { description: err.message });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const StatusBadge = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {ok ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
      <span className="text-sm">{label}</span>
      <Badge variant={ok ? "default" : "destructive"} className="text-xs">
        {ok ? "Set" : "Missing"}
      </Badge>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your calendars to sync appointments automatically. Use Nylas for the easiest Google & Outlook setup, or connect directly.
        </p>
      </div>

      <NylasCalendarSetup />
      <GoogleCalendarSetup />
      <OutlookCalendarSetup />

      {/* Diagnostics Section */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Connection Diagnostics</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={diagResult ? () => setShowDiag(!showDiag) : runDiagnostics}
              disabled={isDiagnosing}
            >
              {isDiagnosing ? "Checking..." : diagResult ? (
                <>
                  {showDiag ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                  {showDiag ? "Hide" : "Show"} Results
                </>
              ) : "Diagnose Connection"}
            </Button>
          </div>
          <CardDescription>
            Having trouble connecting? Run diagnostics to check if credentials and redirect URIs are configured correctly.
          </CardDescription>
        </CardHeader>

        {showDiag && diagResult && (
          <CardContent className="space-y-6">
            {/* Google Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Google Calendar (Direct)</h4>
              <div className="space-y-2 pl-2">
                <StatusBadge ok={diagResult.google.client_id_set} label={`Client ID: ${diagResult.google.client_id_prefix}`} />
                <StatusBadge ok={diagResult.google.client_secret_set} label={`Client Secret: ${diagResult.google.client_secret_set ? `${diagResult.google.client_secret_length} chars` : 'Not set'}`} />
                {diagResult.google.token_endpoint_reachable !== undefined && (
                  <StatusBadge ok={diagResult.google.token_endpoint_reachable} label="Google Token Endpoint" />
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Redirect URI:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">{diagResult.google.redirect_uri}</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(diagResult.google.redirect_uri, 'Google redirect URI')}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{diagResult.google.instructions}</p>
              </div>
            </div>

            {/* Nylas Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Nylas (Google & Outlook via Nylas)</h4>
              <div className="space-y-2 pl-2">
                <StatusBadge ok={diagResult.nylas.client_id_set} label={`Client ID: ${diagResult.nylas.client_id_prefix}`} />
                <StatusBadge ok={diagResult.nylas.api_key_set} label={`API Key: ${diagResult.nylas.api_key_set ? `${diagResult.nylas.api_key_length} chars` : 'Not set'}`} />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">API Region:</span>
                  <Badge variant="outline" className="text-xs">{diagResult.nylas.api_uri.includes('eu') ? 'EU' : 'US'}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Redirect URI:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">{diagResult.nylas.redirect_uri}</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(diagResult.nylas.redirect_uri, 'Nylas redirect URI')}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{diagResult.nylas.instructions}</p>
              </div>
            </div>

            {/* Re-run button */}
            <Button variant="outline" size="sm" onClick={runDiagnostics} disabled={isDiagnosing} className="w-full">
              {isDiagnosing ? "Checking..." : "Re-run Diagnostics"}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
