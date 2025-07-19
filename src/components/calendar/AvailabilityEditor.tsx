
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  day: number;
  enabled: boolean;
  slots: TimeSlot[];
}

interface AvailabilityEditorProps {
  availability: DayAvailability[];
  onChange: (availability: DayAvailability[]) => void;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const AvailabilityEditor = ({ availability, onChange }: AvailabilityEditorProps) => {
  const updateDay = (dayIndex: number, updates: Partial<DayAvailability>) => {
    const newAvailability = availability.map((day, index) => 
      index === dayIndex ? { ...day, ...updates } : day
    );
    onChange(newAvailability);
  };

  const addTimeSlot = (dayIndex: number) => {
    const day = availability[dayIndex];
    const newSlots = [...day.slots, { start: "09:00", end: "17:00" }];
    updateDay(dayIndex, { slots: newSlots });
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const day = availability[dayIndex];
    const newSlots = day.slots.filter((_, index) => index !== slotIndex);
    updateDay(dayIndex, { slots: newSlots });
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    const day = availability[dayIndex];
    const newSlots = day.slots.map((slot, index) => 
      index === slotIndex ? { ...slot, [field]: value } : slot
    );
    updateDay(dayIndex, { slots: newSlots });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availability.map((day, dayIndex) => (
          <div key={day.day} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{dayNames[day.day]}</Label>
              <Switch
                checked={day.enabled}
                onCheckedChange={(enabled) => updateDay(dayIndex, { enabled })}
              />
            </div>
            
            {day.enabled && (
              <div className="ml-4 space-y-2">
                {day.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'start', e.target.value)}
                      className="w-24"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'end', e.target.value)}
                      className="w-24"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                      disabled={day.slots.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeSlot(dayIndex)}
                  className="ml-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Time Slot
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
