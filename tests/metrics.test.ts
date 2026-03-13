import test from "node:test";
import assert from "node:assert/strict";
import { calculateSummary, type MetricPoint } from "../src/lib/metrics";

test("calculateSummary computes MRR delta, retention and churn averages", () => {
  const points: MetricPoint[] = [
    {
      date: "2026-03-01",
      visits: 1000,
      leads: 120,
      deals: 20,
      mrr: 10000,
      retention: 0.9,
      conversion: 0.166,
      churn: 0.1,
    },
    {
      date: "2026-03-02",
      visits: 1100,
      leads: 130,
      deals: 24,
      mrr: 12000,
      retention: 0.92,
      conversion: 0.184,
      churn: 0.08,
    },
  ];

  const summary = calculateSummary(points, 8);

  assert.equal(summary.mrr, 12000);
  assert.equal(summary.activeClients, 8);
  assert.equal(summary.mrrDelta, 0.2);
  assert.equal(summary.activeClientsDelta, 0);
  assert.equal(summary.retentionRate, 0.91);
  assert.ok(Math.abs(summary.retentionDelta - 0.02) < 1e-9);
  assert.equal(summary.churnRate, 0.09);
  assert.ok(Math.abs(summary.churnDelta - -0.02) < 1e-9);
});
