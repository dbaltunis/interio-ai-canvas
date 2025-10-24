import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CalendarAccount {
  id: string;
  account_name: string;
  email: string;
  sync_enabled: boolean;
  last_sync_at: string | null;
}

const CALENDAR_PROVIDERS = [
  { value: "google", label: "Google Calendar", serverUrl: "https://caldav.google.com" },
  { value: "icloud", label: "Apple iCloud", serverUrl: "https://caldav.icloud.com" },
  { value: "outlook", label: "Outlook / Office 365", serverUrl: "https://outlook.office365.com" },
  { value: "yahoo", label: "Yahoo Calendar", serverUrl: "https://caldav.calendar.yahoo.com" },
];

export const SimpleCalendarSetup = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [provider, setProvider] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Fetch calendar accounts
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["calendar-accounts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("caldav_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CalendarAccount[];
    },
  });

  // Add calendar account
  const addAccount = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const selectedProvider = CALENDAR_PROVIDERS.find(p => p.value === provider);
      if (!selectedProvider) throw new Error("Please select a provider");

      // Add account using edge function
      const { data, error } = await supabase.functions.invoke("caldav-add-account", {
        body: {
          email,
          password,
          serverUrl: selectedProvider.serverUrl,
          accountName: selectedProvider.label,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-accounts"] });
      toast({
        title: "Success",
        description: "Calendar account connected successfully",
      });
      setShowAddForm(false);
      setEmail("");
      setPassword("");
      setProvider("");
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect calendar account. Check your credentials.",
        variant: "destructive",
      });
    },
  });

  // Remove account
  const removeAccount = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from("caldav_accounts")
        .update({ active: false })
        .eq("id", accountId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-accounts"] });
      toast({
        title: "Success",
        description: "Calendar account removed",
      });
    },
  });

  // Sync account
  const syncAccount = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase.functions.invoke("caldav-sync", {
        body: { accountId },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Sync Started",
        description: "Your calendar is syncing in the background",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Accounts
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
          >
            {showAddForm ? "Cancel" : "Add Calendar"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Calendar Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your calendar provider" />
                </SelectTrigger>
                <SelectContent>
                  {CALENDAR_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your calendar password"
              />
              <p className="text-xs text-muted-foreground">
                For Google/Apple, use an app-specific password
              </p>
            </div>

            <Button
              onClick={() => addAccount.mutate()}
              disabled={!provider || !email || !password || addAccount.isPending}
              className="w-full"
            >
              {addAccount.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {addAccount.isPending ? "Connecting..." : "Connect Calendar"}
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Loading calendar accounts...</p>
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{account.account_name}</p>
                    <p className="text-sm text-muted-foreground">{account.email}</p>
                    {account.last_sync_at && (
                      <p className="text-xs text-muted-foreground">
                        Last synced: {new Date(account.last_sync_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {account.sync_enabled ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => syncAccount.mutate(account.id)}
                    disabled={syncAccount.isPending}
                  >
                    Sync Now
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAccount.mutate(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No calendar accounts connected. Click "Add Calendar" to get started.
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Need help?</strong>
            <br />
            • Google/Apple: Generate an app-specific password in your account settings
            <br />
            • Sync happens automatically every 15 minutes
            <br />• Use "Sync Now" to sync immediately
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
