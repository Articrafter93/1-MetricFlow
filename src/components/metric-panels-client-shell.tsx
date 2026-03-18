"use client";

import dynamic from "next/dynamic";
import type { MetricsResponse } from "@/lib/metrics";

const MetricPanels = dynamic(
  () => import("@/components/metric-panels").then((mod) => mod.MetricPanels),
  {
    ssr: false,
    loading: () => <div className="glass-panel h-96 animate-pulse" />,
  },
);

type MetricPanelsClientShellProps = {
  tenantSlug: string;
  workspaceName: string;
  initialData: MetricsResponse;
};

export function MetricPanelsClientShell(props: MetricPanelsClientShellProps) {
  return <MetricPanels {...props} />;
}
