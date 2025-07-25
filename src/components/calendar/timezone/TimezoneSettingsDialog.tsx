import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTimezone, TimezoneInfo } from "@/hooks/useTimezone";
import { TimezoneUtils } from "@/utils/timezoneUtils";
import { Clock, Globe, MapPin, Info } from "lucide-react";

interface TimezoneSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TimezoneSettingsDialog = ({ open, onOpenChange }: TimezoneSettingsDialogProps) => {
  const { 
    userTimezone, 
    setUserTimezone, 
    detectedTimezone, 
    getAllTimezones,
    isTimezoneDifferent,
    getCurrentOffset 
  } = useTimezone();

  const [selectedTimezone, setSelectedTimezone] = useState(userTimezone);
  const allTimezones = getAllTimezones();

  const handleSave = () => {
    setUserTimezone(selectedTimezone);
    onOpenChange(false);
  };

  const handleDetectedTimezone = () => {
    setSelectedTimezone(detectedTimezone);
  };

  const getCurrentTime = (timezone: string) => {
    return TimezoneUtils.formatInTimezone(new Date(), timezone, 'PPp');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Timezone Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Current Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your timezone:</span>
                <Badge variant="outline">{userTimezone}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current time:</span>
                <span className="text-sm font-medium">{getCurrentTime(userTimezone)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">UTC offset:</span>
                <span className="text-sm font-medium">{getCurrentOffset(userTimezone)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timezone Detection Warning */}
          {isTimezoneDifferent() && (
            <Card className="border-warning/50 bg-warning/10">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Info className="h-4 w-4 text-warning mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-warning-foreground">
                      Your browser detected a different timezone: <strong>{detectedTimezone}</strong>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDetectedTimezone}
                      className="border-warning text-warning hover:bg-warning/20"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Use Detected Timezone
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Timezone Selection */}
          <div className="space-y-3">
            <Label htmlFor="timezone-select">Select Timezone</Label>
            <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
              <SelectTrigger id="timezone-select">
                <SelectValue placeholder="Choose a timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {allTimezones.map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{timezone.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {timezone.offset}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Preview of selected timezone */}
            {selectedTimezone !== userTimezone && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Preview:</span>
                      <span className="font-medium">{getCurrentTime(selectedTimezone)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">UTC offset:</span>
                      <span className="font-medium">{getCurrentOffset(selectedTimezone)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Timezone
            </Button>
          </div>

          {/* Info Note */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p>
              <strong>Note:</strong> Changing your timezone will affect how appointment times are displayed. 
              All existing appointments will be converted to show the correct times in your new timezone.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};