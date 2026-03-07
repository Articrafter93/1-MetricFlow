import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role?: Role;
      workspaceId?: string;
      workspaceSlug?: string;
      workspaceName?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: Role;
    workspaceId?: string;
    workspaceSlug?: string;
    workspaceName?: string;
  }
}
