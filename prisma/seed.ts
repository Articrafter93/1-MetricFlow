import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { slug: "metricflow-demo" },
    update: {},
    create: {
      name: "MetricFlow Demo Agency",
      slug: "metricflow-demo",
      logoUrl:
        "https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=200&q=80",
    },
  });

  const defaultPasswordHash = await hash("Demo12345!", 10);

  const [owner, manager, client] = await Promise.all([
    prisma.user.upsert({
      where: { email: "owner@metricflow.dev" },
      update: {},
      create: {
        email: "owner@metricflow.dev",
        name: "Owner Demo",
        passwordHash: defaultPasswordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "manager@metricflow.dev" },
      update: {},
      create: {
        email: "manager@metricflow.dev",
        name: "Manager Demo",
        passwordHash: defaultPasswordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "client@metricflow.dev" },
      update: {},
      create: {
        email: "client@metricflow.dev",
        name: "Client Demo",
        passwordHash: defaultPasswordHash,
      },
    }),
  ]);

  await prisma.membership.createMany({
    data: [
      { workspaceId: workspace.id, userId: owner.id, role: Role.OWNER },
      { workspaceId: workspace.id, userId: manager.id, role: Role.MANAGER },
      { workspaceId: workspace.id, userId: client.id, role: Role.CLIENT },
    ],
    skipDuplicates: true,
  });

  const clientAccount = await prisma.clientAccount.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: "Growth Client Alpha",
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "Growth Client Alpha",
      externalId: "gc-alpha-001",
      timezone: "America/Bogota",
    },
  });

  await prisma.metricSnapshot.deleteMany({
    where: { workspaceId: workspace.id, clientAccountId: clientAccount.id },
  });

  const baseMrr = 22000;
  const snapshots = Array.from({ length: 120 }).map((_, index) => {
    const metricDate = subDays(new Date(), 119 - index);
    const visits = randomBetween(1200, 3500);
    const leads = Math.round(visits * (randomBetween(8, 16) / 100));
    const deals = Math.round(leads * (randomBetween(12, 26) / 100));
    const mrrVariation = randomBetween(-900, 1300);
    const retention = randomBetween(87, 97) / 100;
    const conversion = leads > 0 ? deals / leads : 0;
    const churn = 1 - retention;

    return {
      workspaceId: workspace.id,
      clientAccountId: clientAccount.id,
      metricDate,
      granularity: "day",
      funnelVisits: visits,
      funnelLeads: leads,
      funnelDeals: deals,
      mrr: baseMrr + index * 40 + mrrVariation,
      retentionRate: retention,
      conversionRate: conversion,
      churnRate: churn,
    };
  });

  await prisma.metricSnapshot.createMany({ data: snapshots });

  console.log("Seed completed.");
  console.log("Workspace:", workspace.slug);
  console.log("Users:");
  console.log("- owner@metricflow.dev / Demo12345!");
  console.log("- manager@metricflow.dev / Demo12345!");
  console.log("- client@metricflow.dev / Demo12345!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
