
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationConfig {
  inPerson: { enabled: boolean; address?: string };
  googleMeet: { enabled: boolean };
  zoom: { enabled: boolean; meetingId?: string };
  phone: { enabled: boolean; number?: string };
}

interface LocationSettingsProps {
  locations: LocationConfig;
  onChange: (locations: LocationConfig) => void;
}

export const LocationSettings = ({ locations, onChange }: LocationSettingsProps) => {
  const updateLocation = (type: keyof LocationConfig, updates: any) => {
    onChange({
      ...locations,
      [type]: { ...locations[type], ...updates }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Locations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>In-Person Meeting</Label>
            <Switch
              checked={locations.inPerson.enabled}
              onCheckedChange={(enabled) => updateLocation('inPerson', { enabled })}
            />
          </div>
          {locations.inPerson.enabled && (
            <Input
              placeholder="Meeting address"
              value={locations.inPerson.address || ''}
              onChange={(e) => updateLocation('inPerson', { address: e.target.value })}
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Google Meet</Label>
            <Switch
              checked={locations.googleMeet.enabled}
              onCheckedChange={(enabled) => updateLocation('googleMeet', { enabled })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Zoom</Label>
            <Switch
              checked={locations.zoom.enabled}
              onCheckedChange={(enabled) => updateLocation('zoom', { enabled })}
            />
          </div>
          {locations.zoom.enabled && (
            <Input
              placeholder="Zoom Meeting ID"
              value={locations.zoom.meetingId || ''}
              onChange={(e) => updateLocation('zoom', { meetingId: e.target.value })}
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Phone Call</Label>
            <Switch
              checked={locations.phone.enabled}
              onCheckedChange={(enabled) => updateLocation('phone', { enabled })}
            />
          </div>
          {locations.phone.enabled && (
            <Input
              placeholder="Phone number"
              value={locations.phone.number || ''}
              onChange={(e) => updateLocation('phone', { number: e.target.value })}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
