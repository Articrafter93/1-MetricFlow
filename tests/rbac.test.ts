import test from "node:test";
import assert from "node:assert/strict";
import { Role } from "@prisma/client";
import { hasPermission } from "../src/lib/rbac";

test("RBAC matrix enforces Owner/Manager/Client constraints", () => {
  assert.equal(hasPermission(Role.OWNER, "workspaceSettings", "manage"), true);
  assert.equal(hasPermission(Role.MANAGER, "workspaceSettings", "manage"), false);
  assert.equal(hasPermission(Role.CLIENT, "workspaceSettings", "manage"), false);

  assert.equal(hasPermission(Role.CLIENT, "workspaceSettings", "view"), false);

  assert.equal(hasPermission(Role.OWNER, "team", "invite"), true);
  assert.equal(hasPermission(Role.MANAGER, "team", "invite"), false);
  assert.equal(hasPermission(Role.CLIENT, "team", "invite"), false);

  assert.equal(hasPermission(Role.OWNER, "reports", "export"), true);
  assert.equal(hasPermission(Role.MANAGER, "reports", "export"), true);
  assert.equal(hasPermission(Role.CLIENT, "reports", "export"), false);

  assert.equal(hasPermission(Role.OWNER, "billingInternal", "view"), true);
  assert.equal(hasPermission(Role.MANAGER, "billingInternal", "view"), false);
  assert.equal(hasPermission(Role.CLIENT, "billingInternal", "view"), false);

  assert.equal(hasPermission(Role.OWNER, "workspaceSettings", "view"), true);
  assert.equal(hasPermission(Role.OWNER, "team", "view"), true);
  assert.equal(hasPermission(Role.OWNER, "clients", "manage"), true);
  assert.equal(hasPermission(Role.OWNER, "reports", "view"), true);
});
