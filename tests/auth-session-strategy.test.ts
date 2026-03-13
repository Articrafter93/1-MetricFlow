import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

test("auth config uses database session strategy", () => {
  const authPath = path.resolve(process.cwd(), "src/lib/auth.ts");
  const source = readFileSync(authPath, "utf8");
  assert.match(source, /strategy:\s*"database"/);
});
