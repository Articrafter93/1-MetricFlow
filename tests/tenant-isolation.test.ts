import assert from "node:assert/strict";
import test from "node:test";
import { prisma } from "../src/lib/db";
import { MetricsAccessError, getWorkspaceMetrics } from "../src/lib/metrics";

type CountArgs = {
  where?: {
    id?: string;
    workspaceId?: string;
  };
};

type FindManyArgs = {
  where?: {
    workspaceId?: string;
    clientAccountId?: string;
  };
};

test("getWorkspaceMetrics blocks clientId from another tenant", async () => {
  const clientAccountDelegate = prisma.clientAccount as unknown as {
    count: (args: CountArgs) => Promise<number>;
  };
  const metricSnapshotDelegate = prisma.metricSnapshot as unknown as {
    findMany: (args: FindManyArgs) => Promise<unknown[]>;
  };

  const originalCount = clientAccountDelegate.count;
  const originalFindMany = metricSnapshotDelegate.findMany;
  let findManyCalls = 0;

  clientAccountDelegate.count = async () => 0;
  metricSnapshotDelegate.findMany = async () => {
    findManyCalls += 1;
    return [];
  };

  try {
    await assert.rejects(
      () => getWorkspaceMetrics("workspace-a", { range: "30d", clientId: "client-b" }),
      (error: unknown) => {
        assert.equal(error instanceof MetricsAccessError, true);
        if (error instanceof MetricsAccessError) {
          assert.equal(error.status, 403);
        }
        return true;
      },
    );

    assert.equal(findManyCalls, 0);
  } finally {
    clientAccountDelegate.count = originalCount;
    metricSnapshotDelegate.findMany = originalFindMany;
  }
});

test("getWorkspaceMetrics keeps workspace scope and returns empty state without mock fallback", async () => {
  const clientAccountDelegate = prisma.clientAccount as unknown as {
    count: (args: CountArgs) => Promise<number>;
  };
  const metricSnapshotDelegate = prisma.metricSnapshot as unknown as {
    findMany: (args: FindManyArgs) => Promise<unknown[]>;
  };

  const originalCount = clientAccountDelegate.count;
  const originalFindMany = metricSnapshotDelegate.findMany;
  let capturedFindManyArgs: FindManyArgs | null = null;

  clientAccountDelegate.count = async () => 1;
  metricSnapshotDelegate.findMany = async (args) => {
    capturedFindManyArgs = args;
    return [];
  };

  try {
    const response = await getWorkspaceMetrics("workspace-a", {
      range: "30d",
      clientId: "client-a",
    });

    assert.equal(response.points.length, 0);
    assert.equal(response.cohorts.length, 0);
    assert.equal(response.recentActivity.length, 0);
    assert.equal(capturedFindManyArgs?.where?.workspaceId, "workspace-a");
    assert.equal(capturedFindManyArgs?.where?.clientAccountId, "client-a");
  } finally {
    clientAccountDelegate.count = originalCount;
    metricSnapshotDelegate.findMany = originalFindMany;
  }
});
