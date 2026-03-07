import { Role } from "@prisma/client";

type MockUser = {
  id: string;
  email: string;
  name: string;
  password: string;
  role: Role;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  workspaceLogoUrl?: string | null;
};

const MOCK_USERS: MockUser[] = [
  {
    id: "mock-owner",
    email: "owner@metricflow.dev",
    name: "Owner Demo",
    password: "Demo12345!",
    role: "OWNER",
    workspaceId: "mock-workspace-001",
    workspaceName: "Andromeda Growth",
    workspaceSlug: "andromeda-growth",
    workspaceLogoUrl: null,
  },
  {
    id: "mock-manager",
    email: "manager@metricflow.dev",
    name: "Manager Demo",
    password: "Demo12345!",
    role: "MANAGER",
    workspaceId: "mock-workspace-001",
    workspaceName: "Andromeda Growth",
    workspaceSlug: "andromeda-growth",
    workspaceLogoUrl: null,
  },
  {
    id: "mock-client",
    email: "client@metricflow.dev",
    name: "Client Demo",
    password: "Demo12345!",
    role: "CLIENT",
    workspaceId: "mock-workspace-001",
    workspaceName: "Andromeda Growth",
    workspaceSlug: "andromeda-growth",
    workspaceLogoUrl: null,
  },
];

export function getMockUserByEmail(email: string) {
  return MOCK_USERS.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
  );
}

export function getMockUserById(userId: string) {
  return MOCK_USERS.find((user) => user.id === userId);
}

export function getMockMembershipByUserId(userId: string) {
  const user = getMockUserById(userId);
  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    workspaceId: user.workspaceId,
    workspaceName: user.workspaceName,
    workspaceSlug: user.workspaceSlug,
    workspaceLogoUrl: user.workspaceLogoUrl ?? null,
  };
}

export function getMockTeamMembers() {
  return MOCK_USERS.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));
}

