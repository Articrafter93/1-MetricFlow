import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const criticalPaths = [
  "src/app/page.tsx",
  "src/app/(auth)/login/page.tsx",
  "src/app/(auth)/invite/[token]/page.tsx",
  "src/app/(app)/[tenantSlug]/dashboard/page.tsx",
  "src/app/(app)/[tenantSlug]/analytics/page.tsx",
  "src/app/(app)/[tenantSlug]/clients/page.tsx",
  "src/app/(app)/[tenantSlug]/reports/page.tsx",
  "src/app/(app)/[tenantSlug]/settings/team/page.tsx",
  "src/app/(app)/[tenantSlug]/settings/workspace/page.tsx",
  "src/app/privacidad/page.tsx",
];

const missing = [];

for (const relativePath of criticalPaths) {
  try {
    await access(join(root, relativePath), constants.R_OK);
  } catch {
    missing.push(relativePath);
  }
}

if (missing.length > 0) {
  console.error("Smoke failed. Missing critical routes:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Smoke passed. Critical routes are present.");

