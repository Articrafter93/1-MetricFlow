import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import NextAuth, { type NextAuthConfig, type User as NextAuthUser } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import { z } from "zod";
import { getDemoAuthUser, getDemoUserProfileById, isDemoMode } from "@/lib/demo-mode";
import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const resolvedAuthSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV !== "production" ? "metricflow-dev-secret" : undefined);

function hasEnvValue(value: string | undefined) {
  if (!value) {
    return false;
  }

  const normalized = value.replace(/^"(.*)"$/, "$1").trim();
  return normalized.length > 0;
}

const hasMagicLinkProvider = Boolean(
  hasEnvValue(process.env.SMTP_HOST) &&
    hasEnvValue(process.env.SMTP_PORT) &&
    hasEnvValue(process.env.SMTP_USER) &&
    hasEnvValue(process.env.SMTP_PASS) &&
    hasEnvValue(process.env.MAIL_FROM),
);

const sessionStrategy = isDemoMode() || !hasMagicLinkProvider ? "jwt" : "database";
const adapter = hasMagicLinkProvider ? PrismaAdapter(prisma) : undefined;

async function getPrimaryMembership(userId: string) {
  return prisma.membership.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });
}

export const authConfig: NextAuthConfig = {
  adapter,
  trustHost: true,
  session: {
    strategy: sessionStrategy,
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?check-email=1",
  },
  providers: [
    ...(hasMagicLinkProvider
      ? [
          Email({
            server: {
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT),
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            },
            from: process.env.MAIL_FROM,
          }),
        ]
      : []),
    Credentials({
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

        const demoUser = isDemoMode()
          ? getDemoAuthUser(parsed.data.email, parsed.data.password)
          : null;
        if (demoUser) {
          return demoUser as unknown as NextAuthUser;
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

        const isValidPassword = await compare(parsed.data.password, user.passwordHash);
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
      const userId = user?.id ?? token.sub;
      if (!userId) {
        return token;
      }

      token.sub = userId;

      const demoProfile = isDemoMode() ? getDemoUserProfileById(userId) : null;
      if (demoProfile) {
        token.role = demoProfile.role;
        token.workspaceId = demoProfile.workspaceId;
        token.workspaceSlug = demoProfile.workspaceSlug;
        token.workspaceName = demoProfile.workspaceName;
        token.workspaceLogoUrl = demoProfile.workspaceLogoUrl;
        return token;
      }

      const enrichedUser = user as
        | (NextAuthUser & {
            role?: typeof token.role;
            workspaceId?: string;
            workspaceSlug?: string;
            workspaceName?: string;
            workspaceLogoUrl?: string | null;
          })
        | undefined;

      if (enrichedUser?.workspaceId) {
        token.role = enrichedUser.role;
        token.workspaceId = enrichedUser.workspaceId;
        token.workspaceSlug = enrichedUser.workspaceSlug;
        token.workspaceName = enrichedUser.workspaceName;
        token.workspaceLogoUrl = enrichedUser.workspaceLogoUrl;
        return token;
      }

      const membership = await getPrimaryMembership(userId);
      token.role = membership?.role;
      token.workspaceId = membership?.workspaceId;
      token.workspaceSlug = membership?.workspace.slug;
      token.workspaceName = membership?.workspace.name;
      token.workspaceLogoUrl = membership?.workspace.logoUrl ?? null;

      return token;
    },
    async session({ session, user, token }) {
      const userId = user?.id ?? token?.sub ?? session.user?.id;
      if (!session.user || !userId) {
        return session;
      }

      session.user.id = userId;

      if (
        token?.role ||
        token?.workspaceId ||
        token?.workspaceSlug ||
        token?.workspaceName ||
        token?.workspaceLogoUrl
      ) {
        session.user.role = token.role;
        session.user.workspaceId = token.workspaceId;
        session.user.workspaceSlug = token.workspaceSlug;
        session.user.workspaceName = token.workspaceName;
        session.user.workspaceLogoUrl = token.workspaceLogoUrl ?? null;
        return session;
      }

      const demoProfile = isDemoMode() ? getDemoUserProfileById(userId) : null;
      if (demoProfile) {
        session.user.role = demoProfile.role;
        session.user.workspaceId = demoProfile.workspaceId;
        session.user.workspaceSlug = demoProfile.workspaceSlug;
        session.user.workspaceName = demoProfile.workspaceName;
        session.user.workspaceLogoUrl = demoProfile.workspaceLogoUrl;
        return session;
      }

      const membership = await getPrimaryMembership(userId);

      session.user.role = membership?.role;
      session.user.workspaceId = membership?.workspaceId;
      session.user.workspaceSlug = membership?.workspace.slug;
      session.user.workspaceName = membership?.workspace.name;
      session.user.workspaceLogoUrl = membership?.workspace.logoUrl ?? null;

      return session;
    },
  },
  secret: resolvedAuthSecret ?? (isDemoMode() ? "metricflow-demo-secret" : undefined),
};

const nextAuth = NextAuth(authConfig);

export const { auth, handlers, signIn, signOut } = nextAuth;

export async function getAuthSession() {
  return auth();
}
