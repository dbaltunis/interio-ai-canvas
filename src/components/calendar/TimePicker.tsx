import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Plus, Minus } from "lucide-react";

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

export const TimePicker = ({ label, value, onChange, className }: TimePickerProps) => {
  const [hour, minute] = value.split(':').map(Number);
  
  const updateTime = (newHour: number, newMinute: number) => {
    const formattedTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
    onChange(formattedTime);
  };

  const incrementHour = () => {
    const newHour = hour < 23 ? hour + 1 : 0;
    updateTime(newHour, minute);
  };

  const decrementHour = () => {
    const newHour = hour > 0 ? hour - 1 : 23;
    updateTime(newHour, minute);
  };

  const incrementMinute = () => {
    if (minute < 45) {
      updateTime(hour, minute + 15);
    } else {
      updateTime(hour < 23 ? hour + 1 : 0, 0);
    }
  };

  const decrementMinute = () => {
    if (minute > 0) {
      updateTime(hour, minute - 15);
    } else {
      updateTime(hour > 0 ? hour - 1 : 23, 45);
    }
  };

  return (
    <div className={className}>
      <Label className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4" />
        {label}
      </Label>
      <div className="flex items-center gap-2">
        {/* Hour controls */}
        <div className="flex flex-col items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 w-8 p-0"
            onClick={incrementHour}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <div className="text-lg font-mono font-semibold w-8 text-center py-1">
            {hour.toString().padStart(2, '0')}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 w-8 p-0"
            onClick={decrementHour}
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>

        <div className="text-xl font-semibold">:</div>

        {/* Minute controls */}
        <div className="flex flex-col items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 w-8 p-0"
            onClick={incrementMinute}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <div className="text-lg font-mono font-semibold w-8 text-center py-1">
            {minute.toString().padStart(2, '0')}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 w-8 p-0"
            onClick={decrementMinute}
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>

        {/* Quick time presets */}
        <div className="ml-4">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => {
                const hours = i.toString().padStart(2, '0');
                return [
                  <SelectItem key={`${hours}:00`} value={`${hours}:00`}>{hours}:00</SelectItem>,
                  <SelectItem key={`${hours}:30`} value={`${hours}:30`}>{hours}:30</SelectItem>
                ];
              }).flat()}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

interface DurationPickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export const DurationPicker = ({ startTime, endTime, onStartTimeChange, onEndTimeChange }: DurationPickerProps) => {
  const commonDurations = [
    { label: "15 min", minutes: 15 },
    { label: "30 min", minutes: 30 },
    { label: "1 hour", minutes: 60 },
    { label: "1.5 hours", minutes: 90 },
    { label: "2 hours", minutes: 120 },
    { label: "3 hours", minutes: 180 },
  ];

  const setDuration = (minutes: number) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = startTotalMinutes + minutes;
    
    const endHour = Math.floor(endTotalMinutes / 60) % 24;
    const endMinute = endTotalMinutes % 60;
    
    onEndTimeChange(`${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <TimePicker
          label="Start Time"
          value={startTime}
          onChange={onStartTimeChange}
        />
        <TimePicker
          label="End Time"
          value={endTime}
          onChange={onEndTimeChange}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Quick Duration</Label>
        <div className="flex flex-wrap gap-2">
          {commonDurations.map((duration) => (
            <Button
              key={duration.minutes}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDuration(duration.minutes)}
              className="text-xs"
            >
              {duration.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};