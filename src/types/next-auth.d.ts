import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
  }

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
