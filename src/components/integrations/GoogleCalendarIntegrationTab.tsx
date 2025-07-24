import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIntegrations } from "@/hooks/useIntegrations";
import type { GoogleCalendarIntegration } from "@/types/integrations";

interface GoogleCalendarIntegrationTabProps {
  integration?: any;
}

export const GoogleCalendarIntegrationTab = ({ integration }: GoogleCalendarIntegrationTabProps) => {
  const { createIntegration, updateIntegration, testConnection } = useIntegrations();
  
  const [formData, setFormData] = useState({
    client_id: integration?.api_credentials?.client_id || '',
    client_secret: integration?.api_credentials?.client_secret || '',
    refresh_token: integration?.api_credentials?.refresh_token || '',
    calendar_id: integration?.configuration?.calendar_id || 'primary',
    sync_appointments: integration?.configuration?.sync_appointments ?? true,
    auto_create_events: integration?.configuration?.auto_create_events ?? true,
    sync_direction: integration?.configuration?.sync_direction || 'both',
    event_duration_buffer: integration?.configuration?.event_duration_buffer || 15,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const integrationData = {
        integration_type: 'google_calendar' as const,
        active: true,
        api_credentials: {
          client_id: formData.client_id,
          client_secret: formData.client_secret,
          refresh_token: formData.refresh_token,
        },
        configuration: {
          calendar_id: formData.calendar_id,
          sync_appointments: formData.sync_appointments,
          auto_create_events: formData.auto_create_events,
          sync_direction: formData.sync_direction,
          event_duration_buffer: formData.event_duration_buffer,
        },
        last_sync: null,
      };

      if (integration) {
        await updateIntegration.mutateAsync({
          id: integration.id,
          updates: integrationData,
        });
      } else {
        await createIntegration.mutateAsync(integrationData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const testIntegration = {
        ...integration,
        api_credentials: {
          client_id: formData.client_id,
          client_secret: formData.client_secret,
          refresh_token: formData.refresh_token,
        },
      };

      await testConnection.mutateAsync(testIntegration);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Google Calendar Integration</h3>
          <p className="text-sm text-muted-foreground">
            Sync appointments and events with Google Calendar
          </p>
        </div>
        {integration && (
          <Badge variant={integration.active ? "default" : "secondary"}>
            {integration.active ? "Active" : "Inactive"}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OAuth Configuration</CardTitle>
          <CardDescription>
            Configure your Google Calendar API credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client ID</Label>
              <Input
                id="client_id"
                placeholder="Google OAuth Client ID"
                value={formData.client_id}
                onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_secret">Client Secret</Label>
              <Input
                id="client_secret"
                type="password"
                placeholder="Google OAuth Client Secret"
                value={formData.client_secret}
                onChange={(e) => setFormData(prev => ({ ...prev, client_secret: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="refresh_token">Refresh Token</Label>
              <Input
                id="refresh_token"
                type="password"
                placeholder="OAuth Refresh Token"
                value={formData.refresh_token}
                onChange={(e) => setFormData(prev => ({ ...prev, refresh_token: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={!formData.client_id || !formData.client_secret || isTesting}
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.client_id || !formData.client_secret || isLoading}
            >
              {isLoading ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendar Settings</CardTitle>
          <CardDescription>
            Configure how appointments sync with Google Calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendar_id">Calendar ID</Label>
            <Input
              id="calendar_id"
              placeholder="primary"
              value={formData.calendar_id}
              onChange={(e) => setFormData(prev => ({ ...prev, calendar_id: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              Use 'primary' for your main calendar or specify a calendar ID
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sync Appointments</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync appointments with Google Calendar
              </p>
            </div>
            <Switch
              checked={formData.sync_appointments}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, sync_appointments: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Create Events</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create calendar events for new appointments
              </p>
            </div>
            <Switch
              checked={formData.auto_create_events}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, auto_create_events: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sync_direction">Sync Direction</Label>
            <Select
              value={formData.sync_direction}
              onValueChange={(value: 'app_to_calendar' | 'calendar_to_app' | 'both') => 
                setFormData(prev => ({ ...prev, sync_direction: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sync direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="app_to_calendar">App → Calendar</SelectItem>
                <SelectItem value="calendar_to_app">Calendar → App</SelectItem>
                <SelectItem value="both">Bidirectional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_duration_buffer">Duration Buffer (minutes)</Label>
            <Input
              id="event_duration_buffer"
              type="number"
              min="0"
              max="60"
              value={formData.event_duration_buffer}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, event_duration_buffer: parseInt(e.target.value) || 15 }))
              }
            />
            <p className="text-sm text-muted-foreground">
              Extra time to add before/after appointments
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};