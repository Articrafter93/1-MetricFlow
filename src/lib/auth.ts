import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import { z } from "zod";
import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const resolvedAuthSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV !== "production" ? "metricflow-dev-secret" : undefined);

const hasMagicLinkProvider = Boolean(
  process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM,
);

const sessionStrategy = hasMagicLinkProvider ? "database" : "jwt";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
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
    async session({ session, user }) {
      const userId = user?.id ?? session.user?.id;
      if (!session.user || !userId) {
        return session;
      }

      session.user.id = userId;

      const membership = await prisma.membership.findFirst({
        where: { userId },
        include: { workspace: true },
        orderBy: { createdAt: "asc" },
      });

      session.user.role = membership?.role;
      session.user.workspaceId = membership?.workspaceId;
      session.user.workspaceSlug = membership?.workspace.slug;
      session.user.workspaceName = membership?.workspace.name;

      return session;
    },
  },
  secret: resolvedAuthSecret,
};

const nextAuth = NextAuth(authConfig);

export const { auth, handlers, signIn, signOut } = nextAuth;

export async function getAuthSession() {
  return auth();
}
