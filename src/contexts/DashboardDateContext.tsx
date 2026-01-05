import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths } from "date-fns";

interface DateRange {
  preset: string;
  startDate: Date;
  endDate: Date;
  label: string;
}

interface DashboardDateContextValue {
  dateRange: DateRange;
  setPreset: (preset: string) => void;
  setCustomRange: (start: Date, end: Date) => void;
}

const DashboardDateContext = createContext<DashboardDateContextValue | undefined>(undefined);

const PRESETS: Record<string, { label: string; getRange: () => { start: Date; end: Date } }> = {
  today: {
    label: "Today",
    getRange: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }),
  },
  yesterday: {
    label: "Yesterday",
    getRange: () => {
      const yesterday = subDays(new Date(), 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    },
  },
  "7days": {
    label: "Last 7 days",
    getRange: () => ({ start: startOfDay(subDays(new Date(), 6)), end: endOfDay(new Date()) }),
  },
  "30days": {
    label: "Last 30 days",
    getRange: () => ({ start: startOfDay(subDays(new Date(), 29)), end: endOfDay(new Date()) }),
  },
  "90days": {
    label: "Last 90 days",
    getRange: () => ({ start: startOfDay(subDays(new Date(), 89)), end: endOfDay(new Date()) }),
  },
  month: {
    label: "This month",
    getRange: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }),
  },
  "last-month": {
    label: "Last month",
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    },
  },
  quarter: {
    label: "This quarter",
    getRange: () => ({ start: startOfQuarter(new Date()), end: endOfQuarter(new Date()) }),
  },
  year: {
    label: "This year",
    getRange: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()) }),
  },
};

export const DashboardDateProvider = ({ children }: { children: ReactNode }) => {
  const [preset, setPresetState] = useState("90days");
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);

  const dateRange = useMemo<DateRange>(() => {
    if (preset === "custom" && customStart && customEnd) {
      return {
        preset: "custom",
        startDate: customStart,
        endDate: customEnd,
        label: "Custom",
      };
    }

    const presetConfig = PRESETS[preset] || PRESETS["30days"];
    const range = presetConfig.getRange();
    return {
      preset,
      startDate: range.start,
      endDate: range.end,
      label: presetConfig.label,
    };
  }, [preset, customStart, customEnd]);

  const setPreset = (newPreset: string) => {
    setPresetState(newPreset);
    setCustomStart(null);
    setCustomEnd(null);
  };

  const setCustomRange = (start: Date, end: Date) => {
    setPresetState("custom");
    setCustomStart(start);
    setCustomEnd(end);
  };

  return (
    <DashboardDateContext.Provider value={{ dateRange, setPreset, setCustomRange }}>
      {children}
    </DashboardDateContext.Provider>
  );
};

export const useDashboardDate = () => {
  const context = useContext(DashboardDateContext);
  if (!context) {
    throw new Error("useDashboardDate must be used within DashboardDateProvider");
  }
  return context;
};

export { PRESETS };
