import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("tenant APIs enforce tenant context and scoped workspace queries", () => {
  const metricsRoute = read("src/app/api/tenants/[tenantSlug]/metrics/live/route.ts");
  const clientsRoute = read("src/app/api/tenants/[tenantSlug]/clients/route.ts");
  const reportsRoute = read("src/app/api/tenants/[tenantSlug]/reports/pdf/route.ts");
  const settingsRoute = read(
    "src/app/api/tenants/[tenantSlug]/settings/workspace/route.ts",
  );

  assert.match(metricsRoute, /requireTenantApiContext/);
  assert.match(clientsRoute, /requireTenantApiContext/);
  assert.match(reportsRoute, /requireTenantApiContext/);
  assert.match(settingsRoute, /requireTenantApiContext/);

  assert.match(clientsRoute, /workspaceId:\s*tenantContext\.workspaceId/);
  assert.match(reportsRoute, /getWorkspaceMetrics\(tenantContext\.workspaceId/);
  assert.match(settingsRoute, /id:\s*tenantContext\.workspaceId/);
});
