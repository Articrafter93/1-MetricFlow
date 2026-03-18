import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AppRedirectPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.workspaceSlug && session.user.workspaceId) {
    redirect(`/${session.user.workspaceSlug}/dashboard`);
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    redirect("/login?error=no-workspace");
  }

  redirect(`/${membership.workspace.slug}/dashboard`);
}
