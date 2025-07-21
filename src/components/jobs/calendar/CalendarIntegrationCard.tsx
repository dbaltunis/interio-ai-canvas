
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Settings, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendar";

export const CalendarIntegrationCard = () => {
  const {
    integration,
    isLoading,
    isConnected,
    connect,
    disconnect,
    toggleSync,
    isConnecting,
    isDisconnecting
  } = useGoogleCalendarIntegration();

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleToggleSync = () => {
    toggleSync(!integration?.sync_enabled);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">
                    Google Calendar is connected
                  </p>
                  <p className="text-sm text-green-600">
                    Appointments will automatically sync to your Google Calendar
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleToggleSync}
                  >
                    {integration?.sync_enabled ? "Disable Sync" : "Enable Sync"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                  >
                    {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-800">Auto-Sync</div>
                  <div className="text-blue-600">
                    {integration?.sync_enabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-800">Calendar</div>
                  <div className="text-purple-600">
                    {integration?.calendar_id || "Primary"}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-800">Status</div>
                  <div className="text-gray-600">Active</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-6 bg-gray-50 rounded-lg">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Connect Google Calendar
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Automatically sync your project appointments with Google Calendar
                  for better scheduling and notifications.
                </p>
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex items-center gap-2"
                >
                  {isConnecting ? (
                    "Connecting..."
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Connect Google Calendar
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium mb-2">✨ Features you'll get:</div>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Automatic appointment sync</li>
                    <li>• Calendar notifications</li>
                    <li>• Schedule conflict detection</li>
                  </ul>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium mb-2">🔒 Privacy & Security:</div>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Read/write calendar access only</li>
                    <li>• No access to other Google data</li>
                    <li>• Disconnect anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
