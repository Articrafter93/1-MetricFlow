import type { Role } from "@prisma/client";
import { ReactNode } from "react";
import { type Permission, hasRequiredPermission } from "@/lib/rbac";

type RequireRoleProps = {
  role: Role | undefined;
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
};

export function RequireRole({
  role,
  permission,
  children,
  fallback = null,
}: RequireRoleProps) {
  if (!hasRequiredPermission(role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
