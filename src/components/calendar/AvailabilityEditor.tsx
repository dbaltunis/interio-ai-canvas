import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Copy } from "lucide-react";

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

interface AvailabilityEditorProps {
  availability: Record<string, DayAvailability> | any; // Accept both formats
  onChange: (availability: Record<string, DayAvailability>) => void;
}

const WEEKDAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

export const AvailabilityEditor = ({ availability, onChange }: AvailabilityEditorProps) => {
  // Convert array format to object format if needed
  const convertAvailabilityToObject = (avail: any): Record<string, DayAvailability> => {
    if (Array.isArray(avail)) {
      const converted: Record<string, DayAvailability> = {};
      avail.forEach(dayData => {
        converted[dayData.day] = {
          enabled: dayData.enabled,
          timeSlots: dayData.timeSlots || []
        };
      });
      return converted;
    }
    return avail || {};
  };

  // Initialize availability if empty
  const ensureAvailability = () => {
    const converted = convertAvailabilityToObject(availability);
    if (!converted || Object.keys(converted).length === 0) {
      const defaultAvailability: Record<string, DayAvailability> = {};
      WEEKDAYS.forEach(day => {
        defaultAvailability[day.key] = {
          enabled: day.key !== 'saturday' && day.key !== 'sunday',
          timeSlots: [{ start: '09:00', end: '17:00' }]
        };
      });
      onChange(defaultAvailability);
      return defaultAvailability;
    }
    return converted;
  };

  const currentAvailability = ensureAvailability();

  const toggleDay = (dayKey: string) => {
    const updated = {
      ...currentAvailability,
      [dayKey]: {
        ...currentAvailability[dayKey],
        enabled: !currentAvailability[dayKey]?.enabled
      }
    };
    onChange(updated);
  };

  const addTimeSlot = (dayKey: string) => {
    const existingSlots = currentAvailability[dayKey]?.timeSlots || [];
    let newStart = '09:00';
    let newEnd = '17:00';
    
    // If there are existing slots, start from the end of the last one
    if (existingSlots.length > 0) {
      const lastSlot = existingSlots[existingSlots.length - 1];
      newStart = lastSlot.end;
      // Add 1 hour to the end time as default
      const [hours, minutes] = lastSlot.end.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours + 1, minutes, 0, 0);
      newEnd = endTime.toTimeString().slice(0, 5);
    }
    
    const updated = {
      ...currentAvailability,
      [dayKey]: {
        ...currentAvailability[dayKey],
        timeSlots: [
          ...existingSlots,
          { start: newStart, end: newEnd }
        ]
      }
    };
    onChange(updated);
  };

  const copyDaySchedule = (fromDay: string, toDay: string) => {
    const sourceData = currentAvailability[fromDay];
    if (!sourceData) return;
    
    const updated = {
      ...currentAvailability,
      [toDay]: {
        enabled: sourceData.enabled,
        timeSlots: [...(sourceData.timeSlots || [])]
      }
    };
    onChange(updated);
  };

  const removeTimeSlot = (dayKey: string, index: number) => {
    const updated = {
      ...currentAvailability,
      [dayKey]: {
        ...currentAvailability[dayKey],
        timeSlots: (currentAvailability[dayKey]?.timeSlots || []).filter((_, i) => i !== index)
      }
    };
    onChange(updated);
  };

  const updateTimeSlot = (dayKey: string, index: number, field: 'start' | 'end', value: string) => {
    const updated = {
      ...currentAvailability,
      [dayKey]: {
        ...currentAvailability[dayKey],
        timeSlots: (currentAvailability[dayKey]?.timeSlots || []).map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {WEEKDAYS.map((day) => {
        const dayData = currentAvailability[day.key] || { enabled: false, timeSlots: [] };
        
        return (
          <div key={day.key} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={dayData.enabled}
                  onCheckedChange={() => toggleDay(day.key)}
                />
                <span className="font-medium">{day.label}</span>
              </div>
              <div className="flex gap-2">
                {dayData.enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeSlot(day.key)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Slot
                  </Button>
                )}
                {dayData.enabled && day.key !== 'monday' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyDaySchedule('monday', day.key)}
                    title="Copy Monday's schedule"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Mon
                  </Button>
                )}
              </div>
            </div>
            
            {dayData.enabled && (
              <div className="space-y-2">
                {(dayData.timeSlots || []).map((slot, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateTimeSlot(day.key, index, 'start', e.target.value)}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateTimeSlot(day.key, index, 'end', e.target.value)}
                      className="w-24"
                    />
                    {dayData.timeSlots.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTimeSlot(day.key, index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};