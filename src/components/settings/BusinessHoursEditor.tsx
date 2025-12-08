import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DayHours {
  isOpen: boolean;
  open: string;
  close: string;
}

interface BusinessHours {
  [day: string]: DayHours;
}

interface BusinessHoursEditorProps {
  value: BusinessHours;
  onChange: (hours: BusinessHours) => void;
}

const DAYS = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_HOURS: DayHours = {
  isOpen: true,
  open: "09:00",
  close: "17:00",
};

export function BusinessHoursEditor({ value, onChange }: BusinessHoursEditorProps) {
  const hours = value || {};

  const updateDay = (day: string, updates: Partial<DayHours>) => {
    const currentDay = hours[day] || DEFAULT_HOURS;
    onChange({
      ...hours,
      [day]: { ...currentDay, ...updates },
    });
  };

  const getDayHours = (day: string): DayHours => {
    return hours[day] || { ...DEFAULT_HOURS, isOpen: !["Saturday", "Sunday"].includes(day) };
  };

  return (
    <div className="space-y-3">
      {DAYS.map((day) => {
        const dayHours = getDayHours(day);
        return (
          <div
            key={day}
            className="flex items-center gap-4 p-3 rounded-lg border border-border bg-background"
          >
            <div className="w-28">
              <Label className="font-medium">{day}</Label>
            </div>
            <Switch
              checked={dayHours.isOpen}
              onCheckedChange={(isOpen) => updateDay(day, { isOpen })}
            />
            {dayHours.isOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="time"
                  value={dayHours.open}
                  onChange={(e) => updateDay(day, { open: e.target.value })}
                  className="w-32"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={dayHours.close}
                  onChange={(e) => updateDay(day, { close: e.target.value })}
                  className="w-32"
                />
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
