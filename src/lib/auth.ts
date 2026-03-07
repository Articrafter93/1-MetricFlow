import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";
import { compare } from "bcryptjs";
import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getMockMembershipByUserId, getMockUserByEmail } from "@/lib/mock-data";
import { isMockDatabaseEnabled } from "@/lib/runtime-mode";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  ...(isMockDatabaseEnabled() ? {} : { adapter: PrismaAdapter(prisma) }),
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        if (isMockDatabaseEnabled()) {
          const mockUser = getMockUserByEmail(parsed.data.email);
          if (!mockUser || parsed.data.password !== mockUser.password) {
            return null;
          }

          return {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
          };
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
          },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValidPassword = await compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;

        if (isMockDatabaseEnabled()) {
          const membership = getMockMembershipByUserId(user.id);
          token.role = membership?.role;
          token.workspaceId = membership?.workspaceId;
          token.workspaceSlug = membership?.workspaceSlug;
          token.workspaceName = membership?.workspaceName;
        } else {
          const membership = await prisma.membership.findFirst({
            where: { userId: user.id },
            include: { workspace: true },
            orderBy: { createdAt: "asc" },
          });

          token.role = membership?.role;
          token.workspaceId = membership?.workspaceId;
          token.workspaceSlug = membership?.workspace.slug;
          token.workspaceName = membership?.workspace.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as Role | undefined;
        session.user.workspaceId = token.workspaceId as string | undefined;
        session.user.workspaceSlug = token.workspaceSlug as string | undefined;
        session.user.workspaceName = token.workspaceName as string | undefined;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}
