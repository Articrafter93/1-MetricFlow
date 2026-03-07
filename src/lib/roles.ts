import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  CLIENT: "Client",
};

const roleWeight: Record<Role, number> = {
  OWNER: 3,
  MANAGER: 2,
  CLIENT: 1,
};

export function hasMinimumRole(role: Role | undefined, minimum: Role): boolean {
  if (!role) {
    return false;
  }
  return roleWeight[role] >= roleWeight[minimum];
}
