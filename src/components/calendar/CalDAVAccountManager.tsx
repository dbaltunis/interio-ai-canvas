import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Settings, Trash2, Calendar, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { 
  useCalDAVAccounts, 
  useCalDAVCalendars, 
  useAddCalDAVAccount, 
  useTestCalDAVConnection,
  useSyncCalDAVCalendar,
  useRemoveCalDAVAccount,
  useUpdateCalDAVCalendar 
} from "@/hooks/useCalDAV";

export const CalDAVAccountManager = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    account_name: "",
    email: "",
    username: "",
    password: "",
    server_url: "",
  });

  const { accounts, isLoading: accountsLoading } = useCalDAVAccounts();
  const { calendars, isLoading: calendarsLoading } = useCalDAVCalendars(selectedAccountId);
  const addAccount = useAddCalDAVAccount();
  const testConnection = useTestCalDAVConnection();
  const syncCalendar = useSyncCalDAVCalendar();
  const removeAccount = useRemoveCalDAVAccount();
  const updateCalendar = useUpdateCalDAVCalendar();

  const handleAddAccount = async () => {
    if (!newAccount.account_name || !newAccount.email || !newAccount.username || !newAccount.password) {
      return;
    }

    try {
      await addAccount.mutateAsync(newAccount);
      setNewAccount({
        account_name: "",
        email: "",
        username: "",
        password: "",
        server_url: "",
      });
      setShowAddAccount(false);
    } catch (error) {
      console.error("Failed to add account:", error);
    }
  };

  const handleTestConnection = async (account: any) => {
    await testConnection.mutateAsync(account);
  };

  const handleSyncCalendar = async (calendarId: string) => {
    await syncCalendar.mutateAsync(calendarId);
  };

  const handleRemoveAccount = async (accountId: string) => {
    await removeAccount.mutateAsync(accountId);
    if (selectedAccountId === accountId) {
      setSelectedAccountId(null);
    }
  };

  const handleToggleCalendarSync = async (calendarId: string, enabled: boolean) => {
    await updateCalendar.mutateAsync({
      calendarId,
      updates: { sync_enabled: enabled }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendar Accounts</h2>
          <p className="text-muted-foreground">
            Connect your calendar accounts to sync events automatically
          </p>
        </div>
        <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Calendar Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  placeholder="My Gmail Calendar"
                  value={newAccount.account_name}
                  onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Usually your email address"
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="App password or account password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="server_url">Server URL (Optional)</Label>
                <Input
                  id="server_url"
                  placeholder="https://caldav.example.com (auto-detected if empty)"
                  value={newAccount.server_url}
                  onChange={(e) => setNewAccount({ ...newAccount, server_url: e.target.value })}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleAddAccount}
                  disabled={addAccount.isPending}
                  className="flex-1"
                >
                  {addAccount.isPending ? "Connecting..." : "Add Account"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddAccount(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Connected Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <div className="text-center py-4">Loading accounts...</div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No calendar accounts connected</p>
                <p className="text-sm">Add an account to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAccountId === account.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedAccountId(account.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{account.account_name}</h4>
                        <p className="text-sm text-muted-foreground">{account.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {account.sync_enabled ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestConnection(account);
                            }}
                            disabled={testConnection.isPending}
                          >
                            Test
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Account</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "{account.account_name}"? 
                                  This will stop syncing all calendars from this account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveAccount(account.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                    {account.last_sync_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last sync: {new Date(account.last_sync_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendars List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendars
              {selectedAccountId && (
                <Badge variant="outline" className="ml-auto">
                  {calendars.length} calendar{calendars.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedAccountId ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select an account to view calendars</p>
              </div>
            ) : calendarsLoading ? (
              <div className="text-center py-4">Loading calendars...</div>
            ) : calendars.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No calendars found</p>
                <p className="text-sm">This account may not have any calendars</p>
              </div>
            ) : (
              <div className="space-y-3">
                {calendars.map((calendar) => (
                  <div key={calendar.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{calendar.display_name}</h4>
                        {calendar.description && (
                          <p className="text-sm text-muted-foreground">{calendar.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {calendar.color && (
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: calendar.color }}
                          />
                        )}
                        {calendar.read_only && (
                          <Badge variant="outline" className="text-xs">Read-only</Badge>
                        )}
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={calendar.sync_enabled}
                          onCheckedChange={(checked) => 
                            handleToggleCalendarSync(calendar.id, checked)
                          }
                        />
                        <Label className="text-sm">
                          {calendar.sync_enabled ? "Sync enabled" : "Sync disabled"}
                        </Label>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSyncCalendar(calendar.id)}
                        disabled={syncCalendar.isPending || !calendar.sync_enabled}
                      >
                        <RefreshCw className={`w-4 h-4 mr-1 ${syncCalendar.isPending ? 'animate-spin' : ''}`} />
                        Sync Now
                      </Button>
                    </div>
                    {calendar.last_sync_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last sync: {new Date(calendar.last_sync_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};