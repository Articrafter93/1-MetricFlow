import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { z } from "zod";
import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?check-email=1",
  },
  providers: [
    ...(process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM
      ? [
          EmailProvider({
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
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        const membership = await prisma.membership.findFirst({
          where: { userId: user.id },
          include: { workspace: true },
          orderBy: { createdAt: "asc" },
        });

        session.user.role = membership?.role;
        session.user.workspaceId = membership?.workspaceId;
        session.user.workspaceSlug = membership?.workspace.slug;
        session.user.workspaceName = membership?.workspace.name;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}
