import { Role } from "@prisma/client";
import { subDays } from "date-fns";
import type { MetricsQueryInput, MetricsResponse } from "@/lib/metrics";
import type { TenantRequestContext } from "@/lib/tenant-context";

export const DEMO_WORKSPACE = {
  id: "demo-workspace",
  name: "MetricFlow Demo Agency",
  slug: "metricflow-demo",
  logoUrl:
    "https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=200&q=80",
} as const;

export const DEMO_CLIENT = {
  id: "demo-client-alpha",
  name: "Growth Client Alpha",
  timezone: "America/Bogota",
} as const;

export const DEMO_USERS = {
  owner: {
    id: "demo-user-owner",
    email: "owner@metricflow.dev",
    name: "Owner Demo",
    role: Role.OWNER,
  },
  manager: {
    id: "demo-user-manager",
    email: "manager@metricflow.dev",
    name: "Manager Demo",
    role: Role.MANAGER,
  },
  client: {
    id: "demo-user-client",
    email: "client@metricflow.dev",
    name: "Client Demo",
    role: Role.CLIENT,
  },
} as const;

const DEMO_MEMBERS = [
  {
    id: "demo-membership-owner",
    name: DEMO_USERS.owner.name,
    email: DEMO_USERS.owner.email,
    role: DEMO_USERS.owner.role,
  },
  {
    id: "demo-membership-manager",
    name: DEMO_USERS.manager.name,
    email: DEMO_USERS.manager.email,
    role: DEMO_USERS.manager.role,
  },
  {
    id: "demo-membership-client",
    name: DEMO_USERS.client.name,
    email: DEMO_USERS.client.email,
    role: DEMO_USERS.client.role,
  },
] as const;

const DEMO_CLIENTS = [
  {
    id: DEMO_CLIENT.id,
    name: DEMO_CLIENT.name,
    timezone: DEMO_CLIENT.timezone,
    createdAt: new Date().toISOString(),
  },
] as const;

type DemoSnapshot = {
  metricDate: Date;
  funnelVisits: number;
  funnelLeads: number;
  funnelDeals: number;
  mrr: number;
  retentionRate: number;
  conversionRate: number;
  churnRate: number;
};

function isProductionDemoEnabled() {
  return process.env.NODE_ENV === "production" && process.env.DEMO_ACCESS !== "0";
}

export function isDemoMode() {
  return isProductionDemoEnabled();
}

export function getDemoAuthUser(email: string, password: string) {
  if (password !== "Demo12345!") {
    return null;
  }

  return getDemoUserProfile(email);
}

export function getDemoUserProfile(email: string) {
  const normalized = email.toLowerCase();
  return getDemoUserProfileById(
    normalized === DEMO_USERS.owner.email
      ? DEMO_USERS.owner.id
      : normalized === DEMO_USERS.manager.email
        ? DEMO_USERS.manager.id
        : normalized === DEMO_USERS.client.email
          ? DEMO_USERS.client.id
          : "",
  );
}

export function getDemoUserProfileById(userId: string) {
  const user =
    userId === DEMO_USERS.owner.id
      ? DEMO_USERS.owner
      : userId === DEMO_USERS.manager.id
        ? DEMO_USERS.manager
        : userId === DEMO_USERS.client.id
          ? DEMO_USERS.client
          : null;

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    workspaceId: DEMO_WORKSPACE.id,
    workspaceSlug: DEMO_WORKSPACE.slug,
    workspaceName: DEMO_WORKSPACE.name,
    workspaceLogoUrl: DEMO_WORKSPACE.logoUrl,
  };
}

export function getDemoTenantContext(
  userId: string,
  email: string,
  role: Role,
): TenantRequestContext {
  return {
    userId,
    email,
    role,
    workspaceId: DEMO_WORKSPACE.id,
    workspaceSlug: DEMO_WORKSPACE.slug,
    workspaceName: DEMO_WORKSPACE.name,
    workspaceLogoUrl: DEMO_WORKSPACE.logoUrl,
  };
}

export function getDemoClients() {
  return [...DEMO_CLIENTS];
}

export function getDemoMembers() {
  return [...DEMO_MEMBERS];
}

function pseudoRandom(seed: number) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function randomBetween(seed: number, min: number, max: number) {
  return Math.floor(pseudoRandom(seed) * (max - min + 1)) + min;
}

function getDateRange(input: MetricsQueryInput) {
  const now = new Date();

  if (input.range === "custom") {
    const from = input.from ? new Date(input.from) : subDays(now, 29);
    const to = input.to ? new Date(input.to) : now;
    const startDate = from <= to ? from : to;
    const endDate = from <= to ? to : from;

    return {
      startDate,
      endDate,
      label: `${startDate.toISOString().slice(0, 10)} - ${endDate.toISOString().slice(0, 10)}`,
    };
  }

  const rangeDays = input.range === "7d" ? 7 : input.range === "30d" ? 30 : 90;
  const startDate = subDays(now, rangeDays - 1);

  return {
    startDate,
    endDate: now,
    label: `${input.range.toUpperCase()}`,
  };
}

