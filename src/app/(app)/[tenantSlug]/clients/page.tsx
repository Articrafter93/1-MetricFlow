import { prisma } from "@/lib/db";
import { ClientsPanel } from "@/components/clients-panel";
import { requireTenantPageContext } from "@/lib/tenant-context";

type ClientsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function ClientsPage({ params }: ClientsPageProps) {
  const { tenantSlug } = await params;
  const context = await requireTenantPageContext(tenantSlug, {
    resource: "clients",
    action: "view",
  });

  const clients = await prisma.clientAccount.findMany({
    where: { workspaceId: context.workspaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      timezone: true,
      createdAt: true,
    },
  });

  return (
    <ClientsPanel
      tenantSlug={tenantSlug}
      role={context.role}
      initialClients={clients.map((client) => ({
        ...client,
        createdAt: client.createdAt.toISOString(),
      }))}
    />
  );
}

