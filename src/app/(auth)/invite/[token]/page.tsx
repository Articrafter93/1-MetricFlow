import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { DEMO_WORKSPACE, isDemoMode } from "@/lib/demo-mode";
import { prisma } from "@/lib/db";

type InvitePageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ accept?: string }>;
};

export default async function InvitePage({ params, searchParams }: InvitePageProps) {
  const { token } = await params;
  const { accept } = await searchParams;

  if (isDemoMode() && token.startsWith("demo-")) {
    const session = await getAuthSession();
    if (accept === "1" && session?.user?.id) {
      redirect(`/${DEMO_WORKSPACE.slug}/dashboard`);
    }

    return (
      <div className="auth-bg flex min-h-screen items-center justify-center px-4">
        <section className="glass-panel w-full max-w-lg p-6">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary"
          >
            Volver al inicio
          </Link>
          <h1 className="text-xl font-semibold text-text-primary">Invitacion demo</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Esta invitacion pertenece al workspace demo de MetricFlow y esta lista para
            mostrar la experiencia completa en Vercel.
          </p>
          <Link
            href={`/login?invite=${token}`}
            className="mt-4 inline-block rounded-lg border border-accent bg-accent/10 px-4 py-2 text-sm text-text-primary"
          >
            Iniciar sesion para aceptar
          </Link>
        </section>
      </div>
    );
  }

  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invite || invite.expiresAt < new Date()) {
    return (
      <div className="auth-bg flex min-h-screen items-center justify-center px-4">
        <section className="glass-panel w-full max-w-lg p-6">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary"
          >
            Volver al inicio
          </Link>
          <h1 className="text-xl font-semibold text-text-primary">Invitacion no valida</h1>
          <p className="mt-2 text-sm text-text-secondary">
            El enlace expiro o ya no existe. Solicita una nueva invitacion al owner del workspace.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-lg border border-accent bg-accent/10 px-4 py-2 text-sm text-text-primary"
          >
            Volver a login
          </Link>
        </section>
      </div>
    );
  }

  const session = await getAuthSession();
  if (
    accept === "1" &&
    session?.user?.id &&
    session.user.email &&
    session.user.email.toLowerCase() === invite.email.toLowerCase()
  ) {
    await prisma.membership.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: invite.workspaceId,
          userId: session.user.id,
        },
      },
      update: { role: invite.role },
      create: {
        workspaceId: invite.workspaceId,
        userId: session.user.id,
        role: invite.role,
      },
    });

    await prisma.teamInvite.update({
      where: { token: invite.token },
      data: { acceptedAt: new Date() },
    });

    redirect(`/${invite.workspace.slug}/dashboard`);
  }

  return (
    <div className="auth-bg flex min-h-screen items-center justify-center px-4">
      <section className="glass-panel w-full max-w-lg p-6">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary"
        >
          Volver al inicio
        </Link>
        <h1 className="text-xl font-semibold text-text-primary">Invitacion a workspace</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Fuiste invitado a <strong>{invite.workspace.name}</strong> como{" "}
          <strong>{invite.role}</strong>.
        </p>
        <p className="mt-2 text-sm text-text-secondary">Email invitado: {invite.email}</p>
        <Link
          href={`/login?invite=${token}`}
          className="mt-4 inline-block rounded-lg border border-accent bg-accent/10 px-4 py-2 text-sm text-text-primary"
        >
          Iniciar sesion para aceptar
        </Link>
      </section>
    </div>
  );
}