function safeDelta(current: number, previous: number) {
  if (previous === 0) {
    return 0;
  }

  return (current - previous) / previous;
}

function calculateSummary(
  points: MetricsResponse["points"],
  activeClients: number,
  previousActiveClients = activeClients,
) {
  const first = points[0];
  const last = points[points.length - 1];

  const firstMrr = first?.mrr ?? 0;
  const lastMrr = last?.mrr ?? 0;
  const firstRetention = first?.retention ?? 0;
  const lastRetention = last?.retention ?? 0;
  const firstChurn = first?.churn ?? 0;
  const lastChurn = last?.churn ?? 0;

  const retentionRate =
    points.length > 0
      ? points.reduce((acc, point) => acc + point.retention, 0) / points.length
      : 0;
  const churnRate =
    points.length > 0
      ? points.reduce((acc, point) => acc + point.churn, 0) / points.length
      : 0;

  return {
    mrr: lastMrr,
    mrrDelta: safeDelta(lastMrr, firstMrr),
    activeClients,
    activeClientsDelta: safeDelta(activeClients, previousActiveClients),
    retentionRate,
    retentionDelta: lastRetention - firstRetention,
    churnRate,
    churnDelta: lastChurn - firstChurn,
  };
}

function buildFunnel(points: MetricsResponse["points"]) {
  const latest = points[points.length - 1];
  const visits = latest?.visits ?? 0;
  const leads = latest?.leads ?? 0;
  const deals = latest?.deals ?? 0;

  return {
    visits,
    leads,
    deals,
    visitToLeadPct: visits > 0 ? leads / visits : 0,
    leadToDealPct: leads > 0 ? deals / leads : 0,
  };
}

function buildCohorts(points: MetricsResponse["points"]) {
  if (points.length === 0) {
    return [];
  }

  const base = points[points.length - 1].retention;

  return Array.from({ length: 6 }).map((_, rowIndex) => {
    const monthOffset = 5 - rowIndex;
    const cohortDate = subDays(new Date(), monthOffset * 30);
    const values = Array.from({ length: 8 }).map((__, colIndex) => {
      const value = base - colIndex * 0.08 - rowIndex * 0.03;
      return Math.max(0, Math.min(1, value));
    });

    return {
      cohort: cohortDate.toISOString().slice(0, 7),
      values,
    };
  });
}

function buildRecentActivity(points: MetricsResponse["points"]) {
  if (points.length === 0) {
    return [];
  }

  return points
    .slice(-6)
    .reverse()
    .map((point, index) => ({
      id: `${point.date}-${index}`,
      message:
        index % 2 === 0
          ? `Actualizacion de KPI diario (${point.date})`
          : `Nuevo cierre de embudo detectado (${point.deals} deals)`,
      timestamp: point.date,
    }));
}

function buildDemoSnapshots(totalDays = 120): DemoSnapshot[] {
  const baseMrr = 22000;

  return Array.from({ length: totalDays }).map((_, index) => {
    const metricDate = subDays(new Date(), totalDays - 1 - index);
    const seed = index + 1;
    const visits = randomBetween(seed * 7, 1200, 3500);
    const leads = Math.round(visits * (randomBetween(seed * 11, 8, 16) / 100));
    const deals = Math.round(leads * (randomBetween(seed * 13, 12, 26) / 100));
    const mrrVariation = randomBetween(seed * 17, -900, 1300);
    const retention = randomBetween(seed * 19, 87, 97) / 100;
    const conversion = leads > 0 ? deals / leads : 0;
    const churn = 1 - retention;

    return {
      metricDate,
      funnelVisits: visits,
      funnelLeads: leads,
      funnelDeals: deals,
      mrr: baseMrr + index * 40 + mrrVariation,
      retentionRate: retention,
      conversionRate: conversion,
      churnRate: churn,
    };
  });
}

const DEMO_SNAPSHOTS = buildDemoSnapshots();

export function getDemoWorkspaceMetrics(input: MetricsQueryInput): MetricsResponse {
  const range = getDateRange(input);

  const snapshots = DEMO_SNAPSHOTS.filter((snapshot) => {
    const metricDate = snapshot.metricDate;
    return metricDate >= range.startDate && metricDate <= range.endDate;
  });

  const points = snapshots.map((snapshot) => ({
    date: snapshot.metricDate.toISOString().slice(0, 10),
    visits: snapshot.funnelVisits,
    leads: snapshot.funnelLeads,
    deals: snapshot.funnelDeals,
    mrr: snapshot.mrr,
    retention: snapshot.retentionRate,
    conversion: snapshot.conversionRate,
    churn: snapshot.churnRate,
  }));

  const activeClients = 1;

  return {
    range: input.range,
    rangeLabel: range.label,
    points,
    summary: calculateSummary(points, activeClients),
    funnel: buildFunnel(points),
    cohorts: buildCohorts(points),
    recentActivity: buildRecentActivity(points),
  };
}
