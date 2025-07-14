
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, RefreshCw, Unlink, CheckCircle, AlertCircle } from "lucide-react";
import { useGoogleCalendarIntegration, useGoogleCalendarSync } from "@/hooks/useGoogleCalendar";
import { format } from "date-fns";

export const GoogleCalendarIntegration = () => {
  const {
    integration,
    isLoading,
    isConnected,
    connect,
    disconnect,
    toggleSync,
    isConnecting,
    isDisconnecting,
  } = useGoogleCalendarIntegration();

  const {
    syncToGoogle,
    syncFromGoogle,
    isSyncingToGoogle,
    isSyncingFromGoogle,
  } = useGoogleCalendarSync();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          Sync your appointments with Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className="font-medium">
                {isConnected ? "Connected" : "Not Connected"}
              </span>
            </div>
            {isConnected && (
              <Badge variant="secondary">
                {integration?.sync_enabled ? "Sync Enabled" : "Sync Disabled"}
              </Badge>
            )}
          </div>
          
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect()}
              disabled={isDisconnecting}
              className="text-red-600 hover:text-red-700"
            >
              <Unlink className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={() => connect()}
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Connect Google Calendar
            </Button>
          )}
        </div>

        {isConnected && integration && (
          <>
            <Separator />
            
            {/* Integration Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Integration Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Connected:</span>
                    <div className="font-medium">
                      {format(new Date(integration.created_at), 'PPP')}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Updated:</span>
                    <div className="font-medium">
                      {format(new Date(integration.updated_at), 'PPP')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sync Settings */}
              <div className="space-y-3">
                <h4 className="font-medium">Sync Settings</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable Automatic Sync</div>
                    <div className="text-sm text-gray-500">
                      Automatically sync appointments with Google Calendar
                    </div>
                  </div>
                  <Switch
                    checked={integration.sync_enabled}
                    onCheckedChange={toggleSync}
                  />
                </div>
              </div>

              {/* Manual Sync Actions */}
              <div className="space-y-3">
                <h4 className="font-medium">Manual Sync</h4>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncFromGoogle()}
                    disabled={isSyncingFromGoogle || !integration.sync_enabled}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSyncingFromGoogle ? 'animate-spin' : ''}`} />
                    Sync from Google
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* This would sync all appointments */}}
                    disabled={isSyncingToGoogle || !integration.sync_enabled}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSyncingToGoogle ? 'animate-spin' : ''}`} />
                    Sync to Google
                  </Button>
                </div>
                
                {!integration.sync_enabled && (
                  <p className="text-sm text-gray-500">
                    Enable automatic sync to use manual sync features
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Instructions */}
        {!isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Getting Started</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Connect Google Calendar" to start the authentication process</li>
              <li>• Grant permission to access your Google Calendar</li>
              <li>• Enable automatic sync to keep appointments synchronized</li>
              <li>• Use manual sync options for immediate updates</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
