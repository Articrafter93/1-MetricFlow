import { Role } from "@prisma/client";

export type RbacResource =
  | "dashboard"
  | "analytics"
  | "clients"
  | "reports"
  | "team"
  | "workspaceSettings";

export type RbacAction = "view" | "manage" | "invite" | "export";

const RBAC_POLICY: Record<RbacResource, Partial<Record<RbacAction, Role[]>>> = {
  dashboard: {
    view: [Role.OWNER, Role.MANAGER, Role.CLIENT],
  },
  analytics: {
    view: [Role.OWNER, Role.MANAGER, Role.CLIENT],
  },
  clients: {
    view: [Role.OWNER, Role.MANAGER, Role.CLIENT],
    manage: [Role.OWNER, Role.MANAGER],
  },
  reports: {
    view: [Role.OWNER, Role.MANAGER, Role.CLIENT],
    export: [Role.OWNER, Role.MANAGER],
  },
  team: {
    view: [Role.OWNER, Role.MANAGER],
    invite: [Role.OWNER],
    manage: [Role.OWNER],
  },
  workspaceSettings: {
    view: [Role.OWNER],
    manage: [Role.OWNER],
  },
};

export function hasPermission(
  role: Role | undefined,
  resource: RbacResource,
  action: RbacAction,
) {
  if (!role) {
    return false;
  }

  const allowedRoles = RBAC_POLICY[resource][action];
  return !!allowedRoles?.includes(role);
}

