import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/dashboard-shell";
import { ReportExport } from "@/components/report-export";
import { ROLE_LABELS } from "@/lib/roles";
import { requireWorkspaceContext } from "@/lib/workspace";

export default async function ReportsPage() {
  const context = await requireWorkspaceContext();
  const canExport = context.role === Role.OWNER || context.role === Role.MANAGER;

  return (
    <DashboardShell
      workspaceName={context.workspaceName}
      roleLabel={ROLE_LABELS[context.role]}
    >
      {canExport ? (
        <ReportExport />
      ) : (
        <section className="glass-panel p-4">
          <h2 className="text-lg font-semibold">Reportes automatizados</h2>
          <p className="mt-2 text-sm text-slate-300">
            El rol Client solo puede visualizar metricas y no puede exportar reportes.
          </p>
        </section>
      )}
    </DashboardShell>
  );
}
