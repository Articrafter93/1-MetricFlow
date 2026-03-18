import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

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

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: Role;
    workspaceId?: string;
    workspaceSlug?: string;
    workspaceName?: string;
  }
}
