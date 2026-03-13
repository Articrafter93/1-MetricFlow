import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

test("auth config uses database session only when magic-link provider is configured", () => {
  const authPath = path.resolve(process.cwd(), "src/lib/auth.ts");
  const source = readFileSync(authPath, "utf8");
  assert.match(source, /const sessionStrategy = hasMagicLinkProvider \? "database" : "jwt"/);
  assert.match(source, /strategy:\s*sessionStrategy/);
});
