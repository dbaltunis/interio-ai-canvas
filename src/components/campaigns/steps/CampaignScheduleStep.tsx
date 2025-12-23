import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Zap, Clock, Info } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface CampaignScheduleStepProps {
  sendImmediately: boolean;
  scheduledAt?: Date;
  onUpdateSendImmediately: (value: boolean) => void;
  onUpdateScheduledAt: (date?: Date) => void;
}

export const CampaignScheduleStep = ({
  sendImmediately,
  scheduledAt,
  onUpdateSendImmediately,
  onUpdateScheduledAt,
}: CampaignScheduleStepProps) => {
  const [time, setTime] = useState("09:00");

  const handleDateSelect = (date?: Date) => {
    if (date) {
      const [hours, minutes] = time.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      onUpdateScheduledAt(date);
    } else {
      onUpdateScheduledAt(undefined);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (scheduledAt) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(scheduledAt);
      newDate.setHours(hours, minutes, 0, 0);
      onUpdateScheduledAt(newDate);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>When should this campaign be sent?</Label>

        <RadioGroup
          value={sendImmediately ? 'now' : 'scheduled'}
          onValueChange={(value) => onUpdateSendImmediately(value === 'now')}
          className="space-y-3"
        >
          {/* Send Now */}
          <label
            className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              sendImmediately
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <RadioGroupItem value="now" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-medium">Send Immediately</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Campaign will start sending as soon as you launch
              </p>
            </div>
          </label>

          {/* Schedule */}
          <label
            className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              !sendImmediately
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <RadioGroupItem value="scheduled" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">Schedule for Later</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a specific date and time
              </p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Date/Time Picker */}
      {!sendImmediately && (
        <div className="space-y-4 p-4 rounded-lg bg-muted/50">
          <div className="grid grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledAt ? format(scheduledAt, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledAt}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
              />
            </div>
          </div>

          {scheduledAt && (
            <div className="text-sm text-muted-foreground">
              Scheduled for: <strong>{format(scheduledAt, 'PPP')} at {format(scheduledAt, 'p')}</strong>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Tip:</strong> Emails sent between 9-11 AM on Tuesday-Thursday typically get the highest open rates.
        </div>
      </div>
    </div>
  );
};
