"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { MetricsRange } from "@/lib/metrics";

type DateRangeContextValue = {
  range: MetricsRange;
  customFrom: string;
  customTo: string;
  setRange: (nextRange: MetricsRange) => void;
  setCustomFrom: (value: string) => void;
  setCustomTo: (value: string) => void;
};

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

type DateRangeProviderProps = {
  children: React.ReactNode;
  initialRange?: MetricsRange;
};

export function DateRangeProvider({
  children,
  initialRange = "30d",
}: DateRangeProviderProps) {
  const [range, setRange] = useState<MetricsRange>(initialRange);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const value = useMemo(
    () => ({
      range,
      customFrom,
      customTo,
      setRange,
      setCustomFrom,
      setCustomTo,
    }),
    [customFrom, customTo, range],
  );

  return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>;
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within DateRangeProvider");
  }
  return context;
}
